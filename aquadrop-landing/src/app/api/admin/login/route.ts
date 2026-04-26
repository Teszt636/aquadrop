import { NextResponse } from 'next/server';

import { isAdminPasswordValid, setAdminSessionCookie } from '@/lib/admin/auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };

    if (!body.password || !isAdminPasswordValid(body.password)) {
      return NextResponse.json({ error: 'Hibás jelszó.' }, { status: 401 });
    }

    await setAdminSessionCookie();

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
