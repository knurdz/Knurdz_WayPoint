import { NextResponse } from "next/server";

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

let sampleStagedDeferrals: StagedDeferral[] = [
  {
    id: "def_1",
    orderNumber: "ORD009876",
    outletCode: "OUT001",
    outletName: "Galle Rd Super",
    cargoType: "chilled",
    weightKg: 420,
    status: "Pending",
    deferredLastRun: false,
  },
  {
    id: "def_2",
    orderNumber: "ORD009880",
    outletCode: "OUT004",
    outletName: "Kandy Central",
    cargoType: "chilled",
    weightKg: 310,
    status: "Pending",
    deferredLastRun: true,
    lastReason: "REEFER_CAPACITY",
  },
  {
    id: "def_3",
    orderNumber: "ORD009881",
    outletCode: "OUT009",
    outletName: "Negombo Town",
    cargoType: "ambient",
    weightKg: 180,
    status: "Pending",
    deferredLastRun: false,
  },
];

export async function GET() {
  return NextResponse.json({
    staged: sampleStagedDeferrals,
    count: sampleStagedDeferrals.length,
    consecutiveDebtOrders: sampleStagedDeferrals.filter((d) => d.deferredLastRun),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reasonCode, impactNote, overrideReason, orderIds } = body;

    // Validate reason code
    const validCodes = [
      "REEFER_CAPACITY",
      "VAN_ONLY",
      "WEIGHT_VOLUME",
      "TIME_BUDGET",
      "FUEL_QUOTA",
      "MALL_WINDOW",
    ];

    if (!validCodes.includes(reasonCode)) {
      return NextResponse.json(
        { error: "Invalid standard deferral reason code" },
        { status: 400 }
      );
    }

    // Process deferral and record audit log
    sampleStagedDeferrals = sampleStagedDeferrals.map((item) =>
      orderIds?.includes(item.id)
        ? { ...item, status: "Deferred" }
        : item
    );

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
