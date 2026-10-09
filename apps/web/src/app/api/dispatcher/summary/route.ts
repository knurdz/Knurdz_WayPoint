import { NextResponse } from 'next/server';
import { prisma, ensureInitialOrders, OrderStatus, VehicleStatus, Temperature } from '@waypoint/database';
import { GLOBAL_INCIDENTS } from '@/lib/incidentsStore';

export async function GET() {
  try {
    await ensureInitialOrders();

    const [
      totalOrders,
      confirmedOrders,
      pendingDeferrals,
      allocatedOrders,
      deliveredOrders,
      activeVehicles,
      totalVehicles,
      reeferVehicles,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: OrderStatus.confirmed } }),
      prisma.order.count({ where: { status: OrderStatus.deferred } }),
      prisma.order.count({ where: { status: OrderStatus.allocated } }),
      prisma.order.count({ where: { status: OrderStatus.delivered } }),
      prisma.vehicle.count({ where: { status: VehicleStatus.available } }),
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { temp: Temperature.reefer } }),
    ]);

    const openExceptions = GLOBAL_INCIDENTS.filter((i) => i.status === 'OPEN').length;

    // Depot breakdown
    const peliyagodaOrders = await prisma.order.count({
      where: { outlet: { depotId: 'Peliyagoda' } },
    });
    const kandyOrders = await prisma.order.count({
      where: { outlet: { depotId: 'Kandy' } },
    });
    const peliyagodaChilled = await prisma.order.count({
      where: { outlet: { depotId: 'Peliyagoda' }, tempRequirement: Temperature.reefer },
    });
    const kandyChilled = await prisma.order.count({
      where: { outlet: { depotId: 'Kandy' }, tempRequirement: Temperature.reefer },
    });

    const summary = {
      ordersToday: totalOrders,
      confirmedOrders,
      pendingDeferrals,
      allocatedOrders,
      deliveredOrders,
      activeFleet: activeVehicles || 32,
      totalFleet: totalVehicles || 36,
      reeferUnits: reeferVehicles || 16,
      onTimeRatePct: 98.4,
      fuelQuotaConsumedPct: 74.2,
      depotMetrics: [
        { depot: 'Peliyagoda Hub', activeVehicles: 28, pendingOrders: peliyagodaOrders, chilledDemand: peliyagodaChilled },
        { depot: 'Kandy Hub', activeVehicles: 4, pendingOrders: kandyOrders, chilledDemand: kandyChilled },
      ],
      exceptionsCount: openExceptions,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Failed to get dispatcher summary:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve dispatcher summary', details: String(error) },
      { status: 500 },
    );
  }
}
