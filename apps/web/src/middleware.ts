import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'wp_session';

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

function parseJwtPayload(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/_/g, '/').replace(/-/g, '+');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload) as SessionPayload;
    if (parsed.exp && Date.now() >= parsed.exp * 1000) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedRoles = Object.keys(ROLE_ROUTES) as UserRole[];
  const isProtected = protectedRoles.some((role) => pathname.startsWith(ROLE_ROUTES[role]));

  if (!isProtected) {
    if (pathname === '/login') {
      const session = req.cookies.get(AUTH_COOKIE);
      if (session && session.value) {
        const payload = parseJwtPayload(session.value);
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

  const payload = parseJwtPayload(session.value);
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
