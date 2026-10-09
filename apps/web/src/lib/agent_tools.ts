import { COPILOT_KNOWLEDGE_BASE } from './copilot_kb';

export interface VehicleTelemetry {
  id: string;
  chassis: 'truck' | 'truck_freezer' | 'van' | 'van_freezer';
  driver: string;
  location: string;
  latitude: number;
  longitude: number;
  speedKmH: number;
  chilledTempC?: number;
  frozenTempC?: number;
  coldChainStatus: 'nominal' | 'warning' | 'breach';
  assignedOrders: number;
  completedStops: number;
  totalStops: number;
  departureTime: string;
  estimatedReturnTime: string;
}

export interface ColdChainAlert {
  vehicleId: string;
  driver: string;
  outletId: string;
  outletName: string;
  compartment: 'chilled' | 'frozen';
  currentTempC: number;
  thresholdC: number;
  severity: 'critical' | 'warning';
  durationMinutes: number;
  status: string;
}

export interface DeliverySummary {
  totalOrders: number;
  confirmedOrders: number;
  pendingDeferrals: number;
  completedDeliveries: number;
  inTransitOrders: number;
  unassignedOrders: number;
  activeVehicles: number;
  hubBreakdown: {
    peliyagodaHub: number;
    kandyTerminal: number;
  };
}

export interface CutoffStatus {
  cutoffTime: string;
  timeZone: string;
  minutesRemaining: number;
  status: 'normal' | 'urgent' | 'closed';
  pendingReviews: number;
  lockoutActive: boolean;
}

export interface DriverManifest {
  driverId: string;
  driverName: string;
  vehicleId: string;
  assignedRoute: string;
  stopsTotal: number;
  stopsCompleted: number;
  nextOutlet: string;
  podSignaturesCollected: number;
  activeIssuesReported: number;
}

// In memory telemetry snapshot for instant sub 15ms lookups
export const IN_MEMORY_FLEET_TELEMETRY: Record<string, VehicleTelemetry> = {
  TRK001: {
    id: 'TRK001',
    chassis: 'truck_freezer',
    driver: 'Sunil Shantha',
    location: 'Peliyagoda Expressway Corridor',
    latitude: 6.9642,
    longitude: 79.8984,
    speedKmH: 48,
    chilledTempC: 2.1,
    frozenTempC: -18.6,
    coldChainStatus: 'nominal',
    assignedOrders: 8,
    completedStops: 3,
    totalStops: 6,
    departureTime: '04:15 SLST',
    estimatedReturnTime: '14:30 SLST',
  },
  TRK002: {
    id: 'TRK002',
    chassis: 'truck_freezer',
    driver: 'Kamal Perera',
    location: 'Kandy Road Kadawatha',
    latitude: 7.0015,
    longitude: 79.9521,
    speedKmH: 34,
    chilledTempC: 3.4,
    frozenTempC: -18.2,
    coldChainStatus: 'nominal',
    assignedOrders: 10,
    completedStops: 4,
    totalStops: 7,
    departureTime: '04:40 SLST',
    estimatedReturnTime: '15:15 SLST',
  },
  TRK004: {
    id: 'TRK004',
    chassis: 'truck_freezer',
    driver: 'Anura Bandara',
    location: 'Kollupitiya Galle Road',
    latitude: 6.8992,
    longitude: 79.8519,
    speedKmH: 18,
    chilledTempC: 5.8,
    frozenTempC: -17.8,
    coldChainStatus: 'breach',
    assignedOrders: 7,
    completedStops: 2,
    totalStops: 5,
    departureTime: '05:10 SLST',
    estimatedReturnTime: '13:50 SLST',
  },
  VAN001: {
    id: 'VAN001',
    chassis: 'van',
    driver: 'Nimal Silva',
    location: 'Pettah Commercial Zone',
    latitude: 6.9365,
    longitude: 79.8512,
    speedKmH: 12,
    coldChainStatus: 'nominal',
    assignedOrders: 14,
    completedStops: 8,
    totalStops: 12,
    departureTime: '06:00 SLST',
    estimatedReturnTime: '14:00 SLST',
  },
  VAN002: {
    id: 'VAN002',
    chassis: 'van_freezer',
    driver: 'Ruwan Jayasuriya',
    location: 'Kandy Peradeniya Bypass',
    latitude: 7.2714,
    longitude: 80.5982,
    speedKmH: 28,
    frozenTempC: -14.2,
    coldChainStatus: 'warning',
    assignedOrders: 6,
    completedStops: 2,
    totalStops: 4,
    departureTime: '05:30 SLST',
    estimatedReturnTime: '12:45 SLST',
  },
};

