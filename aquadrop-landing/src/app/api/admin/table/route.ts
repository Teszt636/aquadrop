import { NextResponse } from 'next/server';

import { ADMIN_TABLE_SET, type AdminTableName } from '@/lib/admin/constants';
import { requireAdminSession } from '@/lib/admin/auth';
import {
  deleteAdminTableRow,
  fetchAdminTableRowById,
  fetchAdminUsers,
  fetchAdminTableRows,
  insertResellerActivityLogs,
  patchAdminTableRow
} from '@/lib/admin/supabase-admin';
import { GIFT_STATUS_OPTIONS, RESELLER_PIPELINE_OPTIONS } from '@/lib/admin/table-config';

const EDITABLE_FIELDS: Record<AdminTableName, string[]> = {
  announcement_signups: ['name', 'email'],
  gift_claims: [
    'status',
    'full_name',
    'email',
    'phone',
    'shipping_address',
    'purchase_location',
    'purchase_date',
    'admin_note'
  ],
  reseller_applications: [
    'pipeline_status',
    'assigned_to',
    'next_action_description',
    'previous_contacted_at',
    'next_action_date',
    'next_action_at',
    'last_contacted_at',
    'lead_score',
    'is_hot_lead',
    'company_name',
    'contact_name',
    'email',
    'phone',
    'website',
    'sales_channel',
    'message'
  ],
  admin_users: ['name', 'email', 'role', 'is_active'],
  media_kit_downloads: [],
  unsubscribed: ['name', 'email']
};

const RESSELLER_TRACKED_FIELDS = new Set([
  'pipeline_status',
  'assigned_to',
  'is_hot_lead',
  'lead_score',
  'next_action_at',
  'next_action_description',
  'last_contacted_at',
  'previous_contacted_at'
]);

const FIELD_LABELS: Record<string, string> = {
  pipeline_status: 'Státusz',
  assigned_to: 'Felelős',
  is_hot_lead: 'Hot lead',
  lead_score: 'Lead score',
  next_action_at: 'Következő teendő időpontja',
  next_action_description: 'Következő teendő',
  last_contacted_at: 'Utolsó kapcsolatfelvétel',
  previous_contacted_at: 'Előző kapcsolatfelvétel'
};

type PatchRequestBody = {
  table?: string;
  id?: string;
  updates?: Record<string, unknown>;
};

type SupabaseErrorDetails = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
  raw?: string;
};

function sanitizeValue(key: string, value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (key === 'is_hot_lead') {
    if (typeof value === 'boolean') {
      return value;
    }
    if (value === 'true') return true;
    if (value === 'false') return false;
    throw new Error('A hot lead értéke csak logikai (boolean) lehet.');
  }

  if (key === 'lead_score') {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error('A lead score csak szám lehet.');
    }
    if (parsed < 0 || parsed > 100) {
      throw new Error('A lead score csak 0 és 100 között lehet.');
    }
    return Math.round(parsed);
  }

  if (key === 'next_action_date') {
    if (value === '' || value === null) return null;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error('A következő teendő dátuma hibás.');
    }
    return value;
  }

  if (key === 'next_action_at') {
    if (value === '' || value === null) return null;
    if (typeof value !== 'string') {
      throw new Error('A következő teendő időpontja hibás.');
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error('A következő teendő időpontja hibás.');
    }
    const hour = parsed.getUTCHours();
    const minute = parsed.getUTCMinutes();
    if (hour < 6 || hour > 20) {
      throw new Error('A következő teendő órája csak 06:00 és 20:00 között lehet.');
    }
    if (![0, 15, 30, 45].includes(minute)) {
      throw new Error('A következő teendő perce csak 00, 15, 30 vagy 45 lehet.');
    }
    return parsed.toISOString();
  }

  if (key === 'assigned_to') {
    if (value === '' || value === null || value === 'Nincs felelős') return null;
    if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
      throw new Error('A felelős azonosítója hibás.');
    }
    return value;
  }

  if (key === 'last_contacted_at' || key === 'previous_contacted_at') {
    if (value === '' || value === null) return null;
    if (typeof value !== 'string') {
      throw new Error('Az utolsó kapcsolatfelvétel hibás.');
    }
    const normalized = value.includes('T') ? value : `${value}T00:00:00`;
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error('Az utolsó kapcsolatfelvétel hibás.');
    }
    return parsed.toISOString();
  }

  if (key === 'pipeline_status') {
    if (typeof value !== 'string' || !RESELLER_PIPELINE_OPTIONS.includes(value)) {
      throw new Error('Érvénytelen pipeline státusz.');
    }
    return value;
  }

  if (key === 'status') {
    if (typeof value !== 'string' || !GIFT_STATUS_OPTIONS.includes(value)) {
      throw new Error('Érvénytelen státusz.');
    }
    return value;
  }

  if (value === '') {
    return null;
  }

  return value;
}

