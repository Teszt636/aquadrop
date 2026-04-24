'use client';

import Link from 'next/link';
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
          <SectionHeading>Melyik probléma ismerős?</SectionHeading>
        </div>

        <div className="ds-floating-panel mt-8 grid gap-4 px-4 py-5 sm:px-6 md:grid-cols-3 md:items-stretch md:px-7 md:py-7">
          <Link
            href="/mosokapszula-nem-oldodik-fel"
            className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg md:p-6"
            onClick={() => trackEvent('problem_card_capsule_not_dissolving_click')}
          >
            <h3 className="text-xl font-semibold text-slate-900">Nem oldódik fel a kapszula</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-700">
              Tipikus okok: túl rövid program, hideg víz vagy túlterhelt dob. Nézd meg a gyors, működő megoldásokat.
            </p>
            <span className="mt-4 text-sm font-semibold text-cyan-800 transition group-hover:text-cyan-600">
              Megoldás megtekintése →
            </span>
          </Link>

          <button
            type="button"
            className="group flex h-full flex-col rounded-2xl border border-cyan-200/80 bg-white p-5 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg md:p-6"
            onClick={() => {
              trackEvent('problem_card_high_washing_cost_click');
              scrollToSection('mosasi-koltseg-kalkulator');
            }}
          >
            <h3 className="text-xl font-semibold text-slate-900">Magas mosási költségek</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-700">
              Úgy érzed, egyre többe kerül egy mosás? Számold ki, mennyit spórolhatsz alacsonyabb hőfokkal.
            </p>
            <span className="mt-4 text-sm font-semibold text-cyan-800 transition group-hover:text-cyan-600">
              Kalkulátor megnyitása →
            </span>
          </button>

          <Link
            href="/hogyan-mossunk-20-fokon"
            className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg md:p-6"
            onClick={() => trackEvent('problem_card_low_temp_cleaning_click')}
          >
            <h3 className="text-xl font-semibold text-slate-900">Nem tiszta a ruha alacsony hőfokon</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-700">
              Megmutatjuk, hogyan lehet 20 °C-on is alaposan tiszta és friss az eredmény, kompromisszum nélkül.
            </p>
            <span className="mt-4 text-sm font-semibold text-cyan-800 transition group-hover:text-cyan-600">
              Útmutató megnyitása →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