export const IN_MEMORY_COLD_CHAIN_ALERTS: ColdChainAlert[] = [
  {
    vehicleId: 'TRK004',
    driver: 'Anura Bandara',
    outletId: 'OUT001',
    outletName: 'Colombo Superstore Bay 1',
    compartment: 'chilled',
    currentTempC: 5.8,
    thresholdC: 4.0,
    severity: 'critical',
    durationMinutes: 14,
    status: 'Compressor cycle anomaly detected. Urgent inspection recommended.',
  },
  {
    vehicleId: 'VAN002',
    driver: 'Ruwan Jayasuriya',
    outletId: 'OUT003',
    outletName: 'Kandy Central Superstore',
    compartment: 'frozen',
    currentTempC: -14.2,
    thresholdC: -18.0,
    severity: 'warning',
    durationMinutes: 8,
    status: 'Freezer temperature above mandatory threshold of minus 18 degrees Celsius.',
  },
];

export const IN_MEMORY_DELIVERY_SUMMARY: DeliverySummary = {
  totalOrders: 142,
  confirmedOrders: 138,
  pendingDeferrals: 4,
  completedDeliveries: 52,
  inTransitOrders: 82,
  unassignedOrders: 8,
  activeVehicles: 32,
  hubBreakdown: {
    peliyagodaHub: 28,
    kandyTerminal: 4,
  },
};

export const IN_MEMORY_DRIVERS: Record<string, DriverManifest> = {
  DRV001: {
    driverId: 'DRV001',
    driverName: 'Sunil Shantha',
    vehicleId: 'TRK001',
    assignedRoute: 'Route 01 Peliyagoda to Negombo Corridor',
    stopsTotal: 6,
    stopsCompleted: 3,
    nextOutlet: 'OUT002 Negombo Distribution Depot',
    podSignaturesCollected: 3,
    activeIssuesReported: 0,
  },
  DRV002: {
    driverId: 'DRV002',
    driverName: 'Kamal Perera',
    vehicleId: 'TRK002',
    assignedRoute: 'Route 02 Kadawatha to Nittambuwa',
    stopsTotal: 7,
    stopsCompleted: 4,
    nextOutlet: 'OUT005 Yakkala Retail Store',
    podSignaturesCollected: 4,
    activeIssuesReported: 0,
  },
  DRV004: {
    driverId: 'DRV004',
    driverName: 'Anura Bandara',
    vehicleId: 'TRK004',
    assignedRoute: 'Route 04 Colombo Central Metro',
    stopsTotal: 5,
    stopsCompleted: 2,
    nextOutlet: 'OUT001 Colombo Superstore',
    podSignaturesCollected: 2,
    activeIssuesReported: 1,
  },
};

