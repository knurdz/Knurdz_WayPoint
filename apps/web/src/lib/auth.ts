import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'waypoint_jwt_super_secure_2026_random_key_change_in_production';
export const AUTH_COOKIE_NAME = 'wp_session';

export interface AuthPayload {
  userId: string;
  email: string;
  name: string;
  role: 'dispatcher' | 'loader' | 'driver' | 'store';
  outletId?: string | null;
}

export function signAuthToken(payload: AuthPayload, remember: boolean = true): string {
  const expiresIn = remember ? '30d' : '24h';
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyAuthToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return decoded;
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

export function getAuthFromRequest(req: NextRequest): AuthPayload | null {
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
