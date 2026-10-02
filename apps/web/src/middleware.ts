import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'wp_session';

const ROLE_ROUTES: Record<string, string> = {
  dispatcher: '/dispatcher',
  loader: '/loader',
  driver: '/driver',
  store: '/store',
};

function parseJwtPayload(token: string): any | null {
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
    const parsed = JSON.parse(jsonPayload);
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

  const isProtected =
    pathname.startsWith('/dispatcher') ||
    pathname.startsWith('/loader') ||
    pathname.startsWith('/driver') ||
    pathname.startsWith('/store');

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

  const userRole = payload.role as string;

  if (pathname.startsWith('/dispatcher') && userRole !== 'dispatcher') {
    const correctHome = ROLE_ROUTES[userRole] || '/login';
    return NextResponse.redirect(new URL(correctHome, req.url));
  }
  if (pathname.startsWith('/loader') && userRole !== 'loader') {
    const correctHome = ROLE_ROUTES[userRole] || '/login';
    return NextResponse.redirect(new URL(correctHome, req.url));
  }
  if (pathname.startsWith('/driver') && userRole !== 'driver') {
    const correctHome = ROLE_ROUTES[userRole] || '/login';
    return NextResponse.redirect(new URL(correctHome, req.url));
  }
  if (pathname.startsWith('/store') && userRole !== 'store') {
    const correctHome = ROLE_ROUTES[userRole] || '/login';
    return NextResponse.redirect(new URL(correctHome, req.url));
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
