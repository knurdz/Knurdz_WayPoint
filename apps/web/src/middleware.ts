import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';

const AUTH_COOKIE = 'wp_session';
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'waypoint_jwt_super_secure_2026_random_key_change_in_production';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

type UserRole = 'dispatcher' | 'loader' | 'driver' | 'store';

interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  outletId?: string | null;
  exp?: number;
}

const ROLE_ROUTES: Record<UserRole, string> = {
  dispatcher: '/dispatcher',
  loader: '/loader',
  driver: '/driver',
  store: '/store',
};

async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload || !payload.role) {
      return null;
    }
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
      outletId: (payload.outletId as string | null | undefined) ?? null,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedRoles = Object.keys(ROLE_ROUTES) as UserRole[];
  const isProtected = protectedRoles.some((role) => pathname.startsWith(ROLE_ROUTES[role]));

  if (!isProtected) {
    if (pathname === '/login') {
      const session = req.cookies.get(AUTH_COOKIE);
      if (session && session.value) {
        const payload = await verifySessionToken(session.value);
        if (payload && payload.role && ROLE_ROUTES[payload.role]) {
          return NextResponse.redirect(new URL(ROLE_ROUTES[payload.role], req.url));
        }
      }
    }
    return NextResponse.next();
  }

  const session = req.cookies.get(AUTH_COOKIE);
  if (!session || !session.value) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifySessionToken(session.value);
  if (!payload || !payload.role) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  const userRole = payload.role;

  for (const role of protectedRoles) {
    const routePrefix = ROLE_ROUTES[role];
    if (pathname.startsWith(routePrefix) && userRole !== role) {
      const correctHome = ROLE_ROUTES[userRole] || '/login';
      return NextResponse.redirect(new URL(correctHome, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dispatcher/:path*',
    '/loader/:path*',
    '/driver/:path*',
    '/store/:path*',
    '/login',
  ],
};
