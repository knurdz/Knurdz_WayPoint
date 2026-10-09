import { NextResponse } from 'next/server';
import { prisma, ensureInitialOrders, StopStatus, OrderStatus } from '@waypoint/database';

export async function GET(req: Request) {
  try {
    await ensureInitialOrders();

    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get('tripId');

    let trips = await prisma.trip.findMany({
      include: {
        stops: {
          include: {
            outlet: true,
            order: {
              include: {
                items: true,
              },
            },
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
              order: {
                include: {
                  items: true,
                },
              },
            },
            orderBy: { stopSequence: 'asc' },
          },
          vehicle: true,
        },
        orderBy: { tripId: 'asc' },
      });
    }

    if (tripId) {
      const targetTrip = trips.find((t) => t.tripId === tripId) || trips[0];
      if (!targetTrip) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }

      // Reverse LIFO: highest sequence loaded first (step 1 = last stop)
      const reversedStops = [...targetTrip.stops].sort((a, b) => b.stopSequence - a.stopSequence);

      const lifoStops = reversedStops.map((stop, index) => {
        const order = stop.order;
        const items = order?.items || [];
        const isFirstStep = index === 0;
        const isLastStep = index === reversedStops.length - 1;

        let label = 'Mid compartment';
        if (isFirstStep) label = 'Load first (Rear bed)';
        else if (isLastStep) label = 'Load last (Roll-up door)';

        const lines = items.length > 0 ? items.map((item, itemIdx) => ({
          id: `${stop.id}_${item.id || itemIdx}`,
          name: item.description,
          sku: item.sku,
          qty: `${item.quantity} Cases`,
          temp: order?.tempRequirement === 'reefer' ? '+4°C Chilled' : 'Ambient',
          tempBadgeClass: order?.tempRequirement === 'reefer' ? 'wp-badge-success' : '',
          img: order?.tempRequirement === 'reefer' ? '/assets/products/greek-yogurt.jpg' : '/assets/products/organic-rice.jpg',
          verified: false,
        })) : [
          {
            id: `${stop.id}_default`,
            name: order?.tempRequirement === 'reefer' ? 'Pasteurized Chilled Milk' : 'Ambient Bakery Rice Packs',
            sku: order?.tempRequirement === 'reefer' ? 'SKU-CH-MILK-1L' : 'SKU-AM-RICE-05',
            qty: `${order?.orderUnits || 20} Cases`,
            temp: order?.tempRequirement === 'reefer' ? '+4°C Chilled' : 'Ambient',
            tempBadgeClass: order?.tempRequirement === 'reefer' ? 'wp-badge-success' : '',
            img: order?.tempRequirement === 'reefer' ? '/assets/products/milk-bottle.jpg' : '/assets/products/organic-rice.jpg',
            verified: false,
          },
        ];

        return {
          step: index + 1,
          stopId: stop.id,
          stopSequence: stop.stopSequence,
          label,
          title: `Stop ${stop.stopSequence} · ${stop.outletId} ${stop.outlet?.name || ''}`,
          window: `${stop.outlet?.windowOpenTime || '05:00'} to ${stop.outlet?.windowCloseTime || '07:30'}`,
          lines,
        };
      });

      return NextResponse.json({
        success: true,
        trip: {
          tripId: targetTrip.tripId,
          vehicleId: targetTrip.vehicleId,
          brand: targetTrip.brand,
          district: targetTrip.district,
          stopsCount: targetTrip.stops.length,
          stops: lifoStops,
        },
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
        link: `/loader?tripId=${t.tripId}&vehicleId=${t.vehicleId}`,
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
