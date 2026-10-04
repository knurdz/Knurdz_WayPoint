import { NextRequest, NextResponse } from 'next/server';
import { liveGpsStore } from '@/lib/geo_telemetry';
import { checkRateLimit } from '@/lib/rate_limiter';
import { z } from 'zod';

const telemetrySchema = z.object({
  vehicleId: z.string().min(1),
  latitude: z.number().min(5.0).max(10.5),
  longitude: z.number().min(79.0).max(82.5),
  speed: z.number().min(0).optional().default(0),
  heading: z.number().min(0).max(360).optional(),
  accuracy: z.number().min(0).optional(),
  timestamp: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limit = checkRateLimit(`driver_telemetry_${ip}`, 120, 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for GPS beacon' },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } },
      );
    }

    const body = await req.json();
    const result = telemetrySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid telemetry payload', details: result.error.errors },
        { status: 400 },
      );
    }

    const { vehicleId, latitude, longitude, speed, heading, accuracy } = result.data;

    liveGpsStore[vehicleId] = {
      vehicleId,
      lat: latitude,
      lng: longitude,
      speedKmH: Math.round(speed || 0),
      heading: heading ? Math.round(heading) : undefined,
      accuracyM: accuracy ? Math.round(accuracy) : undefined,
      timestamp: Date.now(),
      source: 'driver_gps',
    };

    return NextResponse.json({
      success: true,
      vehicleId,
      status: 'RECORDED',
      source: 'driver_gps',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to ingest driver telemetry:', error);
    return NextResponse.json(
      { error: 'Failed to ingest telemetry', details: String(error) },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const vehicleId = url.searchParams.get('vehicleId');

  if (vehicleId) {
    const fix = liveGpsStore[vehicleId];
    return NextResponse.json({
      vehicleId,
      telemetry: fix || null,
      isLive: Boolean(fix && Date.now() - fix.timestamp < 120000),
    });
  }

  return NextResponse.json({
    activeFixes: Object.keys(liveGpsStore).length,
    telemetry: liveGpsStore,
  });
}
