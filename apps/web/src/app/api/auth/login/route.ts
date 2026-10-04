import { NextRequest, NextResponse } from 'next/server';
import { prisma, verifyPassword } from '@waypoint/database';
import { signAuthToken, setAuthCookie, AuthPayload } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate_limiter';
import { loginSchema, validateRequestBody } from '@/lib/api_schemas';

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '127.0.0.1';
    const limit = checkRateLimit(`login_${ip}`, 10, 60);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please retry later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.resetInSeconds),
          },
        },
      );
    }

    const validation = await validateRequestBody(req, loginSchema);
    if (!validation.success) {
      return validation.response;
    }
    const { email, password, remember } = validation.data;

    const normalizedEmail = email.trim().toLowerCase();

    // Query user directly from PostgreSQL via Prisma
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const userPayload: AuthPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AuthPayload['role'],
      outletId: user.outletId || null,
    };

    const token = await signAuthToken(userPayload, remember);
    const redirectUrl = `/${userPayload.role}`;

    const response = NextResponse.json({
      success: true,
      user: userPayload,
      redirectUrl,
    });

    setAuthCookie(response, token, remember);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication service encountered an unexpected error' },
      { status: 500 },
    );
  }
}