function getSafeTableName(table: unknown): AdminTableName | null {
  if (typeof table !== 'string' || !ADMIN_TABLE_SET.has(table)) {
    return null;
  }

  return table as AdminTableName;
}

function normalizeText(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return String(value);
}

function formatDateTime(value: unknown): string {
  if (!value) return '—';
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return normalizeText(value);

  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsed);
}

function formatFieldValue(fieldName: string, value: unknown, adminMap: Map<string, { name: string }>): string {
  if (fieldName === 'assigned_to') {
    if (!value) return 'Nincs felelős';
    const userId = String(value);
    return adminMap.get(userId)?.name ?? userId;
  }
  if (fieldName === 'is_hot_lead') {
    return value ? 'Igen' : 'Nem';
  }
  if (fieldName === 'next_action_at' || fieldName === 'last_contacted_at' || fieldName === 'previous_contacted_at') {
    return formatDateTime(value);
  }
  if (fieldName === 'lead_score') {
    if (value === null || value === undefined || value === '') return '0';
    return String(value);
  }

  return normalizeText(value);
}

function equalLogValues(oldValue: unknown, newValue: unknown): boolean {
  const normalizeNullable = (value: unknown): unknown => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return value;
  };

  const normalizeBoolean = (value: unknown): boolean | null => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      if (value === 'true') return true;
      if (value === 'false') return false;
    }
    return null;
  };

  const normalizeNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  };

  const normalizeUuid = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const normalized = value.trim().toLowerCase();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(normalized)) {
      return null;
    }
    return normalized;
  };

  const normalizeDate = (value: unknown): string | null => {
    if (typeof value !== 'string' || value.trim() === '') return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
  };

  const normalizedOld = normalizeNullable(oldValue);
  const normalizedNew = normalizeNullable(newValue);

  if (normalizedOld === null || normalizedNew === null) {
    return normalizedOld === normalizedNew;
  }

  const oldBool = normalizeBoolean(normalizedOld);
  const newBool = normalizeBoolean(normalizedNew);
  if (oldBool !== null && newBool !== null) {
    return oldBool === newBool;
  }

  const oldNum = normalizeNumber(normalizedOld);
  const newNum = normalizeNumber(normalizedNew);
  if (oldNum !== null && newNum !== null) {
    return oldNum === newNum;
  }

  const oldUuid = normalizeUuid(normalizedOld);
  const newUuid = normalizeUuid(normalizedNew);
  if (oldUuid !== null && newUuid !== null) {
    return oldUuid === newUuid;
  }

  const oldDate = normalizeDate(normalizedOld);
  const newDate = normalizeDate(normalizedNew);
  if (oldDate !== null && newDate !== null) {
    return oldDate === newDate;
  }

  if (typeof normalizedOld === 'string' || typeof normalizedNew === 'string') {
    return String(normalizedOld) === String(normalizedNew);
  }

  return normalizedOld === normalizedNew;
}

function buildChangeSummary(fieldName: string, oldValue: string, newValue: string): string {
  const label = FIELD_LABELS[fieldName] ?? fieldName;
  return `${label} módosítva: ${oldValue} → ${newValue}`;
}

function parseSupabaseError(error: unknown): SupabaseErrorDetails {
  if (!(error instanceof Error)) {
    return { message: 'Ismeretlen hiba.' };
  }

  const raw = error.message ?? 'Ismeretlen hiba.';
  const jsonStart = raw.indexOf('{');
  if (jsonStart === -1) {
    return { message: raw, raw };
  }

  const maybeJson = raw.slice(jsonStart);
  try {
    const parsed = JSON.parse(maybeJson) as {
      code?: string;
      message?: string;
      details?: string;
      hint?: string;
    };

    return {
      code: parsed.code ?? null,
      message: parsed.message ?? raw,
      details: parsed.details ?? null,
      hint: parsed.hint ?? null,
      raw
    };
  } catch {
    return { message: raw, raw };
  }
}

function logPatchFailure(params: {
  table: AdminTableName;
  id: string;
  payload: Record<string, unknown>;
  sessionUser: unknown;
  error: unknown;
}) {
  const supabaseError = parseSupabaseError(params.error);

  console.error('[admin/table PATCH] reseller update failed', {
    table: params.table,
    recordId: params.id,
    payloadFields: Object.keys(params.payload),
    payload: params.payload,
    sessionUser: params.sessionUser,
    supabaseError
  });
}

