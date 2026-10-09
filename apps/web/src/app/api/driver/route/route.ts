import { NextResponse } from 'next/server';
import { prisma, ensureInitialOrders, StopStatus } from '@waypoint/database';

export async function GET() {
  try {
    await ensureInitialOrders();

    // Query active trip for default driver Kamal Silva (VEH037)
    let trip = await prisma.trip.findFirst({
      where: { vehicleId: 'VEH037' },
      include: {
        vehicle: true,
        stops: {
          include: {
            outlet: true,
            order: {
              include: {
                items: true,
              },
            },
            podRecords: true,
          },
          orderBy: { stopSequence: 'asc' },
        },
      },
    });

    if (!trip || trip.stops.length === 0) {
      // Create initial trip for VEH037 with OUT001, OUT002, OUT003, OUT004
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const createdTrip = await prisma.trip.upsert({
        where: { tripId: 'TRIP_001' },
        update: {},
        create: {
          tripId: 'TRIP_001',
          vehicleId: 'VEH037',
          tripNumber: 1,
          tripDate: todayDate,
          brand: 'Fresh',
          district: 'Colombo',
          depotId: 'Peliyagoda',
          totalWeightKg: 1340,
          totalVolumeM3: 5.3,
          status: 'in_transit',
        },
      });

      const seedStops = [
        { seq: 1, outletId: 'OUT001', orderId: 'ORD_92301', plannedArrival: '05:30', status: StopStatus.completed },
        { seq: 2, outletId: 'OUT002', orderId: 'ORD_92302', plannedArrival: '06:15', status: StopStatus.en_route },
        { seq: 3, outletId: 'OUT003', orderId: 'ORD_92303', plannedArrival: '07:00', status: StopStatus.pending },
      ];

      for (const s of seedStops) {
        const stopId = `TRIP_001_STOP_${s.seq}`;
        await prisma.tripStop.upsert({
          where: { id: stopId },
          update: {},
          create: {
            id: stopId,
            tripId: createdTrip.tripId,
            stopSequence: s.seq,
            outletId: s.outletId,
            orderId: s.orderId,
            plannedArrival: s.plannedArrival,
            status: s.status,
          },
        });
      }

      trip = await prisma.trip.findFirst({
        where: { vehicleId: 'VEH037' },
        include: {
          vehicle: true,
          stops: {
            include: {
              outlet: true,
              order: {
                include: {
                  items: true,
                },
              },
              podRecords: true,
            },
            orderBy: { stopSequence: 'asc' },
          },
        },
      });
    }

    const stops = (trip?.stops || []).map((stop) => {
      const isDelivered =
        stop.status === StopStatus.completed || stop.podRecords.length > 0;
      const isInTransit = stop.status === StopStatus.en_route;

      const displayStatus = isDelivered
        ? 'Delivered'
        : isInTransit
        ? 'In Transit'
        : 'Pending';

      const cargoItems = stop.order?.items?.map((item) => ({
        name: item.description,
        qty: `${item.quantity} units · ${stop.order?.tempRequirement === 'reefer' ? 'chilled' : 'ambient'}`,
      })) || [
        {
          name: stop.order?.tempRequirement === 'reefer' ? 'Chilled Dairy Packs' : 'Dry Groceries',
          qty: `${Math.round(stop.order?.weightKg || 350)} kg`,
        },
      ];

      return {
        id: stop.id,
        orderId: stop.orderId,
        seq: stop.stopSequence,
        deliveryCode: `DEL_${stop.orderId.replace(/[^0-9]/g, '') || String(88400 + stop.stopSequence)}`,
        outletCode: stop.outletId,
        outletName: stop.outlet?.name || `Waypoint ${stop.outletId}`,
        access: stop.outlet?.parkingConstraint || 'van_only',
        status: displayStatus,
        meta: isDelivered
          ? `POD signed · ${Math.round(stop.order?.weightKg || 380)} kg`
          : `${stop.plannedArrival || '06:00'} SLST · window closes ${stop.outlet?.windowCloseTime || '07:30'}`,
        receiverName: isDelivered ? 'Desk Supervisor' : undefined,
        handoverTime: isDelivered ? '05:32 SLST' : undefined,
        cargo: cargoItems,
        windowSlack: '1h 15m',
        windowCloses: `${stop.outlet?.windowCloseTime || '07:30'} SLST`,
        volumeM3: stop.order?.volumeM3 || 1.8,
        latitude: stop.outlet?.latitude || 6.9271,
        longitude: stop.outlet?.longitude || 79.8612,
      };
    });

    const completedCount = stops.filter((s) => s.status === 'Delivered').length;
    const totalCount = stops.length;

    const driverData = {
      routeId: `R0${trip?.tripId?.replace(/[^0-9]/g, '') || '25229'}`,
      vehicleId: trip?.vehicleId || 'VEH037',
      driverName: 'Kamal Silva',
      status: 'Route Active',
      corridor: `Coastal corridor · Nissan Cabstar · ${completedCount} of ${totalCount} stops delivered`,
      offlineSyncCount: 0,
      isOffline: false,
      chassis: 'van_freezer',
      stops,
    };

    return NextResponse.json(driverData);
  } catch (error) {
    console.error('Failed to get driver route:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve driver route', details: String(error) },
      { status: 500 },
    );
  }
}
