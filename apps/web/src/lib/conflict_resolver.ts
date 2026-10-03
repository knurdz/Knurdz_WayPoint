export interface ClientRecord {
  id: string;
  deliveryCode: string;
  action: "POD_CAPTURE" | "ISSUE_REPORT" | "STATUS_TRANSITION";
  timestamp: string;
  signatureData?: string | null;
  photoCaptured?: boolean;
  receiverName?: string;
  status?: string;
}

export interface ServerRecord {
  deliveryCode: string;
  serverStatus: "PENDING" | "DEFERRED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  serverTimestamp: string;
  deferralReason?: string;
}

export interface ConflictResult {
  deliveryCode: string;
  resolvedStatus: string;
  resolutionSource: "CLIENT_POD_OVERRIDE" | "SERVER_DEFERRAL_AUTHORITY" | "CONVERGED";
  explanation: string;
}

export function resolveSyncConflict(
  client: ClientRecord,
  server?: ServerRecord
): ConflictResult {
  if (!server) {
    return {
      deliveryCode: client.deliveryCode,
      resolvedStatus: client.status || "DELIVERED",
      resolutionSource: "CONVERGED",
      explanation: "No conflicting server record found; local client update accepted",
    };
  }

  if (server.serverStatus === "DEFERRED") {
    if (client.action === "POD_CAPTURE" && (client.signatureData || client.photoCaptured)) {
      return {
        deliveryCode: client.deliveryCode,
        resolvedStatus: "DELIVERED",
        resolutionSource: "CLIENT_POD_OVERRIDE",
        explanation: "Physical delivery verified by customer proof; field signature overrides central deferral",
      };
    }

    return {
      deliveryCode: client.deliveryCode,
      resolvedStatus: "DEFERRED",
      resolutionSource: "SERVER_DEFERRAL_AUTHORITY",
      explanation: "Central deferral sustained; proof of delivery was incomplete or missing customer signature",
    };
  }

  if (client.action === "POD_CAPTURE") {
    return {
      deliveryCode: client.deliveryCode,
      resolvedStatus: "DELIVERED",
      resolutionSource: "CLIENT_POD_OVERRIDE",
      explanation: "Standard delivery execution successfully recorded",
    };
  }

  return {
    deliveryCode: client.deliveryCode,
    resolvedStatus: server.serverStatus,
    resolutionSource: "CONVERGED",
    explanation: "Server state aligned with incoming mobile telemetry",
  };
}
