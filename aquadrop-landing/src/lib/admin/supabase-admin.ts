import { type AdminBaseTableName, type AdminTableViewName } from '@/lib/admin/table-config';
import { type AdminRole } from '@/lib/admin/constants';

type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  password_hash?: string | null;
};

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

  const defaultOrder =
    table === 'reseller_applications'
      ? 'next_action_at.asc.nullslast,updated_at.desc.nullslast,created_at.desc.nullslast'
      : table === 'gift_claims'
        ? 'next_action_at.asc.nullslast,updated_at.desc.nullslast,created_at.desc.nullslast'
      : 'updated_at.desc.nullslast,created_at.desc.nullslast';

  let response = await fetchRowsWithOrder(sourceTable, defaultOrder, filters);

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

export async function fetchAdminTableRowById(
  table: AdminTableViewName,
  id: string
): Promise<Record<string, unknown> | null> {
  const sourceTable = resolveSourceTable(table);
  const query = new URLSearchParams({
    select: '*',
    id: `eq.${id}`,
    limit: '1'
  });

  const response = await fetch(`${getRestUrl()}/${sourceTable}?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to read ${sourceTable} row: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as Record<string, unknown>[];
  return rows[0] ?? null;
}

export async function fetchAdminUsers(includeInactive = true): Promise<AdminUserRecord[]> {
  const query = new URLSearchParams({
    select: 'id,name,email,role,is_active,created_at,updated_at',
    order: 'name.asc',
    limit: '200'
  });

  if (!includeInactive) {
    query.set('is_active', 'eq.true');
  }

  const response = await fetch(`${getRestUrl()}/admin_users?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to read admin_users: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as AdminUserRecord[];
}

export async function fetchAdminUserByEmail(email: string): Promise<AdminUserRecord | null> {
  const query = new URLSearchParams({
    select: 'id,name,email,role,is_active,password_hash',
    email: `eq.${email.toLowerCase()}`,
    limit: '1'
  });

  const response = await fetch(`${getRestUrl()}/admin_users?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to read admin user by email: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as AdminUserRecord[];
  return rows[0] ?? null;
}

export async function insertAdminUser(row: Record<string, unknown>): Promise<void> {
  const response = await fetch(`${getRestUrl()}/admin_users`, {
    method: 'POST',
    headers: getServiceHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify([row])
  });

  if (!response.ok) {
    throw new Error(`Failed to insert admin user: ${response.status} ${await response.text()}`);
  }
}

export async function insertAdminTableRow(
  table: AdminTableViewName,
  row: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const sourceTable = resolveSourceTable(table);
  const response = await fetch(`${getRestUrl()}/${sourceTable}`, {
    method: 'POST',
    headers: getServiceHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify([row])
  });

  if (!response.ok) {
    throw new Error(`Failed to insert into ${sourceTable}: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as Record<string, unknown>[];
  return rows[0] ?? row;
}

export async function findOrCreateAdminUser(params: {
  email: string;
  name: string;
  role: AdminRole;
  isActive?: boolean;
}): Promise<AdminUserRecord> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const isActive = params.isActive ?? true;

  const existingUser = await fetchAdminUserByEmail(normalizedEmail);
  if (existingUser) {
    return existingUser;
  }

  try {
    await insertAdminUser({
      email: normalizedEmail,
      name: params.name,
      role: params.role,
      is_active: isActive
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    const isConflict = message.includes('409') || message.includes('duplicate key');
    if (!isConflict) {
      throw error;
    }
  }

  const createdUser = await fetchAdminUserByEmail(normalizedEmail);
  if (createdUser) {
    return createdUser;
  }

  throw new Error(`Failed to find or create admin user for ${normalizedEmail}.`);
}

export async function fetchResellerActivityLogs(resellerId: string): Promise<Record<string, unknown>[]> {
  const query = new URLSearchParams({
    select: '*',
    reseller_application_id: `eq.${resellerId}`,
    order: 'created_at.desc',
    limit: '200'
  });

  const response = await fetch(`${getRestUrl()}/reseller_activity_logs?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to read reseller_activity_logs: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as Record<string, unknown>[];
}

export async function insertResellerActivityLogs(rows: Record<string, unknown>[]): Promise<void> {
  if (rows.length === 0) return;

  const response = await fetch(`${getRestUrl()}/reseller_activity_logs`, {
    method: 'POST',
    headers: getServiceHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    throw new Error(`Failed to insert reseller_activity_logs: ${response.status} ${await response.text()}`);
  }
}

export async function fetchGiftActivityLogs(giftClaimId: string): Promise<Record<string, unknown>[]> {
  const query = new URLSearchParams({
    select: '*',
    gift_claim_id: `eq.${giftClaimId}`,
    order: 'created_at.desc',
    limit: '200'
  });

  const response = await fetch(`${getRestUrl()}/gift_activity_logs?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to read gift_activity_logs: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as Record<string, unknown>[];
}

export async function insertGiftActivityLogs(rows: Record<string, unknown>[]): Promise<void> {
  if (rows.length === 0) return;

  const response = await fetch(`${getRestUrl()}/gift_activity_logs`, {
    method: 'POST',
    headers: getServiceHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    throw new Error(`Failed to insert gift_activity_logs: ${response.status} ${await response.text()}`);
  }
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
