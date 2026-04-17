'use client';

import Image from 'next/image';

import { Button, ButtonLink } from '@/components/ui/Button';
import { trackEvent } from '@/lib/tracking';

const miniTrustItems = ['Prémium 4 az 1-ben formula', 'Magas koncentráció', 'Friss, tartós illat'];

const operationalCopy = [
  'Az oldalon közvetlen vásárlás nem lehetséges.',
  'A termék viszonteladó partnereinknél vásárolható meg.',
  'Az ajándék promócióban való részvétel blokkfeltöltéssel történik.'
] as const;

export function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="ds-section bg-transparent">
      <div className="ds-container">
        <div className="grid items-center gap-10 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card md:grid-cols-2 md:gap-12 md:p-12">
          <div>
            <p className="inline-flex rounded-full border border-brand-primary/20 bg-brand-light px-3 py-1 text-sm font-semibold text-brand-primary">
              Aquadrop Expert Pro prémium mosókapszula
            </p>
            <h1 className="mt-4 text-4xl leading-tight md:text-5xl">
              Tiszta ruhák prémium minőségben – vásárlás viszonteladó partnereknél
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Az Aquadrop Expert Pro hatékony tisztítást és megbízható mindennapi teljesítményt ad. Ezen az oldalon
              értesítést kérhetsz, blokkot tölthetsz fel a 2+1 ajándék promócióhoz, vagy partnerként jelentkezhetsz.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 xl:items-center">
              <Button
                id="hero-cta-availability"
                className="w-full shadow-lg shadow-brand-primary/25"
                onClick={() => {
                  trackEvent('hero_primary_cta_click');
                  scrollToSection('announcement-signup');
                }}
              >
                Értesítést kérek, hol kapható
              </Button>
              <Button
                id="hero-cta-gift"
                variant="secondary"
                className="w-full border-2 border-brand-primary/40 font-semibold"
                onClick={() => {
                  trackEvent('hero_secondary_cta_click');
                  scrollToSection('gift-campaign');
                }}
              >
                Blokkot töltök fel az ajándékért
              </Button>
              <ButtonLink
                id="hero-cta-partner"
                href="/partner"
                variant="secondary"
                className="inline-flex w-full justify-center border-2 border-slate-300 font-semibold"
                onClick={() => trackEvent('final_cta_partner_click')}
              >
                Partnerként jelentkezem
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

        <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/80 px-5 py-4">
          <div className="grid gap-2">
            {operationalCopy.map((line) => (
              <p key={line} className="text-sm font-medium text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