export function getVehicleTelemetry(vehicleId?: string): {
  spokenReply: string;
  data: VehicleTelemetry | VehicleTelemetry[];
} {
  if (vehicleId) {
    const normalized = vehicleId.toUpperCase().replace(/[\s\-_]/g, '');
    const found = IN_MEMORY_FLEET_TELEMETRY[normalized];
    if (found) {
      const chilledSpeech = found.chilledTempC !== undefined ? `Chilled chamber is at ${found.chilledTempC} degrees Celsius. ` : '';
      const frozenSpeech = found.frozenTempC !== undefined ? `Freezer is at ${found.frozenTempC} degrees Celsius. ` : '';
      const breachSpeech = found.coldChainStatus === 'breach' ? 'Warning: Cold chain breach active! ' : found.coldChainStatus === 'warning' ? 'Caution: Cold chain warning active. ' : 'Cold chain is nominal. ';

      const spokenReply = `Vehicle ${found.id} driven by ${found.driver} is at ${found.location} travelling at ${found.speedKmH} kilometres per hour. ${chilledSpeech}${frozenSpeech}${breachSpeech}Completed ${found.completedStops} of ${found.totalStops} assigned delivery stops.`;

      return { spokenReply, data: found };
    }
  }

  const all = Object.values(IN_MEMORY_FLEET_TELEMETRY);
  const spokenReply = `Tracking ${all.length} primary fleet units. TRK 001 is nominal at Peliyagoda. TRK 004 has an active cold chain alert at Kollupitiya with 5.8 degrees Celsius.`;
  return { spokenReply, data: all };
}

export function getColdChainAlerts(): {
  spokenReply: string;
  data: ColdChainAlert[];
} {
  const alerts = IN_MEMORY_COLD_CHAIN_ALERTS;
  if (alerts.length === 0) {
    return {
      spokenReply: 'All active refrigerated vehicles are operating within certified temperature thresholds. Zero cold chain breaches detected.',
      data: [],
    };
  }

  const critical = alerts.filter((a) => a.severity === 'critical');
  const spokenReply = `Attention: There are ${alerts.length} active cold chain alerts. Critical alert on vehicle ${critical[0].vehicleId} driven by ${critical[0].driver} serving ${critical[0].outletName}. Current temperature is ${critical[0].currentTempC} degrees Celsius exceeding the mandatory ${critical[0].thresholdC} degree limit.`;

  return { spokenReply, data: alerts };
}

export function getActiveDeliveriesSummary(): {
  spokenReply: string;
  data: DeliverySummary;
} {
  const s = IN_MEMORY_DELIVERY_SUMMARY;
  const spokenReply = `Today operations summary: ${s.totalOrders} total orders with ${s.confirmedOrders} confirmed and ${s.pendingDeferrals} pending deferrals. ${s.completedDeliveries} deliveries are completed, ${s.inTransitOrders} are currently in transit, and ${s.activeVehicles} vehicles are active across Peliyagoda and Kandy.`;
  return { spokenReply, data: s };
}

export function getCutoffStatus(): {
  spokenReply: string;
  data: CutoffStatus;
} {
  const now = new Date();
  const cutoffHour = 16;
  const cutoffMinute = 0;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = cutoffHour * 60 + cutoffMinute;
  const minutesRemaining = Math.max(0, targetMinutes - currentMinutes);

  const data: CutoffStatus = {
    cutoffTime: '16:00 SLST',
    timeZone: 'Asia/Colombo',
    minutesRemaining,
    status: minutesRemaining <= 30 ? 'urgent' : 'normal',
    pendingReviews: 4,
    lockoutActive: minutesRemaining === 0,
  };

  const hours = Math.floor(minutesRemaining / 60);
  const mins = minutesRemaining % 60;
  const spokenReply = `Today cutoff deadline is 16:00 Sri Lanka Standard Time. ${hours > 0 ? `${hours} hours and ` : ''}${mins} minutes remaining until automated plan publication. 4 late orders are currently pending review in the deferral desk.`;

  return { spokenReply, data };
}

