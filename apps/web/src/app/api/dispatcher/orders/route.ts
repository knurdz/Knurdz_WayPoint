import { NextResponse } from 'next/server';
import { prisma, ensureInitialOrders } from '@waypoint/database';

export async function GET() {
  try {
    await ensureInitialOrders();

    const orders = await prisma.order.findMany({
      include: {
        outlet: true,
      },
      orderBy: { orderId: 'asc' },
    });

    const formattedOrders = orders.map((o) => {
      const windowStr =
        o.outlet?.windowOpenTime && o.outlet?.windowCloseTime
          ? `${o.outlet.windowOpenTime} to ${o.outlet.windowCloseTime}`
          : '05:00 to 07:30';

      return {
        orderId: o.orderId,
        outletId: o.outletId,
        outletName: o.outlet?.name || `Waypoint Outlet ${o.outletId}`,
        brand: o.outlet?.brand || 'Fresh',
        district: o.outlet?.district || 'Colombo',
        depot: o.outlet?.depotId || 'Peliyagoda',
        tempRequirement: o.tempRequirement === 'reefer' ? 'chilled' : 'ambient',
        parkingConstraint: o.outlet?.parkingConstraint || 'normal',
        dockType: o.outlet?.dockType || 'street',
        weightKg: Math.round(o.weightKg),
        volumeM3: +(o.volumeM3.toFixed(2)),
        window: windowStr,
        status: o.status,
      };
    });

    return NextResponse.json({
      total: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error('Failed to query orders:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve orders from database', details: String(error) },
      { status: 500 },
    );
  }
}
