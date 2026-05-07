import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import {
  MissingIndexNowKeyError,
  SEO_CORE_INDEXNOW_URLS,
  submitUrlsToIndexNow
} from '@/lib/seo/indexnow';

type IndexNowSubmitBody = {
  urls?: unknown;
  preset?: unknown;
  dryRun?: unknown;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function getUrlsFromBody(body: IndexNowSubmitBody): string[] | NextResponse {
  const urls: string[] = [];

  if (body.preset !== undefined) {
    if (body.preset !== 'seo-core') {
      return NextResponse.json({ success: false, error: 'Unknown preset.' }, { status: 400 });
    }

    urls.push(...SEO_CORE_INDEXNOW_URLS);
  }

  if (body.urls !== undefined) {
    if (!isStringArray(body.urls)) {
      return NextResponse.json({ success: false, error: 'urls must be an array of strings.' }, { status: 400 });
    }

    urls.push(...body.urls);
  }

  if (urls.length === 0) {
    return NextResponse.json({ success: false, error: 'Provide urls or preset: seo-core.' }, { status: 400 });
  }

  return urls;
}

export async function POST(request: Request) {
  const sessionUser = await requireAdminSession(['admin']);

  if (!sessionUser) {
    return NextResponse.json({ success: false, error: 'Nincs admin jogosultsag.' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as IndexNowSubmitBody;
    const urls = getUrlsFromBody(body);

    if (urls instanceof NextResponse) {
      return urls;
    }

    const result = await submitUrlsToIndexNow(urls, { dryRun: body.dryRun === true });

    return NextResponse.json({
      success: true,
      ...result
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

    console.error('[indexnow] admin route failed', { error });
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'IndexNow submit failed.' },
      { status: 500 }
    );
  }
}