function logActivityInsertFailure(params: {
  table: AdminTableName;
  id: string;
  payload: Record<string, unknown>;
  sessionUser: unknown;
  error: unknown;
}) {
  const supabaseError = parseSupabaseError(params.error);

  console.error('[admin/table PATCH] activity log insert failed', {
    table: params.table,
    recordId: params.id,
    payloadFields: Object.keys(params.payload),
    payload: params.payload,
    sessionUser: params.sessionUser,
    supabaseError
  });
}

async function assertSession(table: AdminTableName, method: 'GET' | 'PATCH' | 'DELETE') {
  if (table === 'admin_users') {
    const user = await requireAdminSession(['admin']);
    if (!user) {
      return { error: NextResponse.json({ error: 'Nincs admin jogosultság.' }, { status: 403 }), sessionUser: null };
    }
    return { error: null, sessionUser: user };
  }

  if (table === 'reseller_applications') {
    const user = await requireAdminSession(method === 'DELETE' ? ['admin'] : ['admin', 'crm_user']);
    if (!user) {
      return {
        error: NextResponse.json({ error: 'Nincs CRM jogosultság.' }, { status: 403 }),
        sessionUser: null
      };
    }
    return { error: null, sessionUser: user };
  }

  if (method === 'GET') {
    const user = await requireAdminSession(['admin']);
    if (!user) {
      return { error: NextResponse.json({ error: 'Nincs admin jogosultság.' }, { status: 403 }), sessionUser: null };
    }
    return { error: null, sessionUser: user };
  }

  return {
    error: NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 }),
    sessionUser: null
  };
}

