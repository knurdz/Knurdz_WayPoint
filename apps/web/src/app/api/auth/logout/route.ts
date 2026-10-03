import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  clearAuthCookie(response);
  return response;
}

export async function GET(req: NextRequest) {
  const loginUrl = new URL('/login', req.url);
  const response = NextResponse.redirect(loginUrl);
  clearAuthCookie(response);
  return response;
}
