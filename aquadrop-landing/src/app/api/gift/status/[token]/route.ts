import { NextResponse } from 'next/server';

import { fetchGiftClaimPublicStatusByToken } from '@/lib/gift/status';

type Context = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(_: Request, context: Context) {
  const { token } = await context.params;

  if (!token?.trim()) {
    return NextResponse.json({ error: 'Érvénytelen kérés.' }, { status: 400 });
  }

  try {
    const status = await fetchGiftClaimPublicStatusByToken(token);

    if (!status) {
      return NextResponse.json({ error: 'Nem található ilyen igénylés.' }, { status: 404 });
    }

    return NextResponse.json(status, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('[gift-status][public-api] Failed to fetch claim status', error);
    return NextResponse.json({ error: 'A státusz jelenleg nem elérhető.' }, { status: 500 });
  }
}
