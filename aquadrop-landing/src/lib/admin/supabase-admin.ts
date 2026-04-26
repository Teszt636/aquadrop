import { type AdminBaseTableName, type AdminTableViewName } from '@/lib/admin/table-config';

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

function resolveSourceTable(table: AdminTableViewName): AdminBaseTableName {
  return table === 'unsubscribed' ? 'announcement_signups' : table;
}

async function fetchRowsWithOrder(table: AdminBaseTableName, order: string, extraQuery?: URLSearchParams) {
  const query = new URLSearchParams({
    select: '*',
    order,
    limit: '200'
  });
  if (extraQuery) {
    extraQuery.forEach((value, key) => query.set(key, value));
  }

  return fetch(`${getRestUrl()}/${table}?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });
}

export async function fetchAdminTableRows(table: AdminTableViewName): Promise<Record<string, unknown>[]> {
  const sourceTable = resolveSourceTable(table);
  const filters = new URLSearchParams();

  if (table === 'announcement_signups') {
    filters.set('is_subscribed', 'eq.true');
  }
  if (table === 'unsubscribed') {
    filters.set('is_subscribed', 'eq.false');
  }

  let response = await fetchRowsWithOrder(
    sourceTable,
    'updated_at.desc.nullslast,created_at.desc.nullslast',
    filters
  );

  if (!response.ok) {
    const firstError = await response.text();

    if (firstError.includes('is_subscribed')) {
      console.warn(`[admin] Missing is_subscribed on ${sourceTable}, using graceful fallback for ${table}.`);
      if (table === 'unsubscribed') {
        return [];
      }
      response = await fetchRowsWithOrder(sourceTable, 'updated_at.desc.nullslast,created_at.desc.nullslast');
    } else if (firstError.includes('updated_at')) {
      response = await fetchRowsWithOrder(sourceTable, 'created_at.desc.nullslast', filters);
    } else {
      throw new Error(`Failed to read ${sourceTable}: ${response.status} ${firstError}`);
    }
  }

  if (!response.ok) {
    throw new Error(`Failed to read ${sourceTable}: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as Record<string, unknown>[];
}

export async function patchAdminTableRow(
  table: AdminTableViewName,
  id: string,
  updates: Record<string, unknown>
): Promise<void> {
  const sourceTable = resolveSourceTable(table);

  const response = await fetch(`${getRestUrl()}/${sourceTable}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: getServiceHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error(`Failed to update ${sourceTable}: ${response.status} ${await response.text()}`);
  }
}

export async function deleteAdminTableRow(table: AdminTableViewName, id: string): Promise<void> {
  const sourceTable = resolveSourceTable(table);
  const response = await fetch(`${getRestUrl()}/${sourceTable}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getServiceHeaders({ Prefer: 'return=minimal' })
  });

  if (!response.ok) {
    throw new Error(`Failed to delete from ${sourceTable}: ${response.status} ${await response.text()}`);
  }
}
