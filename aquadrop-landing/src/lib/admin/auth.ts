import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

import { ADMIN_SESSION_COOKIE, MAIN_ADMIN_EMAIL, type AdminRole, type AdminSessionUser } from '@/lib/admin/constants';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
type SessionPayload = {
  v: 1;
  exp: number;
  user: AdminSessionUser;
};

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error('Missing required environment variable: ADMIN_PASSWORD');
  }

  return password;
}

function getSessionSecret(): string {
  return createHmac('sha256', 'aquadrop-session').update(getAdminPassword()).digest('hex');
}

function signPayload(serializedPayload: string): string {
  return createHmac('sha256', getSessionSecret()).update(serializedPayload).digest('hex');
}

function encodeSessionPayload(payload: SessionPayload): string {
  const serializedPayload = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(serializedPayload, 'utf8').toString('base64url');
  const signature = signPayload(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

function decodeSessionPayload(token: string): SessionPayload | null {
  const [payloadBase64, signature] = token.split('.');

  if (!payloadBase64 || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payloadBase64);
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const providedBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8')) as SessionPayload;

    if (payload?.v !== 1 || !payload.exp || !payload.user?.email || !payload.user?.role) {
      return null;
    }

    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function isAdminPasswordValid(password: string): boolean {
  const expected = Buffer.from(getAdminPassword());
  const provided = Buffer.from(password ?? '');

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}

export function isMainAdminCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === MAIN_ADMIN_EMAIL && isAdminPasswordValid(password);
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

export async function getAdminSessionUser(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const currentToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!currentToken) {
    return null;
  }

  const payload = decodeSessionPayload(currentToken);
  return payload?.user ?? null;
}

export async function isAdminSessionValid(): Promise<boolean> {
  return (await getAdminSessionUser()) !== null;
}

export async function setAdminSessionCookie(user: AdminSessionUser): Promise<void> {
  const cookieStore = await cookies();
  const payload: SessionPayload = {
    v: 1,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    user
  };

  cookieStore.set(ADMIN_SESSION_COOKIE, encodeSessionPayload(payload), getAdminCookieOptions());
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export function hasRequiredRole(userRole: AdminRole, allowedRoles: AdminRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export async function requireAdminSession(allowedRoles: AdminRole[]): Promise<AdminSessionUser | null> {
  const sessionUser = await getAdminSessionUser();

  if (!sessionUser) {
    return null;
  }

  if (!hasRequiredRole(sessionUser.role, allowedRoles)) {
    return null;
  }

  return sessionUser;
}
