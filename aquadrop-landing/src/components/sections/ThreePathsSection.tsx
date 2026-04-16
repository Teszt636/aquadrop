'use client';

import Link from 'next/link';

import { SectionHeading } from '@/components/ui/SectionHeading';

function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);

  if (!section) {
    return;
  }

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function ThreePathsSection() {
  return (
    <section className="ds-section bg-slate-50/60" aria-labelledby="three-paths-heading">
      <div className="ds-container">
        <div id="three-paths-heading" className="ds-section-heading-wrap">
          <SectionHeading>Válaszd ki, mi érdekel most</SectionHeading>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3 md:items-stretch">
          <article className="group relative flex h-full flex-col rounded-2xl border-2 border-brand-primary/35 bg-white p-6 shadow-lg shadow-brand-primary/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl md:p-7">
            <span className="mb-4 inline-flex w-fit rounded-full border border-brand-primary/20 bg-brand-light px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-brand-primary">
              Fő út
            </span>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-2xl">
              🎁
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Kipróbálnám</h3>
            <p className="mt-3 flex-1 text-slate-700">
              Szeretnéd megtapasztalni, mit tud az Aquadrop Expert Pro a mindennapi mosásban?
            </p>
            <button
              type="button"
              className="ds-button-primary mt-6 w-full"
              onClick={() => scrollToSection('gift-campaign')}
            >
              Kérem az ajándék dobozt
            </button>
          </article>

          <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg md:p-7">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
              🔔
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Elsőként értesülnék</h3>
            <p className="mt-3 flex-1 text-slate-700">
              Kérj értesítést az újdonságokról, ajánlatokról és kampányokról.
            </p>
            <button
              type="button"
              className="ds-button-secondary mt-6 w-full"
              onClick={() => scrollToSection('announcement-signup')}
            >
              Értesítést kérek
            </button>
          </article>

          <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg md:p-7">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
              🤝
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Viszonteladó vagyok</h3>
            <p className="mt-3 flex-1 text-slate-700">
              Érdekel az Aquadrop Expert Pro partnerprogram és az együttműködés lehetősége.
            </p>
            <Link href="/partner" className="ds-button-secondary mt-6 w-full text-center">
              Partner oldal megnyitása
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