export function getDriverManifestStatus(driverIdOrName?: string): {
  spokenReply: string;
  data: DriverManifest | DriverManifest[];
} {
  if (driverIdOrName) {
    const q = driverIdOrName.toLowerCase();
    const found = Object.values(IN_MEMORY_DRIVERS).find(
      (d) => d.driverId.toLowerCase().includes(q) || d.driverName.toLowerCase().includes(q)
    );
    if (found) {
      const spokenReply = `Driver ${found.driverName} on ${found.vehicleId} has completed ${found.stopsCompleted} of ${found.stopsTotal} stops. Next delivery is ${found.nextOutlet}. ${found.podSignaturesCollected} proof of delivery signatures collected.`;
      return { spokenReply, data: found };
    }
  }

  const all = Object.values(IN_MEMORY_DRIVERS);
  const spokenReply = `Monitoring ${all.length} dispatched drivers. Sunil Shantha has completed 3 of 6 stops on Route 01. Kamal Perera has completed 4 of 7 stops on Route 02.`;
  return { spokenReply, data: all };
}

export function getRuleExplanation(ruleQuery: string): {
  spokenReply: string;
  data: unknown;
} {
  const lower = ruleQuery.toLowerCase();
  const match = COPILOT_KNOWLEDGE_BASE.find(
    (item) =>
      item.id.toLowerCase().includes(lower) ||
      item.title.toLowerCase().includes(lower) ||
      item.keywords.some((k) => lower.includes(k.toLowerCase()))
  );

  if (match) {
    const spokenReply = `${match.title}. ${match.details}`;
    return { spokenReply, data: match };
  }

  return {
    spokenReply: 'Waypoint enforces 14 hard feasibility rules covering payload capacities, volume limits, mall security windows, driver hours, and cold chain thresholds.',
    data: null,
  };
}

