import { NextResponse } from 'next/server';
import { IN_MEMORY_FLEET_TELEMETRY } from '@/lib/agent_tools';

export interface MapBreadcrumb {
  x: number;
  y: number;
  opacity: number;
}

export interface MapVehicle {
  id: string;
  name: string;
  code: string;
  driverName: string;
  routeId: string;
  chassis: 'truck' | 'truck_freezer' | 'van_freezer';
  chassisLabel: string;
  markerType: 'rect' | 'circle';
  color: string;
  x: number;
  y: number;
  completedStops: number;
  totalStops: number;
  isOnline: boolean;
  statusText: string;
  speedKmH: number;
  location: string;
  chilledTempC?: number;
  frozenTempC?: number;
  coldChainStatus: 'nominal' | 'warning' | 'breach';
  breadcrumbs: MapBreadcrumb[];
  stops: {
    stopNumber: number;
    outletCode: string;
    outletName: string;
    status: 'Delivered' | 'Pending' | 'EnRoute';
    eta: string;
  }[];
}

const baseFleetVehicles: MapVehicle[] = [
  {
    id: 'VEH037',
    name: 'VEH037',
    code: '037',
    driverName: 'Kamal Silva',
    routeId: 'R025229',
    chassis: 'van_freezer',
    chassisLabel: 'Van + Freezer',
    markerType: 'circle',
    color: '#16a34a',
    x: 272,
    y: 186,
    completedStops: 2,
    totalStops: 4,
    isOnline: true,
    statusText: 'Kamal Silva · 2/4 stops',
    speedKmH: 36,
    location: 'Kadugannawa Pass (Route R025229)',
    chilledTempC: 3.4,
    frozenTempC: -19.2,
    coldChainStatus: 'nominal',
    breadcrumbs: [
      { x: 190, y: 190, opacity: 0.25 },
      { x: 220, y: 188, opacity: 0.5 },
      { x: 248, y: 187, opacity: 0.75 },
    ],
    stops: [
      { stopNumber: 1, outletCode: 'OUT001', outletName: 'Fresh Galle Rd', status: 'Delivered', eta: '05:45 SLST' },
      { stopNumber: 2, outletCode: 'OUT003', outletName: 'Peradeniya Store', status: 'Delivered', eta: '06:35 SLST' },
      { stopNumber: 3, outletCode: 'OUT004', outletName: 'Kandy Mall', status: 'Pending', eta: '07:15 SLST' },
      { stopNumber: 4, outletCode: 'OUT008', outletName: 'Katugastota', status: 'Pending', eta: '07:50 SLST' },
    ],
  },
  {
    id: 'VEH004',
    name: 'VEH004',
    code: '004',
    driverName: 'Niroshan Bandara',
    routeId: 'R025210',
    chassis: 'truck_freezer',
    chassisLabel: 'Truck + Freezer',
    markerType: 'rect',
    color: '#ef4444',
    x: 96,
    y: 188,
    completedStops: 0,
    totalStops: 5,
    isOnline: true,
    statusText: 'Loading · Bay 04 Shortfall',
    speedKmH: 0,
    location: 'Peliyagoda Loading Dock Bay 04',
    chilledTempC: 5.8,
    frozenTempC: -17.8,
    coldChainStatus: 'breach',
    breadcrumbs: [
      { x: 70, y: 192, opacity: 0.4 },
      { x: 84, y: 190, opacity: 0.7 },
    ],
    stops: [
      { stopNumber: 1, outletCode: 'OUT005', outletName: 'Peliyagoda Hub', status: 'EnRoute', eta: '06:30 SLST' },
      { stopNumber: 2, outletCode: 'OUT006', outletName: 'Wattala Express', status: 'Pending', eta: '07:10 SLST' },
      { stopNumber: 3, outletCode: 'OUT007', outletName: 'Ja Ela Super', status: 'Pending', eta: '07:45 SLST' },
    ],
  },
  {
    id: 'VEH002',
    name: 'VEH002',
    code: '002',
    driverName: 'Dinesh Priyantha',
    routeId: 'R025214',
    chassis: 'van_freezer',
    chassisLabel: 'Van + Freezer',
    markerType: 'circle',
    color: '#16a34a',
    x: 176,
    y: 232,
    completedStops: 4,
    totalStops: 4,
    isOnline: false,
    statusText: 'Dinesh · 4/4 done',
    speedKmH: 0,
    location: 'Dehiwala Outlet Depot',
    chilledTempC: 2.8,
    frozenTempC: -18.5,
    coldChainStatus: 'nominal',
    breadcrumbs: [
      { x: 120, y: 220, opacity: 0.3 },
      { x: 148, y: 226, opacity: 0.6 },
    ],
    stops: [
      { stopNumber: 1, outletCode: 'OUT002', outletName: 'Duplication Rd', status: 'Delivered', eta: '05:15 SLST' },
      { stopNumber: 2, outletCode: 'OUT009', outletName: 'Bambalapitiya', status: 'Delivered', eta: '05:50 SLST' },
      { stopNumber: 3, outletCode: 'OUT010', outletName: 'Wellawatte', status: 'Delivered', eta: '06:20 SLST' },
      { stopNumber: 4, outletCode: 'OUT011', outletName: 'Dehiwala', status: 'Delivered', eta: '06:55 SLST' },
    ],
  },
  {
    id: 'VEH001',
    name: 'VEH001',
    code: '001',
    driverName: 'Sunil Mendis',
    routeId: 'R025208',
    chassis: 'truck',
    chassisLabel: 'Dry Truck',
    markerType: 'rect',
    color: '#64748b',
    x: 416,
    y: 192,
    completedStops: 3,
    totalStops: 6,
    isOnline: true,
    statusText: 'Sunil Mendis · 3/6 stops',
    speedKmH: 48,
    location: 'Peliyagoda Expressway Corridor',
    coldChainStatus: 'nominal',
    breadcrumbs: [
      { x: 330, y: 188, opacity: 0.3 },
      { x: 365, y: 190, opacity: 0.55 },
      { x: 395, y: 191, opacity: 0.8 },
    ],
    stops: [
      { stopNumber: 1, outletCode: 'OUT012', outletName: 'Kelaniya', status: 'Delivered', eta: '05:20 SLST' },
      { stopNumber: 2, outletCode: 'OUT013', outletName: 'Kiribathgoda', status: 'Delivered', eta: '05:55 SLST' },
      { stopNumber: 3, outletCode: 'OUT014', outletName: 'Kadawatha', status: 'Delivered', eta: '06:30 SLST' },
      { stopNumber: 4, outletCode: 'OUT015', outletName: 'Gampaha', status: 'EnRoute', eta: '07:15 SLST' },
    ],
  },
  {
    id: 'VEH003',
    name: 'VEH003',
    code: '003',
    driverName: 'Kamal Perera',
    routeId: 'R025218',
    chassis: 'truck_freezer',
    chassisLabel: 'Truck + Freezer',
    markerType: 'rect',
    color: '#377a8b',
    x: 544,
    y: 198,
    completedStops: 1,
    totalStops: 5,
    isOnline: true,
    statusText: 'Kamal Perera · 1/5 stops',
    speedKmH: 34,
    location: 'Kandy Road Kadawatha',
    chilledTempC: 3.4,
    frozenTempC: -18.2,
    coldChainStatus: 'nominal',
    breadcrumbs: [
      { x: 470, y: 194, opacity: 0.25 },
      { x: 500, y: 196, opacity: 0.5 },
      { x: 526, y: 197, opacity: 0.75 },
    ],
    stops: [
      { stopNumber: 1, outletCode: 'OUT016', outletName: 'Nittambuwa', status: 'Delivered', eta: '06:00 SLST' },
      { stopNumber: 2, outletCode: 'OUT017', outletName: 'Waragoda', status: 'EnRoute', eta: '06:45 SLST' },
    ],
  },
  {
    id: 'VEH005',
    name: 'VEH005',
    code: '005',
    driverName: 'Anura Kumara',
    routeId: 'R025225',
    chassis: 'truck_freezer',
    chassisLabel: 'Truck + Freezer',
    markerType: 'rect',
    color: '#377a8b',
    x: 624,
    y: 128,
    completedStops: 0,
    totalStops: 4,
    isOnline: true,
    statusText: 'Planned · Trip 2',
    speedKmH: 0,
    location: 'Peliyagoda Depot Staging',
    chilledTempC: 3.1,
    frozenTempC: -18.8,
    coldChainStatus: 'nominal',
    breadcrumbs: [],
    stops: [
      { stopNumber: 1, outletCode: 'OUT018', outletName: 'Avissawella', status: 'Pending', eta: '08:00 SLST' },
    ],
  },
];

