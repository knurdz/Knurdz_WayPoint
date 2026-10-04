import { NextResponse } from 'next/server';
import { prisma, ensureInitialOrders, StopStatus } from '@waypoint/database';
import { getVehicleResolvedPosition, getOutletLocation, DEPOT_COORDINATES } from '@/lib/geo_telemetry';

export interface MapBreadcrumb {
  lat: number;
  lng: number;
  x?: number;
  y?: number;
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
  lat: number;
  lng: number;
  x: number;
  y: number;
  heading: number;
  telemetrySource: 'LIVE_GPS' | 'PREDICTIVE_INTERPOLATION';
  telemetryBadge: string;
  completedStops: number;
  totalStops: number;
  isOnline: boolean;
  statusText: string;
  speedKmH: number;
  location: string;
  chilledTempC?: number;
  frozenTempC?: number;
  coldChainStatus: 'nominal' | 'warning' | 'breach';
  hasFridge: boolean;
  loadStatus: 'empty' | 'half' | 'full';
  loadPct: number;
  weightKg: number;
  maxWeightKg: number;
  breadcrumbs: MapBreadcrumb[];
  stops: {
    stopNumber: number;
    outletCode: string;
    outletName: string;
    status: 'Delivered' | 'Pending' | 'EnRoute';
    eta: string;
    lat: number;
    lng: number;
  }[];
}

