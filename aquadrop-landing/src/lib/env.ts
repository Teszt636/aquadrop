const REQUIRED_PUBLIC_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
] as const;

type PublicEnvKey = (typeof REQUIRED_PUBLIC_ENV_VARS)[number];

type PublicEnv = Record<PublicEnvKey, string>;

function getEnvValue(key: PublicEnvKey): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Add it to your .env.local file.`
    );
  }

  return value;
}

export const env = REQUIRED_PUBLIC_ENV_VARS.reduce<PublicEnv>((acc, key) => {
  acc[key] = getEnvValue(key);

  return acc;
}, {} as PublicEnv);
