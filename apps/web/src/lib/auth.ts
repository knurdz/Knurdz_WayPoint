import { SignJWT } from 'jose/jwt/sign';
import { jwtVerify } from 'jose/jwt/verify';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'waypoint_jwt_super_secure_2026_random_key_change_in_production';
export const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
export const AUTH_COOKIE_NAME = 'wp_session';

export interface AuthPayload {
  userId: string;
  email: string;
  name: string;
  role: 'dispatcher' | 'loader' | 'driver' | 'store';
  outletId?: string | null;
}

export async function signAuthToken(payload: AuthPayload, remember: boolean = true): Promise<string> {
  const expirationTime = remember ? '30d' : '24h';
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'dispatcher' | 'loader' | 'driver' | 'store',
      outletId: (payload.outletId as string | null | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string, remember: boolean = true): void {
  const maxAge = remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAge,
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getAuthFromRequest(req: NextRequest): Promise<AuthPayload | null> {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME);
  if (!cookie || !cookie.value) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return verifyAuthToken(authHeader.substring(7));
    }
    return null;
  }
  return verifyAuthToken(cookie.value);
}
