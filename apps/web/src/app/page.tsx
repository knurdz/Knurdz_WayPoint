import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME, JWT_SECRET } from '@/lib/auth';
import { jwtVerify } from 'jose/jwt/verify';

const ROLE_ROUTES: Record<string, string> = {
  dispatcher: '/dispatcher',
  loader: '/loader',
  driver: '/driver',
  store: '/store',
};

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload?.role as string;
    if (role && ROLE_ROUTES[role]) {
      redirect(ROLE_ROUTES[role]);
    }
  } catch {
    // Session token invalid or expired
  }

  redirect('/login');
}
