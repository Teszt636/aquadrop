import { type AdminTableName } from '@/lib/admin/constants';

function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!value) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  return value;
}

function getServiceRoleKey(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!value) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return value;
}

function getRestUrl(): string {
  return `${getSupabaseUrl().replace(/\/$/, '')}/rest/v1`;
}

function getServiceHeaders(additionalHeaders?: HeadersInit): HeadersInit {
  const serviceRoleKey = getServiceRoleKey();

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
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

  return fetch(`${getRestUrl()}/${table}?${query.toString()}`, {
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
  const response = await fetch(`${getRestUrl()}/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: getServiceHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error(`Failed to update ${table}: ${response.status} ${await response.text()}`);
  }
}

export async function deleteAdminTableRow(table: AdminTableName, id: string): Promise<void> {
  const response = await fetch(`${getRestUrl()}/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getServiceHeaders({ Prefer: 'return=minimal' })
  });

  if (!response.ok) {
    throw new Error(`Failed to delete from ${table}: ${response.status} ${await response.text()}`);
  }
}
