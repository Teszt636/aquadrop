import 'server-only';

import { articleConfig } from '@/lib/article-config';
import { PRIMARY_HOST, PRIMARY_ORIGIN } from '@/lib/site';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const DEFAULT_INDEXNOW_ORIGIN = PRIMARY_ORIGIN;

const CORE_SEO_PATHS = [
  '/',
  '/energiatakarekos-mosas',
  '/mosokapszula-vagy-folyekony-mososzer',
  '/mosokapszula-nem-oldodik-fel',
  '/mosokapszula-hasznalata',
  '/mosasi-koltseg-kalkulator',
  '/hogyan-mossunk-20-fokon',
  '/mosas-30-fokon-vagy-40-fokon'
] as const;

const STATIC_INDEXABLE_PATHS = [
  '/',
  '/partner',
  '/tudastar',
  '/partner/tudastar',
  '/adatvedelmi-tajekoztato',
  '/suti-tajekoztato',
  '/publikus-seo-oldal'
] as const;

const ARTICLE_PATHS = Object.keys(articleConfig).map((slug) => `/${slug}`);

const INDEXABLE_PATHS = new Set<string>([...STATIC_INDEXABLE_PATHS, ...ARTICLE_PATHS]);

const SITEMAP_GATED_INDEXABLE_PATH_PATTERNS = [
  /^\/tudastar\/[^/]+$/,
  /^\/partner\/tudastar\/[^/]+$/
];

const FORBIDDEN_SEGMENT_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /^admin(?:\/|$)/, reason: 'admin_url' },
  { pattern: /^api(?:\/|$)/, reason: 'api_url' },
  { pattern: /^koszonjuk(?:\/|$)/, reason: 'thank_you_url' },
  { pattern: /^ajandek-igenyles-statusz(?:\/|$)/, reason: 'gift_status_url' },
  { pattern: /^login(?:\/|$)/, reason: 'login_url' },
  { pattern: /^auth(?:\/|$)/, reason: 'auth_url' },
  { pattern: /(?:^|\/)(?:token|receipt|blokk|block|tracking)(?:\/|$)/, reason: 'private_or_tracking_url' }
];

const TOKEN_LIKE_SEGMENT_PATTERNS = [
  /^[0-9a-f]{24,}$/i,
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  /^[A-Za-z0-9_]{32,}$/,
  /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/
];

export const SEO_CORE_INDEXNOW_URLS = CORE_SEO_PATHS.map((path) => `${DEFAULT_INDEXNOW_ORIGIN}${path === '/' ? '/' : path}`);

export type IndexNowSkippedUrl = {
  url: string;
  reason: string;
};

export type SubmitUrlsToIndexNowResult = {
  dryRun: boolean;
  submitted: string[];
  skipped: IndexNowSkippedUrl[];
  indexNowStatus: number | null;
  indexNowResponseText?: string;
};

export class MissingIndexNowKeyError extends Error {
  constructor() {
    super('INDEXNOW_KEY is not configured.');
    this.name = 'MissingIndexNowKeyError';
  }
}

export class SitemapFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SitemapFetchError';
  }
}

function getIndexNowOrigin(): URL {
  const configuredHost = process.env.INDEXNOW_HOST?.trim() || DEFAULT_INDEXNOW_ORIGIN;
  const url = new URL(configuredHost);

  if (url.protocol !== 'https:' || url.hostname !== PRIMARY_HOST) {
    throw new Error('INDEXNOW_HOST must be https://www.aquadrop.hu');
  }

  return url;
}

function getIndexNowKey(): string {
  const key = process.env.INDEXNOW_KEY?.trim();

  if (!key) {
    throw new MissingIndexNowKeyError();
  }

  return key;
}

function decodeXmlEntity(value: string): string {
  const namedEntities: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    quot: '"'
  };

  return value.replace(/&(#x?[0-9a-f]+|amp|apos|gt|lt|quot);/gi, (entity, code: string) => {
    if (code[0] === '#') {
      const isHex = code[1]?.toLowerCase() === 'x';
      const parsedCode = Number.parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(parsedCode) ? String.fromCodePoint(parsedCode) : entity;
    }

    return namedEntities[code.toLowerCase()] ?? entity;
  });
}

