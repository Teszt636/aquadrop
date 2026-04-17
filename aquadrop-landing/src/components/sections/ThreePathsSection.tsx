'use client';

import { ButtonLink } from '@/components/ui/Button';
import { SectionDescription, SectionHeading } from '@/components/ui/SectionHeading';
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
          <SectionHeading>Válaszd ki, miért érkeztél</SectionHeading>
          <SectionDescription className="mx-auto">
            Az oldal három külön útra vezet: érdeklődés, ajándék promóciós jelentkezés, vagy viszonteladói
            együttműködés.
          </SectionDescription>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3 md:items-stretch">
          <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg md:p-7">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
              🔔
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Érdekel a termék</h3>
            <p className="mt-3 flex-1 text-slate-700">
              Kérj értesítést arról, hol érhető el az Aquadrop Expert Pro, milyen ajánlatok jönnek, és hogyan juthatsz
              hozzá viszonteladó partnereknél.
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

          <article className="group relative flex h-full flex-col rounded-2xl border-2 border-brand-primary/35 bg-white p-6 shadow-lg shadow-brand-primary/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl md:p-7">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-2xl">
              🧾
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Már vásároltam 2 dobozzal</h3>
            <p className="mt-3 flex-1 text-slate-700">
              Ha partnernél már megvásároltad a 2 dobozt, itt feltöltheted a blokkot és jelentkezhetsz az ajándék
              termékre.
            </p>
            <button
              type="button"
              className="ds-button-primary mt-6 w-full"
              onClick={() => {
                trackEvent('final_cta_gift_click');
                scrollToSection('gift-campaign');
              }}
            >
              Blokkot feltöltök
            </button>
          </article>

          <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg md:p-7">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
              🤝
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Viszonteladó partner lennék</h3>
            <p className="mt-3 flex-1 text-slate-700">
              Ismerd meg a partnerprogramot, a kapcsolatfelvétel folyamatát és az együttműködés üzleti előnyeit.
            </p>
            <ButtonLink
              href="/partner"
              className="mt-6 w-full text-center"
              variant="secondary"
              onClick={() => trackEvent('final_cta_partner_click')}
            >
              Partneroldal megnyitása
            </ButtonLink>
          </article>
        </div>
      </div>
    </section>
  );
}
