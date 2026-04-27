import { NextResponse } from 'next/server';

import { isAdminSessionValid } from '@/lib/admin/auth';
import { fetchResellerActivityLogs } from '@/lib/admin/supabase-admin';

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

  const resellerId = new URL(request.url).searchParams.get('resellerId');

  if (!resellerId) {
    return NextResponse.json({ error: 'Hiányzó resellerId paraméter.' }, { status: 400 });
  }

  try {
    const rows = await fetchResellerActivityLogs(resellerId);
    return NextResponse.json({ rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lekérdezési hiba.' },
      { status: 500 }
    );
  }
}
