import { NEXT_PUBLIC_SUPABASE_URL } from '@/lib/env';
import { type AdminTableName } from '@/lib/admin/constants';

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

const REST_URL = `${NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/rest/v1`;

function getServiceHeaders(additionalHeaders?: HeadersInit): HeadersInit {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    ...(additionalHeaders ?? {})
  };
}

async function fetchRowsWithOrder(table: AdminTableName, order: string) {
  const query = new URLSearchParams({
    select: '*',
    order,
    limit: '200'
  });

  return fetch(`${REST_URL}/${table}?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });
}

export async function fetchAdminTableRows(table: AdminTableName): Promise<Record<string, unknown>[]> {
  let response = await fetchRowsWithOrder(table, 'updated_at.desc.nullslast,created_at.desc.nullslast');

  if (!response.ok) {
    const firstError = await response.text();

    if (firstError.includes('updated_at')) {
      response = await fetchRowsWithOrder(table, 'created_at.desc.nullslast');
    } else {
      throw new Error(`Failed to read ${table}: ${response.status} ${firstError}`);
    }
  }

  if (!response.ok) {
    throw new Error(`Failed to read ${table}: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as Record<string, unknown>[];
}

export async function patchAdminTableRow(
  table: AdminTableName,
  id: string,
  updates: Record<string, unknown>
): Promise<void> {
  const response = await fetch(`${REST_URL}/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: getServiceHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error(`Failed to update ${table}: ${response.status} ${await response.text()}`);
  }
}

export async function deleteAdminTableRow(table: AdminTableName, id: string): Promise<void> {
  const response = await fetch(`${REST_URL}/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getServiceHeaders({ Prefer: 'return=minimal' })
  });

  if (!response.ok) {
    throw new Error(`Failed to delete from ${table}: ${response.status} ${await response.text()}`);
  }
}
