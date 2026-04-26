import { NextResponse } from 'next/server';

import { ADMIN_TABLE_SET, type AdminTableName } from '@/lib/admin/constants';
import { isAdminSessionValid } from '@/lib/admin/auth';
import {
  deleteAdminTableRow,
  fetchAdminTableRows,
  patchAdminTableRow
} from '@/lib/admin/supabase-admin';

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
  const sanitizedUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
  );

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
