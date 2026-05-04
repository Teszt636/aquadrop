import { NextResponse } from 'next/server';

import { isMainAdminCredentials, setAdminSessionCookie } from '@/lib/admin/auth';
import { MAIN_ADMIN_EMAIL } from '@/lib/admin/constants';
import { verifyPassword } from '@/lib/admin/password';
import { fetchAdminUserByEmail, findOrCreateAdminUser } from '@/lib/admin/supabase-admin';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = normalizeEmail(body.email ?? '');
    const password = body.password ?? '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email és jelszó megadása kötelező.' }, { status: 400 });
    }

    if (isMainAdminCredentials(email, password)) {
      const mainAdminUser = await findOrCreateAdminUser({
        email: MAIN_ADMIN_EMAIL,
        name: 'Aquadrop Admin',
        role: 'admin',
        isActive: true
      });

      await setAdminSessionCookie({
        id: mainAdminUser.id,
        name: mainAdminUser.name,
        email: mainAdminUser.email,
        role: 'admin'
      });
      return NextResponse.json({ success: true });
    }

    const user = await fetchAdminUserByEmail(email);

    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'Nincs jogosultságod a belépésre.' }, { status: 401 });
    }

    if (user.role !== 'crm_user') {
      return NextResponse.json({ error: 'Érvénytelen felhasználói szerepkör.' }, { status: 401 });
    }

    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Hibás email vagy jelszó.' }, { status: 401 });
    }

    await setAdminSessionCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'crm_user'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Bejelentkezési hiba történt.'
      },
      { status: 500 }
    );
  }
}
