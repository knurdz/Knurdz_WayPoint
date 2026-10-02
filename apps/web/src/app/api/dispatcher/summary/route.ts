import { NextResponse } from 'next/server';

export async function GET() {
  const summary = {
    ordersToday: 142,
    confirmedOrders: 138,
    pendingDeferrals: 4,
    activeFleet: 52,
    totalFleet: 60,
    reeferUnits: 16,
    onTimeRatePct: 98.4,
    fuelQuotaConsumedPct: 74.2,
    depotMetrics: [
      { depot: 'Peliyagoda Hub', activeVehicles: 36, pendingOrders: 94, chilledDemand: 18 },
      { depot: 'Kandy Hub', activeVehicles: 16, pendingOrders: 48, chilledDemand: 6 },
    ],
    exceptionsCount: 3,
  };

  return NextResponse.json(summary);
}
