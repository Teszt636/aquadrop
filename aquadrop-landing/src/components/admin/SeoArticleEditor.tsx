'use client';

import { useMemo, useState } from 'react';

import { SafeMarkdown } from '@/components/seo-articles/SafeMarkdown';
import {
  SEO_ARTICLE_AUDIENCE_OPTIONS,
  SEO_ARTICLE_GOAL_OPTIONS,
  SEO_ARTICLE_STATUS_OPTIONS
} from '@/lib/admin/table-config';

type SeoArticleEditorProps = {
  article: Record<string, unknown>;
  onCancel: () => void;
  onSaved: () => Promise<void> | void;
};

type FormState = {
  status: string;
  audience: string;
  article_goal: string;
  category: string;
  title: string;
  slug: string;
  excerpt: string;
  seo_title: string;
  meta_description: string;
  body: string;
  hero_image_url: string;
  hero_image_alt: string;
  primary_keyword: string;
  secondary_keywords: string;
  manual_related_article_ids: string;
  auto_related_enabled: boolean;
  is_indexable: boolean;
  published_at: string;
  internal_note: string;
};

type EditorError = {
  message: string;
  debug?: string;
};

const markdownPlaceholder = `Bevezető bekezdés...

## Első alcím

Bekezdés...

## Második alcím

Bekezdés...

## Összegzés

Záró gondolat...`;

function textValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function booleanValue(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function arrayValue(value: unknown): string {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean).join(', ') : '';
}

