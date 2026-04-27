import { NextResponse } from 'next/server';

import { getAdminSessionUser } from '@/lib/admin/auth';

export async function GET() {
  const user = await getAdminSessionUser();

  if (!user) {
    return NextResponse.json({ error: 'Nincs aktív session.' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