export async function GET(request: Request) {
  const table = getSafeTableName(new URL(request.url).searchParams.get('name'));

  if (!table) {
    return NextResponse.json({ error: 'Nem engedélyezett tábla.' }, { status: 400 });
  }
  const { error: sessionError } = await assertSession(table, 'GET');
  if (sessionError) return sessionError;

  try {
    const rows = await fetchAdminTableRows(table);
    const adminUsers = table === 'reseller_applications' ? await fetchAdminUsers(false) : [];

    return NextResponse.json({ rows, adminUsers });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lekérdezési hiba.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  let parsedBody: PatchRequestBody = {};
  let requestTable: AdminTableName | null = null;
  let requestId = 'unknown';
  let requestPayload: Record<string, unknown> = {};
  let requestSessionUser: { id?: string | null; name?: string | null; email?: string | null } | null = null;
  let debugUpdatedFields: string[] = [];
  let debugInsertedActivityLogs: Array<Record<string, unknown>> = [];
  const debugActivityLogErrors: Array<Record<string, unknown>> = [];
  let debugActivityLogAttempted = false;
  let debugActivityLogInserted = false;
  let debugActivityLogError: Record<string, unknown> | null = null;

  try {
    const body = (await request.json()) as PatchRequestBody;
    parsedBody = body;
    requestTable = getSafeTableName(body.table);
    requestId = typeof body.id === 'string' ? body.id : 'unknown';
    requestPayload = (body.updates ?? {}) as Record<string, unknown>;
    const table = requestTable;

    if (!table) {
      return NextResponse.json({ success: false, error: 'Nem engedélyezett tábla.', details: null }, { status: 400 });
    }
    const { error: sessionError, sessionUser } = await assertSession(table, 'PATCH');
    if (sessionError) return sessionError;
    requestSessionUser = {
      id: sessionUser?.id ?? null,
      name: sessionUser?.name ?? null,
      email: sessionUser?.email ?? null
    };

    if (!body.id || typeof body.id !== 'string') {
      return NextResponse.json({ success: false, error: 'Hiányzó rekord azonosító.', details: null }, { status: 400 });
    }

    const updates = body.updates ?? {};
    const allowedFields = new Set(EDITABLE_FIELDS[table] ?? []);
    const sanitizedUpdates = Object.fromEntries(
      Object.entries(updates)
        .filter(([key]) => allowedFields.has(key))
        .map(([key, value]) => [key, sanitizeValue(key, value)])
        .filter(([, value]) => value !== undefined)
    );

    if ('pipeline_status' in sanitizedUpdates) {
      sanitizedUpdates.next_action_description = null;
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ success: false, error: 'Nincs menthető mező.', details: null }, { status: 400 });
    }

    let beforeRow: Record<string, unknown> | null = null;
    const shouldCreateLog = table === 'reseller_applications';
    const changedByUserId = sessionUser?.id ?? null;
    const changedByName = sessionUser?.name ?? null;
    const changedByEmail = sessionUser?.email ?? null;

    if (shouldCreateLog) {
      beforeRow = await fetchAdminTableRowById(table, body.id);

      if ('assigned_to' in sanitizedUpdates) {
        const assignedTo = sanitizedUpdates.assigned_to;
        if (assignedTo !== null) {
          const adminUsers = await fetchAdminUsers(true);
          const validAdminIds = new Set(adminUsers.map((user) => user.id));
          if (!validAdminIds.has(String(assignedTo))) {
            return NextResponse.json(
              { success: false, error: 'Érvénytelen felelős azonosító.', details: { assigned_to: assignedTo } },
              { status: 400 }
            );
          }
        }
      }

      if ('last_contacted_at' in sanitizedUpdates) {
        sanitizedUpdates.previous_contacted_at = beforeRow?.last_contacted_at ?? null;
        sanitizedUpdates.last_contacted_at = new Date().toISOString();
      }
    }

    await patchAdminTableRow(table, body.id, sanitizedUpdates);
    debugUpdatedFields = Object.keys(sanitizedUpdates);

    if (shouldCreateLog && beforeRow) {
      const [afterRow, adminUsers] = await Promise.all([
        fetchAdminTableRowById(table, body.id),
        fetchAdminUsers(false)
      ]);
      const adminMap = new Map(
        adminUsers
          .filter((user) => typeof user.id === 'string')
          .map((user) => [String(user.id), { name: normalizeText(user.name) }])
      );

      const trackedKeys = Object.keys(sanitizedUpdates).filter((key) => RESSELLER_TRACKED_FIELDS.has(key));
      const logs = trackedKeys
        .map((fieldName) => {
          const oldRawValue = beforeRow?.[fieldName];
          const newRawValue = afterRow?.[fieldName];
          if (equalLogValues(oldRawValue, newRawValue)) {
            return null;
          }

          const oldValue = formatFieldValue(fieldName, oldRawValue, adminMap);
          const newValue = formatFieldValue(fieldName, newRawValue, adminMap);

          return {
            reseller_application_id: String(afterRow?.id ?? body.id),
            changed_by_user_id: changedByUserId,
            changed_by_name: changedByName,
            changed_by_email: changedByEmail,
            field_name: fieldName,
            old_value: oldValue === '—' ? null : oldValue,
            new_value: newValue === '—' ? null : newValue,
            change_summary: buildChangeSummary(fieldName, oldValue, newValue)
          };
        })
        .filter(Boolean) as Array<Record<string, unknown>>;

      debugUpdatedFields = Object.keys(sanitizedUpdates).filter((fieldName) => {
        const oldRawValue = beforeRow?.[fieldName];
        const newRawValue = afterRow?.[fieldName];
        return !equalLogValues(oldRawValue, newRawValue);
      });

      if (logs.length > 0) {
        debugActivityLogAttempted = true;
        try {
          await insertResellerActivityLogs(logs);
          debugActivityLogInserted = true;
          debugInsertedActivityLogs = logs;
        } catch (activityLogError) {
          const parsedActivityError = parseSupabaseError(activityLogError);
          debugActivityLogError = parsedActivityError;
          debugActivityLogErrors.push({
            message: parsedActivityError.message ?? 'Ismeretlen activity log hiba.',
            code: parsedActivityError.code ?? null,
            details: parsedActivityError.details ?? null,
            hint: parsedActivityError.hint ?? null
          });
          logActivityInsertFailure({
            table,
            id: body.id,
            payload: sanitizedUpdates,
            sessionUser,
            error: activityLogError
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      updatedFields: debugUpdatedFields,
      insertedActivityLogs: debugInsertedActivityLogs,
      activityLogErrors: debugActivityLogErrors,
      activityLogAttempted: debugActivityLogAttempted,
      activityLogInserted: debugActivityLogInserted,
      activityLogError: debugActivityLogError
    });
  } catch (error) {
    logPatchFailure({
      table: requestTable ?? 'reseller_applications',
      id: requestId,
      payload: requestPayload,
      sessionUser: requestSessionUser ?? { id: null, name: null, email: null, table: parsedBody.table ?? null },
      error
    });

    const details = parseSupabaseError(error);
    return NextResponse.json(
      {
        success: false,
        error: details.message ?? 'Mentési hiba.',
        details
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as { table?: string; id?: string };
  const table = getSafeTableName(body.table);

  if (!table) {
    return NextResponse.json({ error: 'Nem engedélyezett tábla.' }, { status: 400 });
  }
  const { error: sessionError } = await assertSession(table, 'DELETE');
  if (sessionError) return sessionError;

  if (!body.id || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'Hiányzó rekord azonosító.' }, { status: 400 });
  }

  try {
    await deleteAdminTableRow(table, body.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Törlési hiba.' },
      { status: 500 }
    );
  }
}
