import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import { fetchGiftActivityLogs } from '@/lib/admin/supabase-admin';

async function assertSession() {
  const user = await requireAdminSession(['admin', 'crm_user']);
  if (!user) {
    return NextResponse.json({ error: 'Nincs CRM jogosultság.' }, { status: 403 });
  }

  return null;
}

export async function GET(request: Request) {
  const sessionError = await assertSession();

  if (sessionError) {
    return sessionError;
  }

  const giftClaimId = new URL(request.url).searchParams.get('giftClaimId');

  if (!giftClaimId) {
    return NextResponse.json({ error: 'Hiányzó giftClaimId paraméter.' }, { status: 400 });
  }

  try {
    const rows = await fetchGiftActivityLogs(giftClaimId);
    return NextResponse.json({ rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lekérdezési hiba.' },
      { status: 500 }
    );
  }
}
