import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const normalized = password.trim();
  if (!normalized) {
    throw new Error('A jelszó nem lehet üres.');
  }

  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(normalized, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P
  }).toString('hex');

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${hash}`;
}

export function verifyPassword(password: string, passwordHash: string | null | undefined): boolean {
  if (!passwordHash || !passwordHash.startsWith('scrypt$')) {
    return false;
  }

  const [algorithm, nRaw, rRaw, pRaw, salt, expectedHash] = passwordHash.split('$');

  if (algorithm !== 'scrypt' || !nRaw || !rRaw || !pRaw || !salt || !expectedHash) {
    return false;
  }

  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);

  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return false;
  }

  const computed = scryptSync(password.trim(), salt, KEY_LENGTH, { N: n, r, p });
  const expected = Buffer.from(expectedHash, 'hex');

  return expected.length === computed.length && timingSafeEqual(expected, computed);
}
