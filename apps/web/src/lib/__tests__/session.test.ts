import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cookies } from 'next/headers';
import { getCurrentUser, requireUserRole } from '../session';
import { signAuthToken, verifyAuthToken, AuthPayload, AUTH_COOKIE_NAME } from '../auth';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('session and auth utilities', () => {
  const mockDispatcher: AuthPayload = {
    userId: 'user-disp-1',
    email: 'dispatcher@waypoint.internal',
    name: 'Chief Dispatcher',
    role: 'dispatcher',
    outletId: null,
  };

  const mockDriver: AuthPayload = {
    userId: 'user-drv-1',
    email: 'driver@waypoint.internal',
    name: 'Driver Dave',
    role: 'driver',
    outletId: 'OUTLET-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('JWT sign and verify (auth.ts)', () => {
    it('successfully signs and verifies a valid token payload', async () => {
      const token = await signAuthToken(mockDispatcher);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);

      const verified = await verifyAuthToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(mockDispatcher.userId);
      expect(verified?.email).toBe(mockDispatcher.email);
      expect(verified?.role).toBe('dispatcher');
      expect(verified?.outletId).toBeNull();
    });

    it('preserves outletId in token payload', async () => {
      const token = await signAuthToken(mockDriver);
      const verified = await verifyAuthToken(token);
      expect(verified?.role).toBe('driver');
      expect(verified?.outletId).toBe('OUTLET-01');
    });

    it('returns null for an invalid or tampered token', async () => {
      const token = await signAuthToken(mockDispatcher);
      const tampered = token.slice(0, -6) + 'abcdef';
      const result = await verifyAuthToken(tampered);
      expect(result).toBeNull();
    });

    it('returns null for malformed strings', async () => {
      expect(await verifyAuthToken('not-a-token')).toBeNull();
      expect(await verifyAuthToken('')).toBeNull();
    });
  });

  describe('getCurrentUser (session.ts)', () => {
    it('returns null when auth cookie is absent', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue(undefined),
      };
      (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);

      const user = await getCurrentUser();
      expect(user).toBeNull();
      expect(mockCookieStore.get).toHaveBeenCalledWith(AUTH_COOKIE_NAME);
    });

    it('returns null when cookie exists but contains empty value', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: '' }),
      };
      (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);

      const user = await getCurrentUser();
      expect(user).toBeNull();
    });

    it('returns verified payload when valid cookie is present', async () => {
      const token = await signAuthToken(mockDispatcher);
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: token }),
      };
      (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);

      const user = await getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.email).toBe(mockDispatcher.email);
      expect(user?.role).toBe('dispatcher');
    });
  });

  describe('requireUserRole (session.ts)', () => {
    it('throws Unauthorized when no session exists', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue(undefined),
      };
      (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);

      await expect(requireUserRole(['dispatcher', 'driver'])).rejects.toThrow('Unauthorized');
    });

    it('throws Forbidden when user role is not in permitted roles list', async () => {
      const token = await signAuthToken(mockDriver);
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: token }),
      };
      (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);

      await expect(requireUserRole(['dispatcher', 'loader'])).rejects.toThrow('Forbidden');
    });

    it('resolves successfully when user role is permitted', async () => {
      const token = await signAuthToken(mockDriver);
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: token }),
      };
      (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);

      const user = await requireUserRole(['driver', 'store']);
      expect(user).not.toBeNull();
      expect(user.role).toBe('driver');
      expect(user.name).toBe('Driver Dave');
    });
  });
});
