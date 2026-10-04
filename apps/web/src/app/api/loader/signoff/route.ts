import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vehicleId, loaderName, stopsLoaded } = body;

    const gatePassCode = `GP_${crypto.randomUUID()}`;

    return NextResponse.json({
      success: true,
      gatePassCode,
      vehicleId: vehicleId || 'VEH037',
      loaderName: loaderName || 'Priya Fernando',
      stopsLoaded: stopsLoaded || '4 / 4 reverse sequence complete',
      activatedRoute: 'R025229',
      assignedDriver: 'Kamal Silva',
      departureTimestamp: new Date().toISOString(),
      message: `Departure gate pass ${gatePassCode} generated. Driver route R025229 unlocked.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process departure signoff', details: String(error) },
      { status: 500 },
    );
  }
}
