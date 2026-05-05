import type { ReactNode } from 'react';
import Link from 'next/link';

import { ArticlePartnerCta } from '@/components/article-partner-cta';
import { FooterSection } from '@/components/sections';
import type { ArticleSlug } from '@/lib/article-config';

type ArticleLayoutProps = {
  slug: ArticleSlug;
  category: string;
  title: string;
  intro: string;
  readingTime: string;
  children: ReactNode;
  cta: ReactNode;
};

export function ArticleLayout({ slug, category, title, intro, readingTime, children, cta }: ArticleLayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-gradient-to-b from-cyan-50 via-sky-50 to-teal-50">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,255,255,0.92)_0%,rgba(232,250,252,0.9)_50%,rgba(225,247,246,0.94)_100%)]" />
        <div className="absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-cyan-300/30 blur-[120px] md:h-[38rem] md:w-[38rem]" />
        <div className="absolute -right-24 top-[5%] h-[24rem] w-[24rem] rounded-full bg-teal-300/25 blur-3xl md:h-[35rem] md:w-[35rem]" />
        <div className="absolute left-[10%] top-[45%] h-[22rem] w-[22rem] rounded-full bg-sky-300/20 blur-[120px] md:h-[33rem] md:w-[33rem]" />
      </div>

      <main className="relative isolate pb-16">
        <section className="pt-10 md:pt-14">
          <div className="ds-container">
            <div className="mx-auto max-w-4xl rounded-[28px] border border-white/55 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur-md md:p-10">
              <div className="mb-7 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <Link className="font-semibold text-brand-primary transition hover:text-blue-800" href="/">
                  Aquadrop főoldal
                </Link>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-slate-400" />
                <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 font-semibold text-cyan-800">
                  {category}
                </span>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-slate-400" />
                <span>{readingTime}</span>
              </div>

              <header className="space-y-5">
                <h1 className="text-balance text-3xl leading-tight md:text-5xl">{title}</h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-700">{intro}</p>
              </header>
            </div>
          </div>
        </section>

        <section className="pt-8 md:pt-12">
          <div className="ds-container">
            <article className="mx-auto max-w-4xl rounded-[28px] border border-white/50 bg-white/75 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-10">
              <div className="space-y-8 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:leading-tight md:[&_h2]:text-3xl [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:leading-tight [&_a]:font-semibold [&_a]:text-brand-primary hover:[&_a]:text-blue-800 [&_strong]:font-semibold [&_ul]:space-y-4 [&_ul]:pl-6 [&_ul]:text-slate-700 [&_li]:marker:text-cyan-700">
                {children}
              </div>
            </article>
          </div>
        </section>

        <section className="pt-6 md:pt-8">
          <div className="ds-container">
            <div className="mx-auto max-w-4xl">
              <ArticlePartnerCta />
            </div>
          </div>
        </section>
        <section className="pt-8 md:pt-10">
          <div className="ds-container">
            <div className="mx-auto max-w-4xl">{cta}</div>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
