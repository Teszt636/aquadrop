'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/Button';

const miniTrustItems = ['4 az 1-ben hatás', 'Magas koncentráció', 'Prémium illat'];

export function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="ds-section bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="ds-container">
        <div className="grid items-center gap-10 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card md:grid-cols-2 md:p-12">
          <div>
            <p className="inline-flex rounded-full border border-brand-primary/20 bg-brand-light px-3 py-1 text-sm font-semibold text-brand-primary">
              Aquadrop Expert Pro kapszula
            </p>
            <h1 className="mt-4 text-4xl leading-tight md:text-5xl">Prémium mosókapszula valódi teljesítménnyel</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Az Aquadrop Expert Pro egy magas koncentrációjú, modern mosókapszula, amely nemcsak tisztít, hanem új
              szintre emeli a mindennapi mosást.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                id="hero-cta-primary"
                className="w-full shadow-lg shadow-brand-primary/25 sm:w-auto"
                onClick={() => scrollToSection('gift-campaign')}
              >
                Kérem az ajándék dobozt
              </Button>
              <Link
                id="hero-cta-secondary"
                href="/partner"
                className="ds-button-secondary inline-flex w-full justify-center border-2 border-brand-primary/40 font-semibold sm:w-auto"
              >
                Viszonteladó vagyok
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-primary/15 via-brand-light to-success-green/10 blur-2xl" />
            <div className="flex aspect-[4/5] items-center justify-center rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-brand-light p-8 shadow-inner">
              <div className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white/80 p-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Product Image</p>
                <p className="mt-3 text-xl font-bold text-slate-700">Aquadrop Expert Pro</p>
                <p className="mt-2 text-sm text-slate-500">Helyőrző kép a termékfotó számára</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:grid-cols-3 sm:gap-4 sm:px-6">
          {miniTrustItems.map((item) => (
            <p
              key={item}
              className="text-center text-sm font-semibold text-slate-700 sm:border-r sm:border-slate-200 sm:last:border-r-0"
            >
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
