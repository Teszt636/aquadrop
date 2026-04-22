'use client';

import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { trackEvent } from '@/lib/tracking';

function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);

  if (!section) {
    return;
  }

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function ThreePathsSection() {
  return (
    <section className="ds-section" aria-labelledby="three-paths-heading">
      <div className="ds-container">
        <div id="three-paths-heading" className="ds-section-heading-wrap">
          <SectionHeading>Válaszd ki a következő lépést</SectionHeading>
        </div>

        <div className="ds-floating-panel mt-8 grid gap-5 px-5 py-6 sm:px-7 md:grid-cols-3 md:items-stretch md:px-8 md:py-8">
          <article className="group flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg md:p-7">
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
              onClick={() => {
                trackEvent('final_cta_newsletter_click');
                scrollToSection('announcement-signup');
              }}
            >
              Értesítést kérek
            </button>
          </article>

          <article className="group relative flex h-full flex-col items-center rounded-2xl border-2 border-brand-primary/35 bg-white p-6 text-center shadow-lg shadow-brand-primary/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl md:p-7">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-2xl">
              🎁
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Ajándék mosókapszula</h3>
            <p className="mt-3 flex-1 text-slate-700">
              Vásárolj 2 doboz Aquadrop Expert Pro kapszulát bármelyik partner üzletben, és elküldjük a 3. dobozt ajándékba.
            </p>
            <ButtonLink
              href="#gift-form"
              className="mt-6 w-full text-center"
              onClick={() => {
                trackEvent('final_cta_gift_click');
              }}
            >
              Ajándék terméket igénylek
            </ButtonLink>
          </article>

          <article className="group flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg md:p-7">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
              🤝
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Viszonteladó vagyok</h3>
            <p className="mt-3 flex-1 text-slate-700">
              Érdekel az Aquadrop Expert Pro partnerprogram és az együttműködés lehetősége.
            </p>
            <ButtonLink
              href="/partner"
              className="mt-6 w-full text-center"
              variant="secondary"
              onClick={() => trackEvent('final_cta_partner_click')}
            >
              Partner oldal megnyitása
            </ButtonLink>
          </article>
        </div>
      </div>
    </section>
  );
}
