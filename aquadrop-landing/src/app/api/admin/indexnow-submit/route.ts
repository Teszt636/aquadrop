import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import {
  fetchAquadropSitemapUrls,
  MissingIndexNowKeyError,
  SEO_CORE_INDEXNOW_URLS,
  SitemapFetchError,
  submitUrlsToIndexNow
} from '@/lib/seo/indexnow';

type IndexNowPreset = 'seo-core' | 'sitemap';

type IndexNowSubmitBody = {
  urls?: unknown;
  preset?: unknown;
  dryRun?: unknown;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function hasSitemapGatedSeoArticleUrl(urls: string[]): boolean {
  return urls.some((url) => {
    try {
      const parsedUrl = url.startsWith('/') ? new URL(url, 'https://www.aquadrop.hu') : new URL(url);
      const pathname = parsedUrl.pathname.replace(/\/+$/, '') || '/';
      return /^\/tudastar\/[^/]+$/.test(pathname) || /^\/partner\/tudastar\/[^/]+$/.test(pathname);
    } catch {
      return false;
    }
  });
}

type ResolvedIndexNowRequest =
  | {
      urls: string[];
      preset: IndexNowPreset | null;
      knownIndexableUrls: string[];
    }
  | NextResponse;

async function getUrlsFromBody(body: IndexNowSubmitBody): Promise<ResolvedIndexNowRequest> {
  const urls: string[] = [];
  let knownIndexableUrls: string[] = [];
  let preset: IndexNowPreset | null = null;

  if (body.preset !== undefined) {
    if (body.preset !== 'seo-core' && body.preset !== 'sitemap') {
      return NextResponse.json({ success: false, error: 'Unknown preset.' }, { status: 400 });
    }

    preset = body.preset;

    if (body.preset === 'seo-core') {
      urls.push(...SEO_CORE_INDEXNOW_URLS);
    } else {
      knownIndexableUrls = await fetchAquadropSitemapUrls();
      urls.push(...knownIndexableUrls);
    }
  }

  if (body.urls !== undefined) {
    if (!isStringArray(body.urls)) {
      return NextResponse.json({ success: false, error: 'urls must be an array of strings.' }, { status: 400 });
    }

    urls.push(...body.urls);
  }

  if (urls.length === 0) {
    return NextResponse.json({ success: false, error: 'Provide urls or preset: seo-core/sitemap.' }, { status: 400 });
  }

  if (knownIndexableUrls.length === 0 && hasSitemapGatedSeoArticleUrl(urls)) {
    knownIndexableUrls = await fetchAquadropSitemapUrls();
  }

  return { urls, preset, knownIndexableUrls };
}

export async function POST(request: Request) {
  const sessionUser = await requireAdminSession(['admin']);

  if (!sessionUser) {
    return NextResponse.json({ success: false, error: 'Nincs admin jogosultsag.' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as IndexNowSubmitBody;
    const resolvedRequest = await getUrlsFromBody(body);

    if (resolvedRequest instanceof NextResponse) {
      return resolvedRequest;
    }

    const result = await submitUrlsToIndexNow(resolvedRequest.urls, {
      dryRun: body.dryRun === true,
      knownIndexableUrls: resolvedRequest.knownIndexableUrls
    });

    return NextResponse.json({
      success: true,
      preset: resolvedRequest.preset,
      ...result,
      submittedCount: result.submitted.length,
      skippedCount: result.skipped.length
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
    }

    if (error instanceof MissingIndexNowKeyError) {
      return NextResponse.json(
        { success: false, error: 'INDEXNOW_KEY nincs beallitva, IndexNow kuldes nem indult.' },
        { status: 500 }
      );
    }

    if (error instanceof SitemapFetchError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 502 });
    }

    console.error('[indexnow] admin route failed', { error });
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'IndexNow submit failed.' },
      { status: 500 }
    );
  }
}
