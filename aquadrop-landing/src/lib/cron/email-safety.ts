const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const recentEmailSends = new Map<string, number>();

function normalizeRecipient(recipient: string): string {
  return recipient.trim().toLowerCase();
}

function keyFor(recipient: string, type: string): string {
  return `${normalizeRecipient(recipient)}::${type}`;
}

export function cleanupEmailRateLimit(now: number = Date.now()): void {
  for (const [key, timestamp] of recentEmailSends.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
      recentEmailSends.delete(key);
    }
  }
}

export function checkEmailRateLimit(recipient: string, type: string, now: number = Date.now()) {
  cleanupEmailRateLimit(now);
  const key = keyFor(recipient, type);
  const lastSentAt = recentEmailSends.get(key);

  if (lastSentAt && now - lastSentAt < RATE_LIMIT_WINDOW_MS) {
    return {
      blocked: true,
      retryAfterMs: RATE_LIMIT_WINDOW_MS - (now - lastSentAt)
    } as const;
  }

  return { blocked: false } as const;
}

export function markEmailSent(recipient: string, type: string, now: number = Date.now()): void {
  recentEmailSends.set(keyFor(recipient, type), now);
}
