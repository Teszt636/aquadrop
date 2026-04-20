import 'server-only';

import { NEXT_PUBLIC_SUPABASE_URL } from '@/lib/env';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

type InsertPayload = Record<string, JsonValue> | Array<Record<string, JsonValue>>;

const SUPABASE_URL = NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

const SUPABASE_SERVICE_ROLE_KEY = requireEnv(
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  'SUPABASE_SERVICE_ROLE_KEY'
);

const supabaseAdminConfig = {
  restUrl: `${SUPABASE_URL}/rest/v1`,
  serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY
} as const;

function getAdminHeaders(additionalHeaders?: HeadersInit): HeadersInit {
  return {
    apikey: supabaseAdminConfig.serviceRoleKey,
    Authorization: `Bearer ${supabaseAdminConfig.serviceRoleKey}`,
    'Content-Type': 'application/json',
    ...(additionalHeaders ?? {})
  };
}

export async function selectFromTableAsAdmin<TResponse = unknown>(
  table: string,
  queryParams: URLSearchParams
): Promise<TResponse[]> {
  const response = await fetch(`${supabaseAdminConfig.restUrl}/${table}?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAdminHeaders()
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`Supabase admin select failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as TResponse[];
}

export async function insertIntoTableAsAdmin<TResponse = unknown>(
  table: string,
  payload: InsertPayload
): Promise<TResponse | null> {
  const response = await fetch(`${supabaseAdminConfig.restUrl}/${table}`, {
    method: 'POST',
    headers: getAdminHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`Supabase admin insert failed (${response.status}): ${errorText}`);
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as TResponse;
}
