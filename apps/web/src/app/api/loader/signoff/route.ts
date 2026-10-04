import { NextResponse } from 'next/server';
import { loaderSignoffSchema, validateRequestBody } from '@/lib/api_schemas';

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, loaderSignoffSchema);
    if (!validation.success) {
      return validation.response;
    }
    const { vehicleId, loaderName, stopsLoaded } = validation.data;

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
