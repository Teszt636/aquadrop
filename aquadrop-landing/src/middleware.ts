import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CANONICAL_HOST = 'www.aquadrop.hu';
const LEGACY_HOST = 'aquadrop.hu';

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const host = request.headers.get('host');

  if (host === LEGACY_HOST) {
    const url = nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.protocol = 'https:';

    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
