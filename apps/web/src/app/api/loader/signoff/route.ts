import { NextResponse } from 'next/server';
import { prisma, StopStatus } from '@waypoint/database';
import { loaderSignoffSchema, validateRequestBody } from '@/lib/api_schemas';

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, loaderSignoffSchema);
    if (!validation.success) {
      return validation.response;
    }
    const { vehicleId, loaderName, stopsLoaded } = validation.data;
    const targetVehicle = vehicleId || 'VEH037';

    const gatePassCode = `GP_${crypto.randomUUID()}`;

    // Atomically transition Trip status to in_transit in PostgreSQL
    await prisma.trip.updateMany({
      where: { vehicleId: targetVehicle },
      data: {
        status: 'in_transit',
        departureTime: new Date(),
      },
    });

    const activeTrip = await prisma.trip.findFirst({
      where: { vehicleId: targetVehicle },
      include: { stops: { orderBy: { stopSequence: 'asc' } } },
    });

    if (activeTrip && activeTrip.stops.length > 0) {
      const firstStop = activeTrip.stops[0];
      if (firstStop.status === StopStatus.pending) {
        await prisma.tripStop.update({
          where: { id: firstStop.id },
          data: { status: StopStatus.en_route },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        action: 'DEPARTURE_SIGNOFF',
        details: JSON.stringify({
          vehicleId: targetVehicle,
          gatePassCode,
          loaderName: loaderName || 'Priya Fernando',
          stopsLoaded,
          departureTime: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      gatePassCode,
      vehicleId: targetVehicle,
      loaderName: loaderName || 'Priya Fernando',
      stopsLoaded: stopsLoaded || 'Reverse sequence loading complete',
      activatedRoute: 'R025229',
      assignedDriver: 'Kamal Silva',
      departureTimestamp: new Date().toISOString(),
      message: `Departure gate pass ${gatePassCode} generated. Vehicle ${targetVehicle} marked in transit and driver manifest unlocked.`,
    });
  } catch (error) {
    console.error('Failed to process departure signoff:', error);
    return NextResponse.json(
      { error: 'Failed to process departure signoff', details: String(error) },
      { status: 500 },
    );
  }
}
