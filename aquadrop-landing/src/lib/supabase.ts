import {
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL
} from '@/lib/env';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

type InsertPayload = Record<string, JsonValue> | Array<Record<string, JsonValue>>;

const SUPABASE_URL = NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: NEXT_PUBLIC_SUPABASE_ANON_KEY,
  restUrl: `${SUPABASE_URL}/rest/v1`,
  storageUrl: `${SUPABASE_URL}/storage/v1`
} as const;

export function getSupabaseHeaders(additionalHeaders?: HeadersInit): HeadersInit {
  return {
    apikey: supabaseConfig.anonKey,
    Authorization: `Bearer ${supabaseConfig.anonKey}`,
    'Content-Type': 'application/json',
    ...(additionalHeaders ?? {})
  };
}

export async function insertIntoTable<TResponse = unknown>(
  table: string,
  payload: InsertPayload
): Promise<TResponse | null> {
  const response = await fetch(`${supabaseConfig.restUrl}/${table}`, {
    method: 'POST',
    headers: getSupabaseHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`Supabase insert failed (${response.status}): ${errorText}`);
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as TResponse;
}

export function getStorageUploadUrl(bucket: string, objectPath: string): string {
  return `${supabaseConfig.storageUrl}/object/${bucket}/${objectPath}`;
}