export async function GET() {
  try {
    await ensureInitialOrders();

    const trips = await prisma.trip.findMany({
      include: {
        stops: {
          include: {
            outlet: true,
            order: true,
            podRecords: true,
          },
          orderBy: { stopSequence: 'asc' },
        },
        vehicle: true,
      },
      orderBy: { tripId: 'asc' },
    });

    // Static metadata for vehicles
    const vehicleMeta: Record<
      string,
      {
        driverName: string;
        chassis: 'truck' | 'truck_freezer' | 'van_freezer';
        chassisLabel: string;
        color: string;
        chilledTempC?: number;
        frozenTempC?: number;
        coldChainStatus: 'nominal' | 'warning' | 'breach';
        depot: string;
      }
    > = {
      VEH037: {
        driverName: 'Kamal Silva',
        chassis: 'van_freezer',
        chassisLabel: 'Van + Freezer',
        color: '#16a34a',
        chilledTempC: 3.4,
        frozenTempC: -19.2,
        coldChainStatus: 'nominal',
        depot: 'Peliyagoda',
      },
      VEH004: {
        driverName: 'Niroshan Bandara',
        chassis: 'truck_freezer',
        chassisLabel: 'Truck + Freezer',
        color: '#377a8b',
        chilledTempC: 4.1,
        frozenTempC: -18.5,
        coldChainStatus: 'nominal',
        depot: 'Peliyagoda',
      },
      VEH001: {
        driverName: 'Sunil Mendis',
        chassis: 'truck',
        chassisLabel: 'Dry Truck',
        color: '#64748b',
        depot: 'Kandy',
        coldChainStatus: 'nominal',
      },
      VEH002: {
        driverName: 'Dinesh Priyantha',
        chassis: 'van_freezer',
        chassisLabel: 'Van + Freezer',
        color: '#16a34a',
        chilledTempC: 2.8,
        frozenTempC: -18.5,
        coldChainStatus: 'nominal',
        depot: 'Peliyagoda',
      },
      VEH003: {
        driverName: 'Kamal Perera',
        chassis: 'truck_freezer',
        chassisLabel: 'Truck + Freezer',
        color: '#377a8b',
        chilledTempC: 3.4,
        frozenTempC: -18.2,
        coldChainStatus: 'nominal',
        depot: 'Peliyagoda',
      },
      VEH005: {
        driverName: 'Anura Kumara',
        chassis: 'truck_freezer',
        chassisLabel: 'Truck + Freezer',
        color: '#377a8b',
        chilledTempC: 3.1,
        frozenTempC: -18.8,
        coldChainStatus: 'nominal',
        depot: 'Peliyagoda',
      },
    };

    const targetVehicles = ['VEH037', 'VEH004', 'VEH001', 'VEH002', 'VEH003', 'VEH005'];

    const formattedVehicles: MapVehicle[] = targetVehicles.map((vId) => {
      const trip = trips.find((t) => t.vehicleId === vId);
      const meta = vehicleMeta[vId] || {
        driverName: 'Fleet Driver',
        chassis: 'van_freezer' as const,
        chassisLabel: 'Van + Freezer',
        color: '#16a34a',
        coldChainStatus: 'nominal' as const,
        depot: 'Peliyagoda',
      };

      const routeStops =
        trip?.stops.map((s) => ({
          outletId: s.outletId,
          district: s.outlet?.district,
        })) || [
          { outletId: 'OUT001', district: 'Colombo' },
          { outletId: 'OUT002', district: 'Colombo' },
          { outletId: 'OUT003', district: 'Colombo' },
        ];

      // Resolve real position via Live GPS or Predictive Route Interpolation
      const pos = getVehicleResolvedPosition(vId, meta.depot, routeStops);

      const stopsData = routeStops.map((rs, idx) => {
        const outletLoc = getOutletLocation(rs.outletId, rs.district);
        const stopEntity = trip?.stops[idx];
        const isDelivered =
          stopEntity?.status === StopStatus.completed ||
          (stopEntity?.podRecords && stopEntity.podRecords.length > 0);
        const isEnRoute = stopEntity?.status === StopStatus.en_route || (!isDelivered && idx === 0);

        let statusStr: 'Delivered' | 'Pending' | 'EnRoute' = 'Pending';
        if (isDelivered) statusStr = 'Delivered';
        else if (isEnRoute) statusStr = 'EnRoute';

        return {
          stopNumber: idx + 1,
          outletCode: rs.outletId,
          outletName: stopEntity?.outlet?.name || `Waypoint ${rs.outletId}`,
          status: statusStr,
          eta: stopEntity?.plannedArrival ? `${stopEntity.plannedArrival} SLST` : '06:15 SLST',
          lat: outletLoc.lat,
          lng: outletLoc.lng,
        };
      });

      const completedStops = stopsData.filter((s) => s.status === 'Delivered').length;
      const totalStops = stopsData.length;

      // Projecting lat/lng to legacy 800x420 canvas for backward-compatible SVG stage
      // Colombo/Kandy bounding box: lat ~ 6.8 to 7.4 -> y: 360 to 60; lng ~ 79.8 to 80.7 -> x: 80 to 720
      const normX = Math.max(0, Math.min(1, (pos.lng - 79.8) / 0.9));
      const normY = Math.max(0, Math.min(1, (7.35 - pos.lat) / 0.55));
      const legacyX = Math.round(80 + normX * 640);
      const legacyY = Math.round(50 + normY * 320);

      const depotCoords = DEPOT_COORDINATES[meta.depot] || DEPOT_COORDINATES['Peliyagoda'];
      const breadcrumbs: MapBreadcrumb[] = [
        {
          lat: +(depotCoords.lat + (pos.lat - depotCoords.lat) * 0.3).toFixed(6),
          lng: +(depotCoords.lng + (pos.lng - depotCoords.lng) * 0.3).toFixed(6),
          x: Math.round(legacyX - 60),
          y: legacyY,
          opacity: 0.3,
        },
        {
          lat: +(depotCoords.lat + (pos.lat - depotCoords.lat) * 0.7).toFixed(6),
          lng: +(depotCoords.lng + (pos.lng - depotCoords.lng) * 0.7).toFixed(6),
          x: Math.round(legacyX - 25),
          y: legacyY,
          opacity: 0.65,
        },
      ];

      const locationDescription = pos.isLive
        ? `Live GPS Fix (${pos.lat.toFixed(4)}° N, ${pos.lng.toFixed(4)}° E)`
        : meta.depot === 'Kandy'
        ? `Kandy Central Corridor (${pos.lat.toFixed(4)}° N, ${pos.lng.toFixed(4)}° E)`
        : `Colombo Coastal Corridor (${pos.lat.toFixed(4)}° N, ${pos.lng.toFixed(4)}° E)`;

      const hasFridge = meta.chassis.includes('freezer');

      // Calculate total weight and load percentage
      const totalWeightKg = trip?.stops.reduce((sum, s) => {
        const orderWeight = s.order?.weightKg || 0;
        return sum + orderWeight;
      }, 0) || (vId === 'VEH004' ? 3850 : vId === 'VEH037' ? 1420 : vId === 'VEH001' ? 4200 : vId === 'VEH002' ? 1200 : vId === 'VEH003' ? 2100 : 0);

      const maxWeightKg = meta.chassis.includes('truck') ? 5000 : 2000;
      const rawPct = Math.min(100, Math.round((totalWeightKg / maxWeightKg) * 100));
      // Adjust remaining load based on completed stops
      const remainingPct = totalStops > 0 
        ? Math.round(rawPct * ((totalStops - completedStops) / totalStops))
        : rawPct;

      const loadStatus: 'empty' | 'half' | 'full' =
        remainingPct <= 15 ? 'empty' : remainingPct <= 70 ? 'half' : 'full';

      return {
        id: vId,
        name: vId,
        code: vId.replace('VEH', ''),
        driverName: meta.driverName,
        routeId: trip?.tripId || `R0252${vId.replace('VEH', '')}`,
        chassis: meta.chassis,
        chassisLabel: meta.chassisLabel,
        hasFridge,
        loadStatus,
        loadPct: remainingPct,
        weightKg: Math.round(maxWeightKg * (remainingPct / 100)),
        maxWeightKg,
        markerType: meta.chassis.includes('truck') ? 'rect' : 'circle',
        color: pos.isLive ? '#10b981' : meta.color,
        lat: pos.lat,
        lng: pos.lng,
        x: legacyX,
        y: legacyY,
        heading: pos.heading,
        telemetrySource: pos.isLive ? 'LIVE_GPS' : 'PREDICTIVE_INTERPOLATION',
        telemetryBadge: pos.isLive ? 'Satellite GPS' : 'Predictive Interpolation',
        completedStops,
        totalStops,
        isOnline: true,
        statusText: `${meta.driverName} · ${completedStops}/${totalStops} stops · ${pos.speedKmH} km/h`,
        speedKmH: pos.speedKmH,
        location: locationDescription,
        chilledTempC: meta.chilledTempC,
        frozenTempC: meta.frozenTempC,
        coldChainStatus: meta.coldChainStatus,
        breadcrumbs,
        stops: stopsData,
      };
    });

    return NextResponse.json({
      corridorName: 'Sri Lanka Western & Central Logistics Network',
      timestamp: new Date().toISOString(),
      depots: [
        { id: 'Peliyagoda', name: 'Peliyagoda Primary Hub', lat: 6.9654, lng: 79.8841 },
        { id: 'Kandy', name: 'Kandy Regional Depot', lat: 7.2906, lng: 80.6337 },
      ],
      vehicles: formattedVehicles,
    });
  } catch (error) {
    console.error('Failed to generate map telemetry:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve fleet map telemetry', details: String(error) },
      { status: 500 },
    );
  }
}
