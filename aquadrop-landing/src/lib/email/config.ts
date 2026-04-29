const HELLO_EMAIL = 'hello@aquadrop.hu';
const CANONICAL_SENDER = 'Aquadrop Ügyfélszolgálat <hello@aquadrop.hu>';

type ResolveSenderEmailOptions = {
  allowFallback?: boolean;
};

export function getCanonicalAquadropSenderEmail(): string {
  return CANONICAL_SENDER;
}

export function resolveAquadropSenderEmail(options: ResolveSenderEmailOptions = {}): string {
  const configuredFrom = process.env.RESEND_FROM_EMAIL?.trim() || process.env.EMAIL_FROM?.trim();

  if (configuredFrom) {
    const normalized = configuredFrom.toLowerCase();
    if (normalized.includes('noreply@aquadrop.hu') || normalized.includes('no-reply@aquadrop.hu')) {
      return CANONICAL_SENDER;
    }

    return configuredFrom;
  }

  if (options.allowFallback) {
    return CANONICAL_SENDER;
  }

  throw new Error('Missing required server environment variable: RESEND_FROM_EMAIL (or EMAIL_FROM)');
}