export async function GET() {
  // Merge live dynamic telemetry from telemetry store
  const enrichedVehicles = baseFleetVehicles.map((v) => {
    // Map VEH003 to TRK002 in telemetry
    if (v.id === 'VEH003' && IN_MEMORY_FLEET_TELEMETRY.TRK002) {
      const live = IN_MEMORY_FLEET_TELEMETRY.TRK002;
      return {
        ...v,
        speedKmH: live.speedKmH,
        location: live.location,
        chilledTempC: live.chilledTempC ?? v.chilledTempC,
        coldChainStatus: live.coldChainStatus,
        color: live.coldChainStatus === 'breach' ? '#ef4444' : v.color,
        statusText:
          live.coldChainStatus === 'breach'
            ? 'Critical Temp Breach · 6.2 C'
            : v.statusText,
      };
    }

    // Map VEH001 to TRK001 in telemetry
    if (v.id === 'VEH001' && IN_MEMORY_FLEET_TELEMETRY.TRK001) {
      const live = IN_MEMORY_FLEET_TELEMETRY.TRK001;
      return {
        ...v,
        speedKmH: live.speedKmH,
        location: live.location,
        statusText: live.speedKmH === 0 ? 'Immobilized on Expressway' : v.statusText,
      };
    }

    return v;
  });

  return NextResponse.json({
    corridorName: 'Colombo Coastal and Hill Country Corridor',
    timestamp: new Date().toISOString(),
    vehicles: enrichedVehicles,
  });
}
