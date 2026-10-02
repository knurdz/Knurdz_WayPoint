export interface OfflinePod {
  id: string;
  deliveryCode: string;
  receiverName: string;
  verifiedQty: boolean;
  photoCaptured: boolean;
  signatureData: string | null;
  timestamp: string;
  synced: boolean;
}

export interface OfflineStop {
  id: string;
  seq: number;
  deliveryCode: string;
  outletCode: string;
  outletName: string;
  status: "Delivered" | "In Transit" | "Pending";
  updatedAt: string;
}

export interface TempReading {
  id: string;
  vehicleId: string;
  frozenTempC: number;
  chilledTempC: number;
  timestamp: string;
  synced: boolean;
}

const DB_NAME = "WaypointDriverDB";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available in current environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("pendingPods")) {
        db.createObjectStore("pendingPods", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("offlineStops")) {
        db.createObjectStore("offlineStops", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("tempTelemetry")) {
        db.createObjectStore("tempTelemetry", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflinePod(pod: Omit<OfflinePod, "id" | "synced">): Promise<OfflinePod> {
  const db = await openDB();
  const fullPod: OfflinePod = {
    ...pod,
    id: `POD_OFFLINE_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    synced: false,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction("pendingPods", "readwrite");
    const store = tx.objectStore("pendingPods");
    const req = store.put(fullPod);

    req.onsuccess = () => resolve(fullPod);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingPods(): Promise<OfflinePod[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("pendingPods", "readonly");
      const store = tx.objectStore("pendingPods");
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function markPodSynced(podId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pendingPods", "readwrite");
    const store = tx.objectStore("pendingPods");
    const getReq = store.get(podId);

    getReq.onsuccess = () => {
      const data = getReq.result;
      if (data) {
        data.synced = true;
        store.put(data);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function logTempReading(vehicleId: string, frozenTempC: number, chilledTempC: number): Promise<TempReading> {
  const db = await openDB();
  const reading: TempReading = {
    id: `TEMP_${Date.now()}`,
    vehicleId,
    frozenTempC,
    chilledTempC,
    timestamp: new Date().toISOString(),
    synced: false,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction("tempTelemetry", "readwrite");
    const store = tx.objectStore("tempTelemetry");
    const req = store.put(reading);

    req.onsuccess = () => resolve(reading);
    req.onerror = () => reject(req.error);
  });
}

export async function getUnsyncedTempLogs(): Promise<TempReading[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("tempTelemetry", "readonly");
      const store = tx.objectStore("tempTelemetry");
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}
