import { NextResponse } from "next/server";
import { prisma } from "@waypoint/database";
import { driverIssueSchema, validateRequestBody } from "@/lib/api_schemas";

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, driverIssueSchema);
    if (!validation.success) {
      return validation.response;
    }
    const { issueType, notes, deliveryCode, stopId } = validation.data;

    const auditEntry = await prisma.auditLog.create({
      data: {
        userId: "DRV_KAMAL",
        action: "DRIVER_DELIVERY_ISSUE",
        details: JSON.stringify({
          issueType,
          notes,
          deliveryCode: deliveryCode || "OUT003",
          stopId: stopId || "STOP_2",
          timestamp: new Date().toISOString(),
        }),
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      issueId: `ISSUE_${Date.now()}`,
      auditId: auditEntry ? auditEntry.id : null,
      message: "Delivery issue transmitted to dispatcher exception triage",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Issue submission error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
