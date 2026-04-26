import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

import { ADMIN_SESSION_COOKIE } from '@/lib/admin/constants';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error('Missing required environment variable: ADMIN_PASSWORD');
  }

  return password;
}

function getSessionTokenValue(): string {
  return createHash('sha256').update(`aquadrop-admin:${getAdminPassword()}`).digest('hex');
}

export function isAdminPasswordValid(password: string): boolean {
  const expected = Buffer.from(getAdminPassword());
  const provided = Buffer.from(password ?? '');

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/'
  };
}

export async function isAdminSessionValid(): Promise<boolean> {
  const cookieStore = await cookies();
  const currentToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!currentToken) {
    return false;
  }

  return currentToken === getSessionTokenValue();
}

export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, getSessionTokenValue(), getAdminCookieOptions());
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
