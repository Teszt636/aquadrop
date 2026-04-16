'use client';

import Image from 'next/image';

import { Button, ButtonLink } from '@/components/ui/Button';
import { trackEvent } from '@/lib/tracking';

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
    <section className="ds-section relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(103,232,249,0.12),transparent_38%),radial-gradient(circle_at_85%_35%,rgba(125,211,252,0.1),transparent_42%),radial-gradient(circle_at_45%_92%,rgba(147,197,253,0.08),transparent_38%)]" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/12 blur-3xl md:h-96 md:w-96" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-sky-300/10 blur-3xl md:h-[26rem] md:w-[26rem]" />
        <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-blue-200/8 blur-3xl md:h-80 md:w-80" />
      </div>
      <div className="ds-container">
        <div className="grid items-center gap-10 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card md:grid-cols-2 md:gap-12 md:p-12">
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
                onClick={() => {
                  trackEvent('hero_primary_cta_click');
                  scrollToSection('gift-campaign');
                }}
              >
                Kérem az ajándék dobozt
              </Button>
              <ButtonLink
                id="hero-cta-secondary"
                href="/partner"
                variant="secondary"
                className="inline-flex w-full justify-center border-2 border-brand-primary/40 font-semibold sm:w-auto"
                onClick={() => trackEvent('hero_secondary_cta_click')}
              >
                Viszonteladó vagyok
              </ButtonLink>
            </div>
          </div>

          <div className="relative mt-2 md:mt-0">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-primary/15 via-brand-light to-success-green/10 blur-2xl" />
            <div className="relative rounded-[2rem] border border-slate-200 bg-white p-4 shadow-inner">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.5rem]">
                <Image
                  src="/hero-aquadrop.png"
                  alt="Aquadrop Expert Pro mosókapszula modern mosógép mellett"
                  fill
                  className="object-cover"
                  sizes="(max-width: 767px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 px-4 py-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-100 sm:grid-cols-3 sm:gap-4 sm:px-6">
          {miniTrustItems.map((item) => (
            <p
              key={item}
              className="text-center text-base font-bold text-slate-900 sm:border-r sm:border-slate-200 sm:last:border-r-0"
            >
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
