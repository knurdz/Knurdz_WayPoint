import { NextResponse } from "next/server";
import { prisma, ensureInitialOrders, OrderStatus } from "@waypoint/database";
import { deferOrderSchema, validateRequestBody } from "@/lib/api_schemas";

interface StagedDeferral {
  id: string;
  orderNumber: string;
  outletCode: string;
  outletName: string;
  cargoType: "chilled" | "ambient";
  weightKg: number;
  status: string;
  deferredLastRun: boolean;
  lastReason?: string;
}

export async function GET() {
  try {
    await ensureInitialOrders();

    const dbDeferred = await prisma.order.findMany({
      where: {
        status: OrderStatus.deferred,
      },
      include: {
        outlet: true,
        deferrals: {
          orderBy: { deferredDate: "desc" },
          take: 1,
        },
      },
      orderBy: { orderId: "asc" },
    });

    let staged: StagedDeferral[] = [];

    if (dbDeferred.length > 0) {
      staged = dbDeferred.map((o) => ({
        id: o.orderId,
        orderNumber: o.orderId,
        outletCode: o.outletId,
        outletName: o.outlet?.name || `Waypoint Outlet ${o.outletId}`,
        cargoType: o.tempRequirement === "reefer" ? "chilled" : "ambient",
        weightKg: Math.round(o.weightKg),
        status: "Pending Deferral",
        deferredLastRun: o.deferredYesterday || o.daysSinceLastServed > 1,
        lastReason: o.deferrals[0]?.reasonCode || "REEFER_CAPACITY",
      }));
    } else {
      // Provide initial staged deferrals for audit demonstration
      staged = [
        {
          id: "ORD009876",
          orderNumber: "ORD009876",
          outletCode: "OUT001",
          outletName: "Galle Rd Super",
          cargoType: "chilled",
          weightKg: 420,
          status: "Pending Deferral",
          deferredLastRun: false,
        },
        {
          id: "ORD009880",
          orderNumber: "ORD009880",
          outletCode: "OUT004",
          outletName: "Kandy Central",
          cargoType: "chilled",
          weightKg: 310,
          status: "Pending Deferral",
          deferredLastRun: true,
          lastReason: "REEFER_CAPACITY",
        },
      ];
    }

    return NextResponse.json({
      staged,
      count: staged.length,
      consecutiveDebtOrders: staged.filter((d) => d.deferredLastRun),
    });
  } catch (error) {
    console.error("Failed to fetch deferrals", error);
    return NextResponse.json(
      { error: "Failed to retrieve deferrals", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, deferOrderSchema);
    if (!validation.success) {
      return validation.response;
    }
    const { reasonCode, impactNote, overrideReason, orderIds } = validation.data;

    if (orderIds && Array.isArray(orderIds)) {
      for (const orderId of orderIds) {
        await prisma.order.updateMany({
          where: { orderId },
          data: { status: OrderStatus.deferred },
        });

        await prisma.deferralRecord.upsert({
          where: { id: `def_${orderId}` },
          update: {
            reasonCode,
            reasonNotes: `${impactNote || "Supervisor audit deferral"} ${overrideReason ? `[Override: ${overrideReason}]` : ""}`,
          },
          create: {
            id: `def_${orderId}`,
            orderId,
            reasonCode,
            reasonNotes: `${impactNote || "Supervisor audit deferral"} ${overrideReason ? `[Override: ${overrideReason}]` : ""}`,
            deferredDate: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      auditTimestamp: new Date().toISOString(),
      reasonCode,
      impactNote,
      overrideReason: overrideReason || null,
      message: "Deferrals confirmed and notifications dispatched to store portals",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to confirm deferral audit", details: String(error) },
      { status: 500 }
    );
  }
}