export async function fetchAquadropSitemapUrls(): Promise<string[]> {
  const sitemapUrl = new URL('/sitemap.xml', getIndexNowOrigin()).toString();
  const response = await fetch(sitemapUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/xml, text/xml;q=0.9, */*;q=0.8'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new SitemapFetchError(`Sitemap fetch failed (${response.status}) for ${sitemapUrl}.`);
  }

  const xml = await response.text();
  const locMatches = xml.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi);
  const urls = new Set<string>();

  for (const match of locMatches) {
    const loc = match[1]?.trim();
    if (loc) {
      urls.add(decodeXmlEntity(loc));
    }
  }

  return [...urls];
}

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/+$/, '');
}

function getKnownIndexablePathSet(urls?: string[]): Set<string> {
  const paths = new Set<string>();

  for (const url of urls ?? []) {
    try {
      const parsedUrl = url.startsWith('/') ? new URL(url, DEFAULT_INDEXNOW_ORIGIN) : new URL(url);
      if (parsedUrl.hostname === PRIMARY_HOST && parsedUrl.protocol === 'https:') {
        paths.add(normalizePathname(parsedUrl.pathname));
      }
    } catch {
      // Invalid URLs are handled by the main inspection path.
    }
  }

  return paths;
}

function getForbiddenReason(pathname: string): string | null {
  const pathWithoutSlash = pathname.replace(/^\/+/, '').toLowerCase();

  for (const forbiddenPattern of FORBIDDEN_SEGMENT_PATTERNS) {
    if (forbiddenPattern.pattern.test(pathWithoutSlash)) {
      return forbiddenPattern.reason;
    }
  }

  const segments = pathWithoutSlash.split('/').filter(Boolean);
  if (segments.some((segment) => TOKEN_LIKE_SEGMENT_PATTERNS.some((pattern) => pattern.test(segment)))) {
    return 'token_like_url';
  }

  return null;
}

function inspectAquadropUrl(
  input: string,
  knownIndexablePaths: Set<string> = new Set()
): { normalizedUrl: string | null; reason: string | null } {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { normalizedUrl: null, reason: 'empty_url' };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = trimmedInput.startsWith('/') ? new URL(trimmedInput, DEFAULT_INDEXNOW_ORIGIN) : new URL(trimmedInput);
  } catch {
    return { normalizedUrl: null, reason: 'invalid_url' };
  }

  if (parsedUrl.hostname !== PRIMARY_HOST) {
    return { normalizedUrl: null, reason: 'external_domain' };
  }

  if (parsedUrl.protocol !== 'https:') {
    return { normalizedUrl: null, reason: 'non_https_url' };
  }

  if (parsedUrl.search) {
    return { normalizedUrl: null, reason: 'query_string_not_allowed' };
  }

  if (parsedUrl.hash) {
    return { normalizedUrl: null, reason: 'fragment_not_allowed' };
  }

  const pathname = normalizePathname(parsedUrl.pathname);
  const forbiddenReason = getForbiddenReason(pathname);

  if (forbiddenReason) {
    return { normalizedUrl: null, reason: forbiddenReason };
  }

  const normalizedUrl = `${DEFAULT_INDEXNOW_ORIGIN}${pathname === '/' ? '/' : pathname}`;

  const isSitemapGatedPath = SITEMAP_GATED_INDEXABLE_PATH_PATTERNS.some((pattern) => pattern.test(pathname));

  if (!INDEXABLE_PATHS.has(pathname) && !(isSitemapGatedPath && knownIndexablePaths.has(pathname))) {
    return { normalizedUrl, reason: 'not_in_indexable_allowlist' };
  }

  return { normalizedUrl, reason: null };
}

export function normalizeAquadropUrl(input: string): string | null {
  return inspectAquadropUrl(input).normalizedUrl;
}

export function isIndexableAquadropUrl(url: string): boolean {
  return inspectAquadropUrl(url).reason === null;
}

export function filterIndexNowUrls(
  urls: string[],
  options: { knownIndexableUrls?: string[] } = {}
): { submitted: string[]; skipped: IndexNowSkippedUrl[] } {
  const submitted: string[] = [];
  const skipped: IndexNowSkippedUrl[] = [];
  const submittedSet = new Set<string>();
  const knownIndexablePaths = getKnownIndexablePathSet(options.knownIndexableUrls);

  for (const url of urls) {
    const inspectedUrl = inspectAquadropUrl(url, knownIndexablePaths);

    if (!inspectedUrl.normalizedUrl || inspectedUrl.reason) {
      skipped.push({ url, reason: inspectedUrl.reason ?? 'not_indexable' });
      continue;
    }

    if (submittedSet.has(inspectedUrl.normalizedUrl)) {
      skipped.push({ url, reason: 'duplicate_url' });
      continue;
    }

    submittedSet.add(inspectedUrl.normalizedUrl);
    submitted.push(inspectedUrl.normalizedUrl);
  }

  return { submitted, skipped };
}

export async function submitUrlsToIndexNow(
  urls: string[],
  options: { dryRun?: boolean; knownIndexableUrls?: string[] } = {}
): Promise<SubmitUrlsToIndexNowResult> {
  const key = getIndexNowKey();
  const host = getIndexNowOrigin().hostname;
  const { submitted, skipped } = filterIndexNowUrls(urls, { knownIndexableUrls: options.knownIndexableUrls });
  const dryRun = options.dryRun === true;

  if (dryRun || submitted.length === 0) {
    console.info('[indexnow] submit dry-run/result', {
      dryRun,
      submittedCount: submitted.length,
      skippedCount: skipped.length,
      status: null
    });

    return {
      dryRun,
      submitted,
      skipped,
      indexNowStatus: null
    };
  }

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        host,
        key,
        urlList: submitted
      })
    });
    const responseText = await response.text();

    console.info('[indexnow] submit result', {
      submittedCount: submitted.length,
      skippedCount: skipped.length,
      status: response.status
    });

    return {
      dryRun: false,
      submitted,
      skipped,
      indexNowStatus: response.status,
      indexNowResponseText: responseText
    };
  } catch (error) {
    console.error('[indexnow] submit failed', {
      submittedCount: submitted.length,
      skippedCount: skipped.length,
      error
    });

    throw error;
  }
}
