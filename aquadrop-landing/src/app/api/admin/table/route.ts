import { NextResponse } from 'next/server';

import { ADMIN_TABLE_SET, type AdminTableName } from '@/lib/admin/constants';
import { isAdminSessionValid } from '@/lib/admin/auth';
import {
  deleteAdminTableRow,
  fetchAdminTableRows,
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
    'admin_note',
    'next_action_date',
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
  media_kit_downloads: [],
  unsubscribed: ['name', 'email']
};

function sanitizeValue(key: string, value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (key === 'is_hot_lead') {
    return value === true || value === 'true';
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

  if (key === 'last_contacted_at') {
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

async function assertSession() {
  const isValid = await isAdminSessionValid();

  if (!isValid) {
    return NextResponse.json({ error: 'Nincs admin jogosultság.' }, { status: 401 });
  }

  return null;
}

export async function GET(request: Request) {
  const sessionError = await assertSession();

  if (sessionError) {
    return sessionError;
  }

  const table = getSafeTableName(new URL(request.url).searchParams.get('name'));

  if (!table) {
    return NextResponse.json({ error: 'Nem engedélyezett tábla.' }, { status: 400 });
  }

  try {
    const rows = await fetchAdminTableRows(table);

    return NextResponse.json({ rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lekérdezési hiba.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const sessionError = await assertSession();

  if (sessionError) {
    return sessionError;
  }

  const body = (await request.json()) as {
    table?: string;
    id?: string;
    updates?: Record<string, unknown>;
  };

  const table = getSafeTableName(body.table);

  if (!table) {
    return NextResponse.json({ error: 'Nem engedélyezett tábla.' }, { status: 400 });
  }

  if (!body.id || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'Hiányzó rekord azonosító.' }, { status: 400 });
  }

  const updates = body.updates ?? {};
  const allowedFields = new Set(EDITABLE_FIELDS[table] ?? []);
  const sanitizedUpdates = Object.fromEntries(
    Object.entries(updates)
      .filter(([key]) => allowedFields.has(key))
      .map(([key, value]) => [key, sanitizeValue(key, value)])
      .filter(([, value]) => value !== undefined)
  );

  if (Object.keys(sanitizedUpdates).length === 0) {
    return NextResponse.json({ error: 'Nincs menthető mező.' }, { status: 400 });
  }

  try {
    await patchAdminTableRow(table, body.id, sanitizedUpdates);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Mentési hiba.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const sessionError = await assertSession();

  if (sessionError) {
    return sessionError;
  }

  const body = (await request.json()) as { table?: string; id?: string };
  const table = getSafeTableName(body.table);

  if (!table) {
    return NextResponse.json({ error: 'Nem engedélyezett tábla.' }, { status: 400 });
  }

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