function toDateTimeLocal(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatInfoDate(value: unknown): string {
  if (typeof value !== 'string' || !value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function splitList(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isPublished(state: FormState): boolean {
  return state.status === 'published';
}

function getUserFacingSaveError(error: unknown): EditorError {
  const message = error instanceof Error ? error.message : 'Ismeretlen mentési hiba.';
  const knownHungarianMessages = [
    'Publikálás előtt',
    'A cikk törzsszövege túl rövid',
    'Érvénytelen',
    'A kézi ajánlott cikk ID',
    'A publikálási dátum hibás'
  ];

  if (knownHungarianMessages.some((item) => message.includes(item))) {
    return { message };
  }

  return {
    message: 'A cikk mentése nem sikerült. Ellenőrizd a mezőket, majd próbáld újra.',
    debug: message
  };
}

export function SeoArticleEditor({ article, onCancel, onSaved }: SeoArticleEditorProps) {
  const articleId = textValue(article.id);
  const [form, setForm] = useState<FormState>(() => ({
    status: textValue(article.status) || 'draft',
    audience: textValue(article.audience) || 'consumer',
    article_goal: textValue(article.article_goal) || 'consumer_product_education',
    category: textValue(article.category),
    title: textValue(article.title),
    slug: textValue(article.slug),
    excerpt: textValue(article.excerpt),
    seo_title: textValue(article.seo_title),
    meta_description: textValue(article.meta_description),
    body: textValue(article.body),
    hero_image_url: textValue(article.hero_image_url),
    hero_image_alt: textValue(article.hero_image_alt),
    primary_keyword: textValue(article.primary_keyword),
    secondary_keywords: arrayValue(article.secondary_keywords),
    manual_related_article_ids: arrayValue(article.manual_related_article_ids),
    auto_related_enabled: booleanValue(article.auto_related_enabled, true),
    is_indexable: booleanValue(article.is_indexable),
    published_at: toDateTimeLocal(article.published_at),
    internal_note: textValue(article.internal_note)
  }));
  const [showPreview, setShowPreview] = useState(true);
  const [showAdvancedRelated, setShowAdvancedRelated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<EditorError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const publicPath = useMemo(
    () => (form.audience === 'partner' ? `/partner/tudastar/${form.slug || '[slug]'}` : `/tudastar/${form.slug || '[slug]'}`),
    [form.audience, form.slug]
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setSuccessMessage(null);
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function validate(): string | null {
    if (!isPublished(form)) return null;
    if (!form.title.trim()) return 'Publikálás előtt add meg a címet.';
    if (!form.slug.trim()) return 'Publikálás előtt add meg a slug mezőt.';
    if (form.body.trim().length < 1000) return 'A cikk törzsszövege túl rövid a publikáláshoz.';
    if (!form.seo_title.trim()) return 'Publikálás előtt add meg a SEO címet.';
    if (!form.meta_description.trim()) return 'Publikálás előtt add meg a meta leírást.';
    if (!form.audience.trim()) return 'Publikálás előtt add meg a célcsoportot.';
    if (!form.article_goal.trim()) return 'Publikálás előtt add meg a cikk célját.';
    return null;
  }

  async function save() {
    const validationError = validate();
    if (validationError) {
      setError({ message: validationError });
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const publishedAt = isPublished(form) && !form.published_at ? new Date().toISOString() : form.published_at;
    const updates = {
      status: form.status,
      audience: form.audience,
      article_goal: form.article_goal,
      category: form.category,
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      seo_title: form.seo_title,
      meta_description: form.meta_description,
      body: form.body,
      hero_image_url: form.hero_image_url,
      hero_image_alt: form.hero_image_alt,
      primary_keyword: form.primary_keyword,
      secondary_keywords: splitList(form.secondary_keywords),
      manual_related_article_ids: splitList(form.manual_related_article_ids),
      auto_related_enabled: form.auto_related_enabled,
      is_indexable: form.is_indexable,
      published_at: publishedAt,
      internal_note: form.internal_note
    };

    try {
      const response = await fetch('/api/admin/table', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'seo_articles', id: articleId, updates })
      });
      const body = (await response.json()) as { error?: string; success?: boolean };
      if (!response.ok || body.success === false) {
        throw new Error(body.error ?? 'Sikertelen mentés.');
      }
      await onSaved();
      setSuccessMessage('A cikk mentése sikeres.');
    } catch (saveError) {
      setError(getUserFacingSaveError(saveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 p-3 text-slate-100 md:p-6">
      <div className="mx-auto max-w-6xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <header className="flex flex-col gap-3 border-b border-slate-800 p-4 md:flex-row md:items-start md:justify-between md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">SEO cikk szerkesztő</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{form.title.trim() || 'SEO cikk vázlat'}</h2>
            <p className="mt-2 text-sm text-slate-400">
              Létrehozva: {formatInfoDate(article.created_at)} · Frissítve: {formatInfoDate(article.updated_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onCancel} className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
              Mégse
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Mentés...' : 'Mentés'}
            </button>
          </div>
        </header>

        <div className="space-y-5 p-4 md:p-6">
          {successMessage ? (
            <p className="rounded-lg border border-emerald-500/40 bg-emerald-950/50 p-3 text-sm font-semibold text-emerald-100">
              {successMessage}
            </p>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-rose-500/40 bg-rose-950/50 p-3 text-sm text-rose-100">
              <p className="font-semibold">{error.message}</p>
              {error.debug ? <p className="mt-2 text-xs text-rose-200/75">Admin debug: {error.debug}</p> : null}
            </div>
          ) : null}
          {isPublished(form) && !form.is_indexable ? (
            <p className="rounded-lg border border-amber-300 bg-amber-950/70 p-4 text-sm font-semibold text-amber-50 shadow-lg shadow-amber-950/30">
              A cikk publikált státuszú, de nem indexelhető. Így nem jelenik meg a publikus tudástárban és nem kerül be a sitemapbe.
            </p>
          ) : null}

          <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
            <h3 className="text-lg font-semibold text-white">Alapadatok</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span>Cikk címe</span>
                <input value={form.title} onChange={(event) => update('title', event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
              </label>
              <label className="space-y-1 text-sm">
                <span>Slug</span>
                <div className="flex gap-2">
                  <input value={form.slug} onChange={(event) => update('slug', event.target.value)} className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
                  <button type="button" onClick={() => update('slug', slugify(form.title))} className="shrink-0 rounded-md border border-cyan-600 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-950/50">
                    Slug generálása
                  </button>
                </div>
              </label>
              <label className="space-y-1 text-sm">
                <span>Célcsoport</span>
                <select value={form.audience} onChange={(event) => update('audience', event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white">
                  {SEO_ARTICLE_AUDIENCE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span>Cikk célja</span>
                <select value={form.article_goal} onChange={(event) => update('article_goal', event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white">
                  {SEO_ARTICLE_GOAL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span>Kategória</span>
                <input value={form.category} onChange={(event) => update('category', event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
              </label>
              <label className="space-y-1 text-sm">
                <span>Státusz</span>
                <select value={form.status} onChange={(event) => update('status', event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white">
                  {SEO_ARTICLE_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
            <h3 className="text-lg font-semibold text-white">SEO adatok</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span>SEO cím</span>
                <input value={form.seo_title} onChange={(event) => update('seo_title', event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
                <span className="block text-xs text-slate-400">
                  Ajánlott hossz: 50-65 karakter. Jelenleg: {form.seo_title.length} karakter.
                </span>
              </label>
              <label className="space-y-1 text-sm">
                <span>Fő kulcsszó</span>
                <input value={form.primary_keyword} onChange={(event) => update('primary_keyword', event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span>Meta leírás</span>
                <textarea value={form.meta_description} onChange={(event) => update('meta_description', event.target.value)} className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
                <span className="block text-xs text-slate-400">
                  Ajánlott hossz: 140-160 karakter. Jelenleg: {form.meta_description.length} karakter.
                </span>
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span>Kivonat</span>
                <textarea value={form.excerpt} onChange={(event) => update('excerpt', event.target.value)} className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span>Másodlagos kulcsszavak vesszővel elválasztva</span>
                <input value={form.secondary_keywords} onChange={(event) => update('secondary_keywords', event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Cikk törzsszöveg</h3>
                <p className="mt-1 text-xs text-slate-400">
                  A cikk címe automatikusan H1 lesz. A törzsszövegben használj ## alcímeket, ### kisebb alcímeket, felsorolást, **kiemelést** és [link](https://...) formátumot.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Publikálás előtt legalább 1000 karakter szükséges. Jelenleg: {form.body.trim().length} karakter.
                </p>
              </div>
              <button type="button" onClick={() => setShowPreview((value) => !value)} className="rounded-md border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800">
                {showPreview ? 'Előnézet elrejtése' : 'Előnézet'}
              </button>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <textarea
                value={form.body}
                onChange={(event) => update('body', event.target.value)}
                placeholder={markdownPlaceholder}
                className="min-h-[550px] w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-3 font-mono text-sm leading-7 text-white"
              />
              {showPreview ? (
                <div className="min-h-[550px] overflow-auto rounded-md border border-slate-700 bg-white p-5 text-slate-950">
                  <h1 className="text-3xl font-semibold leading-tight">{form.title || 'Cikk címe'}</h1>
                  <SafeMarkdown markdown={form.body} className="mt-6 space-y-5" />
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
            <h3 className="text-lg font-semibold text-white">Kiemelt kép</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span>Hero kép URL</span>
                <input value={form.hero_image_url} onChange={(event) => update('hero_image_url', event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
              </label>
              <label className="space-y-1 text-sm">
                <span>Hero kép alt szöveg</span>
                <input value={form.hero_image_alt} onChange={(event) => update('hero_image_alt', event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
            <h3 className="text-lg font-semibold text-white">CTA és ajánlott cikkek</h3>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.auto_related_enabled} onChange={(event) => update('auto_related_enabled', event.target.checked)} className="h-4 w-4" />
              Automatikus ajánlók bekapcsolva
            </label>
            <button type="button" onClick={() => setShowAdvancedRelated((value) => !value)} className="mt-4 text-sm font-semibold text-cyan-300 hover:text-cyan-100">
              {showAdvancedRelated ? 'Haladó ajánlott cikk ID-k elrejtése' : 'Haladó ajánlott cikk ID-k'}
            </button>
            {showAdvancedRelated ? (
              <label className="mt-3 block space-y-1 text-sm">
                <span>Kézi ajánlott cikk ID-k vesszővel vagy soronként</span>
                <textarea value={form.manual_related_article_ids} onChange={(event) => update('manual_related_article_ids', event.target.value)} className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
              </label>
            ) : null}
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
            <h3 className="text-lg font-semibold text-white">Publikálás</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_indexable} onChange={(event) => update('is_indexable', event.target.checked)} className="h-4 w-4" />
                Indexelhető és sitemapbe bekerülhet
              </label>
              <label className="space-y-1 text-sm">
                <span>Publikálási dátum</span>
                <input type="datetime-local" value={form.published_at} onChange={(event) => update('published_at', event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
              </label>
              <div className="rounded-md border border-slate-800 bg-slate-900 p-3 text-sm md:col-span-2">
                <span className="text-slate-400">Publikus URL előnézet: </span>
                <span className="font-semibold text-cyan-200">{publicPath}</span>
                <p className="mt-2 text-xs text-slate-400">
                  Publikus oldalon csak akkor jelenik meg, ha a státusz Publikált és az Indexelhető mező be van kapcsolva.
                </p>
              </div>
              <label className="space-y-1 text-sm md:col-span-2">
                <span>Belső megjegyzés</span>
                <textarea value={form.internal_note} onChange={(event) => update('internal_note', event.target.value)} className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" />
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
