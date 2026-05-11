import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const indexNowKey = process.env.INDEXNOW_KEY?.trim();

  if (indexNowKey && request.nextUrl.pathname === `/${indexNowKey}.txt`) {
    return new NextResponse(indexNowKey, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }

  return NextResponse.next();
}
