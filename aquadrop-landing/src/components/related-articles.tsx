import Link from 'next/link';

import { getRelatedArticles, type ArticleSlug } from '@/lib/article-config';

type RelatedArticlesProps = {
  slug: ArticleSlug;
};

export function RelatedArticles({ slug }: RelatedArticlesProps) {
  const relatedArticles = getRelatedArticles(slug);

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-8">
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl leading-tight md:text-3xl">Kapcsolódó útmutatók</h2>
        <p className="max-w-3xl text-slate-700">
          További hasznos cikkek az energiatakarékos, kényelmes és kiszámítható mosáshoz.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {relatedArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/${article.slug}`}
            className="group rounded-2xl border border-cyan-100 bg-cyan-50/45 p-5 transition hover:border-cyan-300 hover:bg-white hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-800/90">{article.category}</p>
            <h3 className="mt-3 text-lg leading-tight text-slate-900 transition group-hover:text-brand-primary">{article.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">{article.description}</p>
            <p className="mt-4 text-sm font-semibold text-brand-primary">Tovább az útmutatóhoz</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
