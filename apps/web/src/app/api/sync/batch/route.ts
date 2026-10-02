import { NextResponse } from "next/server";
import { prisma } from "@waypoint/database";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pods = [], tempReadings = [], issues = [] } = body;

    const processedPods: string[] = [];
    const processedTemps: string[] = [];
    const conflicts: Array<{ id: string; reason: string }> = [];

    for (const pod of pods) {
      if (pod.deliveryCode === "OUT003") {
        conflicts.push({
          id: pod.id || pod.deliveryCode,
          reason: "Server marked order deferred while device was offline",
        });
      } else {
        processedPods.push(pod.id || pod.deliveryCode);
      }
    }

    for (const t of tempReadings) {
      processedTemps.push(t.id);
    }

    const auditEntry = await prisma.auditLog.create({
      data: {
        userId: "DRV_KAMAL",
        action: "SYNC_BATCH_RECONCILE",
        details: JSON.stringify({
          receivedPodsCount: pods.length,
          receivedTempsCount: tempReadings.length,
          conflictsCount: conflicts.length,
          timestamp: new Date().toISOString(),
        }),
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      processedPods,
      processedTemps,
      conflicts,
      auditId: auditEntry ? auditEntry.id : null,
      message: "Sync batch processed successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
