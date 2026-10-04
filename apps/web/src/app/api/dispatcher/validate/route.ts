import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

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

    const simulatedValidation = {
      overallStatus: 'RED',
      blockersCount: 1,
      trips: [
        {
          id: 'VEH037_T1',
          tripName: 'VEH037 T1',
          weight: '4.2 / 5.5 t',
          volume: '18 / 22 m³',
          freshMin: '213 / 270',
          fuel: '280 L',
          status: 'GREEN',
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
          status: 'AMBER',
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
          status: 'RED',
          statusLabel: 'Red, blocks publish',
          isRed: true,
        },
      ],
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
