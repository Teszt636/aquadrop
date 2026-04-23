import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { PRIMARY_HOST, PRIMARY_ORIGIN } from '@/lib/site';

const CANONICAL_HOSTS = new Set(['aquadrop.hu', PRIMARY_HOST]);

export function middleware(request: NextRequest) {
  const hostHeader = request.headers.get('host')?.toLowerCase();

  if (!hostHeader) {
    return NextResponse.next();
  }

  const currentHost = hostHeader.split(':')[0];

  if (!CANONICAL_HOSTS.has(currentHost)) {
    return NextResponse.next();
  }

  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim().toLowerCase();
  const isHttps = forwardedProto === 'https' || request.nextUrl.protocol === 'https:';
  const isPrimaryHost = currentHost === PRIMARY_HOST;

  if (isHttps && isPrimaryHost) {
    return NextResponse.next();
  }

  const redirectUrl = new URL(request.nextUrl.pathname, PRIMARY_ORIGIN);
  redirectUrl.search = request.nextUrl.search;

  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
