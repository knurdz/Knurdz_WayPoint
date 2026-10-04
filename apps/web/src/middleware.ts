import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';
import { JWT_SECRET, AUTH_COOKIE_NAME as AUTH_COOKIE } from '@/lib/auth';

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

  const API_ROLE_PERMISSIONS: Record<string, UserRole[]> = {
    '/api/dispatcher': ['dispatcher'],
    '/api/loader': ['loader', 'dispatcher'],
    '/api/driver': ['driver', 'dispatcher'],
    '/api/store': ['store', 'dispatcher'],
    '/api/agent': ['dispatcher', 'loader', 'driver', 'store'],
    '/api/sync': ['driver', 'dispatcher'],
  };

  const matchedApiPrefix = Object.keys(API_ROLE_PERMISSIONS).find((prefix) =>
    pathname.startsWith(prefix),
  );

  if (matchedApiPrefix) {
    let token = req.cookies.get(AUTH_COOKIE)?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required for portal API', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const payload = await verifySessionToken(token);
    if (!payload || !payload.role) {
      return NextResponse.json(
        { error: 'Invalid or expired session token', code: 'INVALID_TOKEN' },
        { status: 401 },
      );
    }

    const allowedRoles = API_ROLE_PERMISSIONS[matchedApiPrefix];
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json(
        {
          error: `Forbidden: Role ${payload.role} cannot access ${matchedApiPrefix}`,
          code: 'FORBIDDEN',
        },
        { status: 403 },
      );
    }

    return NextResponse.next();
  }

  const protectedRoles = Object.keys(ROLE_ROUTES) as UserRole[];
  const isProtected = protectedRoles.some((role) => pathname.startsWith(ROLE_ROUTES[role]));

  if (pathname === '/') {
    const session = req.cookies.get(AUTH_COOKIE);
    if (session && session.value) {
      const payload = await verifySessionToken(session.value);
      if (payload && payload.role && ROLE_ROUTES[payload.role]) {
        return NextResponse.redirect(new URL(ROLE_ROUTES[payload.role], req.url));
      }
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

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
    '/',
    '/dispatcher/:path*',
    '/loader/:path*',
    '/driver/:path*',
    '/store/:path*',
    '/api/dispatcher/:path*',
    '/api/loader/:path*',
    '/api/driver/:path*',
    '/api/store/:path*',
    '/api/agent/:path*',
    '/api/sync/:path*',
    '/login',
  ],
};
