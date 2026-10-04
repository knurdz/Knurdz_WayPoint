import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate_limiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limit = checkRateLimit(`store_order_${ip}`, 30, 60);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many order requests. Please retry shortly.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } },
      );
    }

    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload', code: 'INVALID_PAYLOAD' },
        { status: 400 },
      );
    }

    const { ambientProduct, ambientWeight, chilledProduct, chilledWeight, outletCode } = body;

    if (
      auth?.outletId &&
      outletCode &&
      typeof outletCode === 'string' &&
      outletCode.trim() !== auth.outletId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Cannot place orders for another store outlet',
          code: 'FORBIDDEN_OUTLET_MISMATCH',
        },
        { status: 403 },
      );
    }

    const parsedAmbientWeight = Number(ambientWeight ?? 2100);
    const parsedChilledWeight = Number(chilledWeight ?? 4850);

    if (isNaN(parsedAmbientWeight) || parsedAmbientWeight < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ambient cargo weight must be a non negative number',
          code: 'INVALID_AMBIENT_WEIGHT',
        },
        { status: 400 },
      );
    }

    if (isNaN(parsedChilledWeight) || parsedChilledWeight < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chilled cargo weight must be a non negative number',
          code: 'INVALID_CHILLED_WEIGHT',
        },
        { status: 400 },
      );
    }

    if (parsedAmbientWeight > 7500 || parsedChilledWeight > 7500) {
      return NextResponse.json(
        {
          success: false,
          error: 'Individual cargo weight exceeds maximum vehicle payload capacity of 7500 kg',
          code: 'WEIGHT_EXCEEDS_MAX_CAPACITY',
        },
        { status: 400 },
      );
    }

    const now = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const slstMillis = utcMillis + 5.5 * 3600000;
    const slstDate = new Date(slstMillis);

    const isLate = slstDate.getHours() >= 16;
    const orderTimestamp = slstDate.toLocaleTimeString('en-US', { hour12: false });

    const cleanOutlet =
      auth?.outletId ||
      (outletCode && typeof outletCode === 'string' && outletCode.trim()
        ? outletCode.trim()
        : 'OUT001');

    const generatedOrders = [
      {
        orderId: `ORD${Math.floor(100000 + Math.random() * 900000)}`,
        outletCode: cleanOutlet,
        cargoType: 'Ambient',
        product: ambientProduct || 'Bread loaves, organic rice',
        weightKg: parsedAmbientWeight,
        isLate,
        scheduledRun: isLate ? 'Next Run (Rolled)' : 'Today 05:00 Run',
        status: isLate ? 'ROLLED_LATE' : 'CONFIRMED',
      },
      {
        orderId: `ORD${Math.floor(100000 + Math.random() * 900000)}`,
        outletCode: cleanOutlet,
        cargoType: 'Chilled',
        product: chilledProduct || 'Dairy cases, curd, ice cream',
        weightKg: parsedChilledWeight,
        isLate,
        scheduledRun: isLate ? 'Next Run (Rolled)' : 'Today 05:00 Run',
        status: isLate ? 'ROLLED_LATE' : 'CONFIRMED',
      },
    ];

    return NextResponse.json({
      success: true,
      timestamp: orderTimestamp,
      isPastCutoff: isLate,
      orders: generatedOrders,
      message: isLate
        ? 'Orders accepted after 16:00 SLST cutoff and queued for next run'
        : 'Both orders confirmed for scheduled morning dispatch',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to place store orders', details: String(error) },
      { status: 500 },
    );
  }
}
