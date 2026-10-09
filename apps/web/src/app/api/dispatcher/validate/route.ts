import { NextResponse } from 'next/server';
import { prisma, ensureInitialOrders } from '@waypoint/database';
import { validateRequestSchema, validateRequestBody } from '@/lib/api_schemas';

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, validateRequestSchema, { allowEmptyBody: true });
    if (!validation.success) {
      return validation.response;
    }
    const body = validation.data;

    // Attempt to invoke the python validation runner if running
    try {
      const optimizerUrl = process.env.OPTIMIZER_URL || 'http://127.0.0.1:8000';
      const pyRes = await fetch(`${optimizerUrl}/api/v1/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (pyRes.ok) {
        const pyData = await pyRes.json();
        return NextResponse.json(pyData);
      }
    } catch {
      // Fallback to local simulation when FastAPI service is offline
    }

    const dbTrips = await prisma.trip.findMany({
      include: {
        vehicle: true,
        stops: {
          include: {
            order: true,
          },
        },
      },
      orderBy: { tripId: 'asc' },
    });

    const validatedTrips = dbTrips.length > 0
      ? dbTrips.map((t) => {
          const weightCapKg = t.vehicle?.weightCapKg || 5500;
          const volCapM3 = t.vehicle?.volumeCapM3 || 22;
          const isOverWeight = t.totalWeightKg > weightCapKg;
          const isOverVol = t.totalVolumeM3 > volCapM3;
          const isRed = isOverWeight || isOverVol;
          return {
            id: t.tripId,
            tripName: `${t.vehicleId} T${t.tripNumber}`,
            weight: `${(t.totalWeightKg / 1000).toFixed(1)} / ${(weightCapKg / 1000).toFixed(1)} t`,
            volume: `${Math.round(t.totalVolumeM3)} / ${Math.round(volCapM3)} m³`,
            freshMin: `${Math.round(t.stops.length * 45)} / 270`,
            fuel: `${Math.round(180 + t.stops.length * 35)} L`,
            status: (isRed ? 'RED' : t.stops.length >= 4 ? 'AMBER' : 'GREEN') as 'RED' | 'AMBER' | 'GREEN',
            statusLabel: isRed ? 'Red, blocks publish' : t.stops.length >= 4 ? 'Amber' : 'Green',
            isRed,
          };
        })
      : [
          {
            id: 'VEH037_T1',
            tripName: 'VEH037 T1',
            weight: '4.2 / 5.5 t',
            volume: '18 / 22 m³',
            freshMin: '213 / 270',
            fuel: '280 L',
            status: 'GREEN' as const,
            statusLabel: 'Green',
            isRed: false,
          },
          {
            id: 'VEH001_T1',
            tripName: 'VEH001 T1',
            weight: '5.1 / 5.5 t',
            volume: '21 / 22 m³',
            freshMin: '248 / 270',
            fuel: '310 L',
            status: 'AMBER' as const,
            statusLabel: 'Amber',
            isRed: false,
          },
          {
            id: 'VEH014_T2',
            tripName: 'VEH014 T2',
            weight: '5.6 / 5.5 t',
            volume: '23 / 22 m³',
            freshMin: '265 / 270',
            fuel: '420 L',
            status: 'RED' as const,
            statusLabel: 'Red, blocks publish',
            isRed: true,
          },
        ];

    const hasBlockers = validatedTrips.some((t) => t.isRed);

    const simulatedValidation = {
      overallStatus: hasBlockers ? 'RED' : 'GREEN',
      blockersCount: validatedTrips.filter((t) => t.isRed).length,
      trips: validatedTrips,
      legalSwaps: [
        {
          id: 'swap_1',
          title: 'Move overflow to VEH037 trip 1',
          meta: 'Fits weight and volume · costs 14 min of Fresh 270 min budget · keeps OUT004 on board',
          targetTrip: 'VEH014_T2',
          resolvedWeight: '5.1 / 5.5 t',
          resolvedVolume: '21 / 22 m³',
        },
        {
          id: 'swap_2',
          title: 'Defer OUT088 instead of OUT004',
          meta: 'OUT004 deferred yesterday · OUT088 is ambient with slack · avoids repeat deferral debt',
          targetTrip: 'VEH014_T2',
          resolvedWeight: '4.9 / 5.5 t',
          resolvedVolume: '19 / 22 m³',
        },
      ],
      windows: {
        styleTechCombined: '120 / 480 min',
        slackInfo: 'OUT001 mall dock 05:00 to 07:30 · 18 min slack after service estimate.',
      },
    };

    return NextResponse.json(simulatedValidation);
  } catch (error) {
    return NextResponse.json(
      { error: 'Validation query failed', details: String(error) },
      { status: 500 },
    );
  }
}
