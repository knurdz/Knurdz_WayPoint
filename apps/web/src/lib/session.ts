import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, verifyAuthToken, AuthPayload } from './auth';

export async function getCurrentUser(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  return await verifyAuthToken(sessionCookie.value);
}

export async function requireUserRole(allowedRoles: string[]): Promise<AuthPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
}
