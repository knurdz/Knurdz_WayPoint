import { NextResponse } from "next/server";
import { prisma } from "@waypoint/database";
import { driverIssueSchema, validateRequestBody } from "@/lib/api_schemas";
import { addIncident } from "@/lib/incidentsStore";

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, driverIssueSchema);
    if (!validation.success) {
      return validation.response;
    }
    const { issueType, notes, deliveryCode, stopId } = validation.data;

    const issueCode = `INC_${Date.now().toString().slice(-4)}`;
    addIncident({
      id: `inc_driver_${Date.now()}`,
      code: issueCode,
      type: issueType.toLowerCase().includes('window') ? 'window' : 'sync',
      severity: issueType.toLowerCase().includes('blocked') ? 'high' : 'medium',
      title: `${issueType} at ${deliveryCode || 'En Route'}`,
      description: notes || `Driver reported ${issueType} at stop ${stopId || 'active'}`,
      vehicleId: 'VEH037',
      routeId: 'R025229',
      outletId: deliveryCode || 'OUT003',
      status: 'OPEN',
      timestamp: `${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} SLST`,
    });

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
      issueId: issueCode,
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
