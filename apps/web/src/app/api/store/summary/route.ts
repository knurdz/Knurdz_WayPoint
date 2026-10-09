import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureInitialOrders, OrderStatus } from '@waypoint/database';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await ensureInitialOrders();

    const auth = await getAuthFromRequest(req);
    const outletCode = auth?.outletId || 'OUT001';

    const outlet = await prisma.outlet.findUnique({
      where: { outletId: outletCode },
    });

    const orders = await prisma.order.findMany({
      where: { outletId: outletCode },
      include: {
        items: true,
        tripStops: {
          include: {
            trip: {
              include: {
                vehicle: true,
              },
            },
            podRecords: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const chilledOrders = orders.filter((o) => o.tempRequirement === 'reefer');
    const chilledWeight = chilledOrders.reduce((sum, o) => sum + o.weightKg, 0);
    const coolroomMax = 2500;
    const coolroomPct = Math.min(100, Math.round((chilledWeight / coolroomMax) * 100));

    const todayOpen = orders.filter((o) =>
      o.status === OrderStatus.confirmed ||
      o.status === OrderStatus.allocated ||
      o.status === OrderStatus.in_transit,
    ).length;

    const awaitingReceipt = orders.filter((o) => o.status === OrderStatus.in_transit).length;

    const deliveries = orders.map((o) => {
      let statusLabel = 'Confirmed';
      let statusBadge = 'Scheduled 05:00';
      let canConfirm = false;

      if (o.status === OrderStatus.delivered) {
        statusLabel = 'Delivered';
        statusBadge = 'Delivered';
        canConfirm = true;
      } else if (o.status === OrderStatus.in_transit) {
        statusLabel = 'In Transit';
        statusBadge = 'In Transit · 14m';
      } else if (o.status === OrderStatus.deferred) {
        statusLabel = 'Deferred';
        statusBadge = 'Deferred';
      }

      const goodsDescription =
        o.items.map((i) => i.description).join(', ') ||
        (o.tempRequirement === 'reefer' ? 'Dairy cases, curd, ice cream' : 'Bread loaves, organic rice');

      const deliveryNum = o.orderId.replace(/[^0-9]/g, '') || '88401';

      return {
        id: `del_${o.orderId}`,
        code: `DEL_${deliveryNum}`,
        cargoType: o.tempRequirement === 'reefer' ? 'Chilled' : 'Ambient',
        goods: goodsDescription,
        weightKg: Math.round(o.weightKg),
        status: statusLabel,
        statusBadge: statusBadge,
        eta: o.status === OrderStatus.delivered ? '05:40 SLST' : '06:18 SLST',
        actionLabel: o.status === OrderStatus.delivered ? 'Full receipt →' : 'ETA 06:18 · Track',
        link: o.status === OrderStatus.delivered ? '/store/receipt' : '/store/tracking',
        canConfirm,
      };
    });

    const storeData = {
      outletCode: outlet?.outletId || outletCode,
      outletName: outlet?.name || `Waypoint Outlet ${outletCode}`,
      location: `${outlet?.district || 'Colombo'} · ${outlet?.dockType || 'street'} · window ${outlet?.windowOpenTime || '05:00'} to ${outlet?.windowCloseTime || '07:30'}`,
      status: 'Outlet Online',
      kpis: {
        coolroomPct: coolroomPct || 74,
        coolroomWeightKg: Math.round(chilledWeight) || 1820,
        coolroomMaxKg: coolroomMax,
        nextVanMinutes: 14,
        nextVanVehicle: 'VEH037',
        nextVanDistanceKm: 3.8,
        dockStatus: 'Clear',
        dockLimit: `${outlet?.parkingConstraint || 'Van only'}`,
        todayOpen,
        awaitingReceipt,
      },
      orders: orders.map((o) => {
        const orderDateStr = new Date(o.orderDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const goodsDesc =
          o.items.map((i) => i.description).join(', ') ||
          (o.tempRequirement === 'reefer' ? 'Dairy cases, curd, ice cream' : 'Bread loaves, organic rice');

        let displayStatus = 'Confirmed';
        let actionUrl = `/store/tracking?orderId=${o.orderId}`;
        let actionLabel = 'Track';

        if (o.status === OrderStatus.delivered) {
          displayStatus = 'Delivered';
          actionUrl = `/store/receipt?orderId=${o.orderId}`;
          actionLabel = 'Receipt';
        } else if (o.status === OrderStatus.in_transit) {
          displayStatus = 'In transit';
          actionUrl = `/store/tracking?orderId=${o.orderId}`;
          actionLabel = 'Track';
        } else if (o.status === OrderStatus.allocated) {
          displayStatus = 'Allocated';
          actionUrl = `/store/tracking?orderId=${o.orderId}`;
          actionLabel = 'Track';
        } else if (o.status === OrderStatus.deferred) {
          displayStatus = 'Deferred';
          actionUrl = `/store/deferral?orderId=${o.orderId}`;
          actionLabel = 'Notice';
        }

        return {
          id: o.orderId,
          date: orderDateStr,
          temp: o.tempRequirement === 'reefer' ? ('Chilled' as const) : ('Ambient' as const),
          volume: +(o.volumeM3.toFixed(2)),
          weightKg: Math.round(o.weightKg),
          status: displayStatus,
          actionUrl,
          actionLabel,
          goods: goodsDesc,
        };
      }),
      deliveries: deliveries.length > 0 ? deliveries : [
        {
          id: 'del_1',
          code: 'DEL_88401',
          cargoType: 'Chilled',
          goods: 'Dairy cases, curd, ice cream',
          weightKg: 4850,
          status: 'In Transit',
          statusBadge: 'In Transit · 14m',
          eta: '06:18 SLST',
          actionLabel: 'ETA 06:18 · Track',
          link: '/store/tracking',
          canConfirm: false,
        },
      ],
    };

    return NextResponse.json(storeData);
  } catch (error) {
    console.error('Failed to get store summary:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve store summary', details: String(error) },
      { status: 500 },
    );
  }
}
