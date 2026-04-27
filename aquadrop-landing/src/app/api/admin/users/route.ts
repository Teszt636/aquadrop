import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import { hashPassword } from '@/lib/admin/password';
import { fetchAdminUsers, insertAdminUser, patchAdminTableRow } from '@/lib/admin/supabase-admin';

type CreateBody = {
  name?: string;
  email?: string;
  is_active?: boolean;
  password?: string;
};

type UpdateBody = {
  id?: string;
  name?: string;
  email?: string;
  is_active?: boolean;
  password?: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function assertAdmin() {
  const user = await requireAdminSession(['admin']);

  if (!user) {
    return NextResponse.json({ error: 'Nincs jogosultság.' }, { status: 403 });
  }

  return null;
}

export async function GET() {
  const errorResponse = await assertAdmin();
  if (errorResponse) return errorResponse;

  try {
    const rows = await fetchAdminUsers(true);
    return NextResponse.json({ rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sikertelen felhasználó lekérdezés.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const errorResponse = await assertAdmin();
  if (errorResponse) return errorResponse;

  try {
    const body = (await request.json()) as CreateBody;
    const name = (body.name ?? '').trim();
    const email = normalizeEmail(body.email ?? '');

    if (!name || !email) {
      return NextResponse.json({ error: 'A név és email kötelező.' }, { status: 400 });
    }

    const row: Record<string, unknown> = {
      name,
      email,
      role: 'crm_user',
      is_active: body.is_active ?? true
    };

    if (body.password?.trim()) {
      row.password_hash = hashPassword(body.password);
    }

    await insertAdminUser(row);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sikertelen felhasználó mentés.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const errorResponse = await assertAdmin();
  if (errorResponse) return errorResponse;

  try {
    const body = (await request.json()) as UpdateBody;

    if (!body.id) {
      return NextResponse.json({ error: 'Hiányzó felhasználó azonosító.' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};

    if (typeof body.name === 'string') {
      updates.name = body.name.trim();
    }
    if (typeof body.email === 'string') {
      updates.email = normalizeEmail(body.email);
    }
    if (typeof body.is_active === 'boolean') {
      updates.is_active = body.is_active;
    }
    if (typeof body.password === 'string' && body.password.trim()) {
      updates.password_hash = hashPassword(body.password);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nincs menthető mező.' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    await patchAdminTableRow('admin_users', body.id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sikertelen felhasználó frissítés.' },
      { status: 500 }
    );
  }
}
