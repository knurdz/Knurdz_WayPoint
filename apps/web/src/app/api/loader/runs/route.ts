import { NextResponse } from 'next/server';
import { prisma, ensureInitialOrders, StopStatus, OrderStatus } from '@waypoint/database';

export async function GET() {
  try {
    await ensureInitialOrders();

    let trips = await prisma.trip.findMany({
      include: {
        stops: {
          include: {
            outlet: true,
            order: true,
          },
          orderBy: { stopSequence: 'asc' },
        },
        vehicle: true,
      },
      orderBy: { tripId: 'asc' },
    });

    // If no trips exist yet, auto-provision initial trips from seeded orders
    if (trips.length === 0) {
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const defaultTrips = [
        {
          tripId: 'TRIP_001',
          vehicleId: 'VEH037',
          tripNumber: 1,
          brand: 'Fresh' as const,
          district: 'Colombo',
          depotId: 'Peliyagoda',
          orders: ['ORD_92301', 'ORD_92302'],
        },
        {
          tripId: 'TRIP_002',
          vehicleId: 'VEH004',
          tripNumber: 1,
          brand: 'Fresh' as const,
          district: 'Gampaha',
          depotId: 'Peliyagoda',
          orders: ['ORD_92303', 'ORD_92307'],
        },
        {
          tripId: 'TRIP_003',
          vehicleId: 'VEH001',
          tripNumber: 2,
          brand: 'Style' as const,
          district: 'Kandy',
          depotId: 'Kandy',
          orders: ['ORD_92309', 'ORD_92310'],
        },
      ];

      for (const t of defaultTrips) {
        await prisma.trip.create({
          data: {
            tripId: t.tripId,
            vehicleId: t.vehicleId,
            tripNumber: t.tripNumber,
            tripDate: todayDate,
            brand: t.brand,
            district: t.district,
            depotId: t.depotId,
            status: 'Loading',
          },
        });

        for (let i = 0; i < t.orders.length; i++) {
          const orderId = t.orders[i];
          const order = await prisma.order.findUnique({ where: { orderId } });
          if (order) {
            await prisma.tripStop.create({
              data: {
                id: `${t.tripId}_STOP_${i + 1}`,
                tripId: t.tripId,
                stopSequence: i + 1,
                outletId: order.outletId,
                orderId: order.orderId,
                plannedArrival: i === 0 ? '05:30' : '06:15',
                status: StopStatus.pending,
              },
            });
            await prisma.order.update({
              where: { orderId },
              data: { status: OrderStatus.allocated },
            });
          }
        }
      }

      trips = await prisma.trip.findMany({
        include: {
          stops: {
            include: {
              outlet: true,
              order: true,
            },
            orderBy: { stopSequence: 'asc' },
          },
          vehicle: true,
        },
        orderBy: { tripId: 'asc' },
      });
    }

    const runs = trips.map((t) => {
      const stopCount = t.stops.length;
      let statusLabel = 'Loading';
      if (t.status === 'completed') statusLabel = 'Completed';
      else if (t.status === 'in_transit') statusLabel = 'In Transit';
      else if (t.status === 'ready') statusLabel = 'Ready';

      return {
        id: t.tripId,
        vehicle: t.vehicleId,
        trip: `Trip ${t.tripNumber}`,
        title: `${t.brand} · ${t.district} · ${stopCount} stops`,
        status: statusLabel,
        stopsCount: stopCount,
        link: '/loader',
      };
    });

    return NextResponse.json({ success: true, runs });
  } catch (error) {
    console.error('Failed to query loader runs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve warehouse runs', details: String(error) },
      { status: 500 },
    );
  }
}
