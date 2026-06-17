import Link from 'next/link';

import { JsonLd } from '@/components/JsonLd';
import { FooterSection } from '@/components/sections';
import {
  buildSeoArticlePath,
  getArticleCta,
  type SeoArticle,
  type SeoArticleAudience
} from '@/lib/articles/seo-articles';
import { SITE_URL } from '@/lib/constants';

const audienceCopy: Record<SeoArticleAudience, { title: string; intro: string; eyebrow: string }> = {
  consumer: {
    title: 'Aquadrop tudástár',
    intro: 'Gyakorlati cikkek mosókapszula használatról, energiatakarékos mosásról és mindennapi mosási problémák megoldásáról.',
    eyebrow: 'Lakossági tudástár'
  },
  partner: {
    title: 'Viszonteladói tudástár',
    intro: 'Hasznos cikkek üzleteknek, webshopoknak és beszerzőknek az Aquadrop Expert Pro forgalmazásához.',
    eyebrow: 'Partner tudástár'
  }
};

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
}

function getExcerpt(article: SeoArticle): string {
  if (article.excerpt?.trim()) return article.excerpt.trim();
  return article.body.replace(/\s+/g, ' ').trim().slice(0, 180);
}

function renderBody(body: string) {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (block.startsWith('## ')) {
        return (
          <h2 key={index} className="mt-10 text-2xl font-semibold leading-tight text-slate-950 md:text-3xl">
            {block.replace(/^##\s+/, '')}
          </h2>
        );
      }
      if (block.startsWith('### ')) {
        return (
          <h3 key={index} className="mt-8 text-xl font-semibold leading-tight text-slate-950">
            {block.replace(/^###\s+/, '')}
          </h3>
        );
      }
      if (/^[-*]\s+/m.test(block)) {
        return (
          <ul key={index} className="list-disc space-y-2 pl-6 text-slate-700">
            {block.split('\n').map((item) => (
              <li key={item}>{item.replace(/^[-*]\s+/, '')}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={index} className="text-base leading-8 text-slate-700 md:text-lg">
          {block}
        </p>
      );
    });
}

export function SeoArticleListPage({ audience, articles }: { audience: SeoArticleAudience; articles: SeoArticle[] }) {
  const copy = audienceCopy[audience];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-teal-50 text-slate-900">
      <main>
        <section className="px-5 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">{copy.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">{copy.intro}</p>
          </div>
        </section>

        <section className="px-5 pb-16 md:px-10">
          <div className="mx-auto max-w-6xl">
            {articles.length === 0 ? (
              <div className="rounded-lg border border-cyan-100 bg-white/80 p-8 text-center text-slate-700">
                Még nincs publikált cikk ebben a tudástárban.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={buildSeoArticlePath(article)}
                    className="group rounded-lg border border-cyan-100 bg-white/85 p-5 shadow-sm transition hover:border-cyan-300 hover:shadow-lg"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                      {article.category || copy.eyebrow}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold leading-snug text-slate-950 group-hover:text-cyan-800">
                      {article.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{getExcerpt(article)}</p>
                    <p className="mt-4 text-sm text-slate-500">{formatDate(article.published_at)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}

export function SeoArticleDetailPage({
  article,
  relatedArticles
}: {
  article: SeoArticle;
  relatedArticles: SeoArticle[];
}) {
  const cta = getArticleCta(article);
  const url = `${SITE_URL}${buildSeoArticlePath(article)}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.meta_description ?? article.excerpt ?? article.title,
    url,
    inLanguage: 'hu-HU',
    datePublished: article.published_at ?? article.created_at,
    dateModified: article.updated_at,
    author: { '@type': 'Organization', name: 'Aquadrop Expert Pro' },
    publisher: { '@type': 'Organization', name: 'Aquadrop Expert Pro', logo: `${SITE_URL}/logo.png` },
    image: article.hero_image_url ? [article.hero_image_url] : [`${SITE_URL}/aquadrop-mosokapszula-og-kep.webp`]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-teal-50 text-slate-900">
      <JsonLd data={structuredData} />
      <main>
        <article className="px-5 py-10 md:px-10 md:py-16">
          <div className="mx-auto max-w-4xl">
            <Link href={article.audience === 'partner' ? '/partner/tudastar' : '/tudastar'} className="text-sm font-semibold text-cyan-800 hover:text-cyan-950">
              Vissza a tudástárhoz
            </Link>
            <header className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">{article.category || audienceCopy[article.audience].eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">{article.title}</h1>
              <p className="mt-4 text-sm text-slate-500">{formatDate(article.published_at)}</p>
              {article.excerpt ? <p className="mt-5 text-xl leading-8 text-slate-700">{article.excerpt}</p> : null}
            </header>

            {article.hero_image_url ? (
              <img
                src={article.hero_image_url}
                alt={article.hero_image_alt ?? article.title}
                className="mt-8 aspect-[16/9] w-full rounded-lg object-cover shadow-lg"
              />
            ) : null}

            <div className="mt-10 space-y-6 rounded-lg border border-cyan-100 bg-white/85 p-6 shadow-sm md:p-9">
              {renderBody(article.body)}
            </div>

            <section className="mt-8 rounded-lg border border-cyan-200 bg-cyan-900 p-6 text-white md:p-8">
              <h2 className="text-2xl font-semibold">{cta.title}</h2>
              <p className="mt-3 max-w-2xl text-cyan-50">{cta.text}</p>
              <Link href={cta.href} className="mt-5 inline-flex rounded-md bg-white px-5 py-3 text-sm font-semibold text-cyan-950 hover:bg-cyan-50">
                {cta.button}
              </Link>
            </section>

            {relatedArticles.length > 0 ? (
              <section className="mt-10">
                <h2 className="text-2xl font-semibold">Ajánlott cikkek</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {relatedArticles.map((related) => (
                    <Link key={related.id} href={buildSeoArticlePath(related)} className="rounded-lg border border-cyan-100 bg-white/85 p-4 transition hover:border-cyan-300">
                      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">{related.category || 'Tudástár'}</p>
                      <h3 className="mt-2 text-base font-semibold leading-snug">{related.title}</h3>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </article>
      </main>
      <FooterSection />
    </div>
  );
}
