const NOREPLY_EMAIL = 'noreply@aquadrop.hu';
const CANONICAL_SENDER = 'Aquadrop Ügyfélszolgálat <noreply@aquadrop.hu>';

type ResolveSenderEmailOptions = {
  allowFallback?: boolean;
};

export function getCanonicalAquadropSenderEmail(): string {
  return CANONICAL_SENDER;
}

export function resolveAquadropSenderEmail(options: ResolveSenderEmailOptions = {}): string {
  const configuredFrom = process.env.EMAIL_FROM?.trim();

  if (configuredFrom) {
    if (configuredFrom.toLowerCase().includes(NOREPLY_EMAIL)) {
      return CANONICAL_SENDER;
    }

    return configuredFrom;
  }

  if (options.allowFallback) {
    return CANONICAL_SENDER;
  }

  throw new Error('Missing required server environment variable: EMAIL_FROM');
}