export function executeVoiceTool(query: string): {
  matched: boolean;
  toolName?: string;
  spokenReply?: string;
  telemetryData?: unknown;
  action?: {
    id: string;
    label: string;
    href: string;
    description: string;
    status: string;
  };
} {
  const q = query.toLowerCase();

  // 1. Vehicle Telemetry & Location
  if (
    q.includes('trk') ||
    q.includes('van') ||
    q.includes('temperature') ||
    q.includes('speed') ||
    q.includes('where is truck') ||
    q.includes('where is vehicle') ||
    q.includes('truck 1') ||
    q.includes('truck 001') ||
    q.includes('truck 4') ||
    q.includes('truck 004')
  ) {
    let vehicleId: string | undefined;
    if (q.includes('trk001') || q.includes('trk 001') || q.includes('truck 1') || q.includes('truck 001')) vehicleId = 'TRK001';
    else if (q.includes('trk002') || q.includes('trk 002') || q.includes('truck 2') || q.includes('truck 002')) vehicleId = 'TRK002';
    else if (q.includes('trk004') || q.includes('trk 004') || q.includes('truck 4') || q.includes('truck 004')) vehicleId = 'TRK004';
    else if (q.includes('van001') || q.includes('van 1') || q.includes('van 001')) vehicleId = 'VAN001';
    else if (q.includes('van002') || q.includes('van 2') || q.includes('van 002')) vehicleId = 'VAN002';

    const res = getVehicleTelemetry(vehicleId);
    return {
      matched: true,
      toolName: 'get_vehicle_telemetry',
      spokenReply: res.spokenReply,
      telemetryData: res.data,
      action: {
        id: 'map',
        label: 'Fleet Live Map',
        href: '/dispatcher/map',
        description: 'Open real time GPS vehicle tracking and sensor telemetry map.',
        status: 'Opened Fleet Live Map',
      },
    };
  }

  // 2. Cold Chain Alerts & Breaches
  if (
    q.includes('cold chain') ||
    q.includes('freezer breach') ||
    q.includes('chilled breach') ||
    q.includes('temperature breach') ||
    q.includes('spoiled') ||
    q.includes('cooling alert')
  ) {
    const res = getColdChainAlerts();
    return {
      matched: true,
      toolName: 'get_cold_chain_alerts',
      spokenReply: res.spokenReply,
      telemetryData: res.data,
      action: {
        id: 'exceptions',
        label: 'Exceptions',
        href: '/dispatcher/exceptions',
        description: 'Triage active cold chain temperature alerts and vehicle incidents.',
        status: 'Opened Cold Chain Exceptions',
      },
    };
  }

  // 3. Active Deliveries & Orders Summary
  if (
    q.includes('how many orders') ||
    q.includes('deliveries today') ||
    q.includes('order summary') ||
    q.includes('orders today') ||
    q.includes('delivery status') ||
    q.includes('how many deliveries')
  ) {
    const res = getActiveDeliveriesSummary();
    return {
      matched: true,
      toolName: 'get_active_deliveries_summary',
      spokenReply: res.spokenReply,
      telemetryData: res.data,
      action: {
        id: 'queue',
        label: 'Order Queue',
        href: '/dispatcher/queue',
        description: 'Navigate to today orders queue and run assignments.',
        status: 'Opened Order Queue',
      },
    };
  }

  // 4. Cutoff Clock & Countdown
  if (
    q.includes('cutoff') ||
    q.includes('deadline') ||
    q.includes('how much time left') ||
    q.includes('16:00') ||
    q.includes('late orders')
  ) {
    const res = getCutoffStatus();
    return {
      matched: true,
      toolName: 'get_cutoff_status',
      spokenReply: res.spokenReply,
      telemetryData: res.data,
      action: {
        id: 'cutoff',
        label: 'Cutoff Control',
        href: '/dispatcher/cutoff',
        description: 'Review 16:00 SLST countdown and approve late order deferrals.',
        status: 'Opened Cutoff Control',
      },
    };
  }

  // 5. Driver Manifests & POD Signatures
  if (
    q.includes('driver') ||
    q.includes('sunil') ||
    q.includes('kamal') ||
    q.includes('proof of delivery') ||
    q.includes('pod signature') ||
    q.includes('manifest')
  ) {
    const res = getDriverManifestStatus(q);
    return {
      matched: true,
      toolName: 'get_driver_manifest_status',
      spokenReply: res.spokenReply,
      telemetryData: res.data,
      action: {
        id: 'driver',
        label: 'Driver Cockpit',
        href: '/driver',
        description: 'Inspect active driver manifests and proof of delivery captures.',
        status: 'Opened Driver Cockpit',
      },
    };
  }

  // 6. Rules R01 to R14
  if (
    q.includes('rule') ||
    q.includes('r01') ||
    q.includes('r02') ||
    q.includes('r06') ||
    q.includes('r08') ||
    q.includes('r14') ||
    q.includes('payload limit') ||
    q.includes('bay constraint')
  ) {
    const res = getRuleExplanation(q);
    return {
      matched: true,
      toolName: 'get_rule_explanation',
      spokenReply: res.spokenReply,
      telemetryData: res.data,
      action: {
        id: 'validator',
        label: 'Constraint Validator',
        href: '/dispatcher/validator',
        description: 'Inspect live allocation rules and constraints in the validator.',
        status: 'Opened Validator',
      },
    };
  }

  return { matched: false };
}

export function resetTelemetryState(): void {
  if (IN_MEMORY_FLEET_TELEMETRY.TRK001) {
    IN_MEMORY_FLEET_TELEMETRY.TRK001.speedKmH = 48;
    IN_MEMORY_FLEET_TELEMETRY.TRK001.location = 'Peliyagoda Expressway Corridor';
  }
  if (IN_MEMORY_FLEET_TELEMETRY.TRK002) {
    IN_MEMORY_FLEET_TELEMETRY.TRK002.speedKmH = 34;
    IN_MEMORY_FLEET_TELEMETRY.TRK002.location = 'Kandy Road Kadawatha';
    IN_MEMORY_FLEET_TELEMETRY.TRK002.chilledTempC = 3.4;
    IN_MEMORY_FLEET_TELEMETRY.TRK002.coldChainStatus = 'nominal';
  }
  const removeIndex = IN_MEMORY_COLD_CHAIN_ALERTS.findIndex((a) => a.vehicleId === 'TRK002');
  if (removeIndex !== -1) {
    IN_MEMORY_COLD_CHAIN_ALERTS.splice(removeIndex, 1);
  }
}
