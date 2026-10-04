import { NextRequest, NextResponse } from 'next/server';
import { signAuthToken, setAuthCookie, AuthPayload } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate_limiter';

const DEMO_ACCOUNTS: Record<string, { name: string; role: 'dispatcher' | 'loader' | 'driver' | 'store'; outletId?: string }> = {
  'dispatcher@waypoint.test': { name: 'Nimal Perera', role: 'dispatcher' },
  'loader@waypoint.test': { name: 'Priya Fernando', role: 'loader' },
  'driver@waypoint.test': { name: 'Kamal Silva', role: 'driver' },
  'store@waypoint.test': { name: 'Anjali Jayawardena', role: 'store', outletId: 'OUT001' },
  'nimal.perera@waypoint.lk': { name: 'Nimal Perera', role: 'dispatcher' },
  'priya.fernando@waypoint.lk': { name: 'Priya Fernando', role: 'loader' },
  'kamal.silva@waypoint.lk': { name: 'Kamal Silva', role: 'driver' },
  'anjali.jayawardena@waypoint.lk': { name: 'Anjali Jayawardena', role: 'store', outletId: 'OUT001' },
};

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '127.0.0.1';
    const limit = checkRateLimit(`login_${ip}`, 5, 60);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please retry later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.resetInSeconds),
          },
        }
      );
    }

    const body = await req.json();
    const { email, password, remember = true } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const demoUser = DEMO_ACCOUNTS[normalizedEmail];

    let userPayload: AuthPayload | null = null;

    if (demoUser && (password === 'REDACTED' || password === 'password' || password.length >= 6)) {
      userPayload = {
        userId: `demo_${demoUser.role}`,
        email: normalizedEmail,
        name: demoUser.name,
        role: demoUser.role,
        outletId: demoUser.outletId || null,
      };
    }

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = await signAuthToken(userPayload, remember);
    const response = NextResponse.json({
      success: true,
      user: userPayload,
      redirectUrl: `/${userPayload.role}`,
    });

    setAuthCookie(response, token, remember);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication service encountered an unexpected error' },
      { status: 500 }
    );
  }
}
