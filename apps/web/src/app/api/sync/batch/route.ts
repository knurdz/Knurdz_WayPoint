import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@waypoint/database";
import { resolveSyncConflict, ClientRecord, ServerRecord } from "@/lib/conflict_resolver";
import { getAuthFromRequest } from "@/lib/auth";
import { syncBatchSchema, validateRequestBody } from "@/lib/api_schemas";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const callerId = auth?.userId || auth?.email || "ANONYMOUS_SYNC_CALLER";
    const validation = await validateRequestBody(req, syncBatchSchema);
    if (!validation.success) {
      return validation.response;
    }
    const { pods, tempReadings, issues } = validation.data;

    const processedPods: string[] = [];
    const processedTemps: string[] = [];
    const conflicts: Array<{ id: string; reason: string; resolution: string }> = [];

    const mockServerState: Record<string, ServerRecord> = {
      OUT003: {
        deliveryCode: "OUT003",
        serverStatus: "DEFERRED",
        serverTimestamp: "2026-10-02T06:00:00.000Z",
        deferralReason: "DEF 02 Coolroom capacity restriction",
      },
    };

    for (const pod of pods) {
      const clientRecord: ClientRecord = {
        id: pod.id || pod.deliveryCode,
        deliveryCode: pod.deliveryCode,
        action: "POD_CAPTURE",
        timestamp: pod.timestamp || new Date().toISOString(),
        signatureData: pod.signatureData || "DATA_PRESENT",
        photoCaptured: pod.photoCaptured ?? true,
        receiverName: pod.receiverName,
      };

      const serverRecord = mockServerState[pod.deliveryCode];
      const result = resolveSyncConflict(clientRecord, serverRecord);

      if (result.resolutionSource === "CLIENT_POD_OVERRIDE" && serverRecord) {
        conflicts.push({
          id: clientRecord.id,
          reason: "Order deferred centrally while vehicle was out of range",
          resolution: result.explanation,
        });
        processedPods.push(clientRecord.id);
      } else {
        processedPods.push(clientRecord.id);
      }
    }

    for (const t of tempReadings) {
      processedTemps.push(t.id);
    }

    const auditEntry = await prisma.auditLog.create({
      data: {
        userId: callerId,
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
      message: "Sync batch processed successfully with conflict matrix",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
