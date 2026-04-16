import type { Metadata } from 'next';

import { FooterSection, ResellerSection } from '@/components/sections';

const PARTNER_BENEFITS = [
  'stabil ellátás',
  'marketing támogatás',
  'márkaépítési lehetőség',
  'szelektív partnerprogram'
] as const;

const PARTNER_AUDIENCE = [
  {
    title: 'Viszonteladóknak',
    description:
      'Olyan partnereknek, akik saját ügyfélkörüknek szeretnének minőségi terméket kínálni.'
  },
  {
    title: 'Webshopoknak',
    description:
      'Online értékesítési csatornával rendelkező partnerek számára is nyitott az együttműködés.'
  },
  {
    title: 'Beszerzőknek',
    description:
      'Ha termékbővítésben gondolkodsz, partneroldalunkon megismerheted a lehetőségeket.'
  }
] as const;

const APPLICATION_STEPS = [
  'Kitöltöd az űrlapot',
  'Felvesszük veled a kapcsolatot',
  'Egyeztetjük az együttműködés lehetőségét'
] as const;

export const metadata: Metadata = {
  title: 'Viszonteladóknak | Aquadrop Expert Pro',
  description: 'Jelentkezés az Aquadrop Expert Pro viszonteladói programjába.'
};

export default function PartnerPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950">
      <section className="border-b border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-16 text-slate-100 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start">
            <div className="space-y-6">
              <p className="inline-flex rounded-full border border-cyan-300/50 bg-cyan-300/15 px-4 py-1 text-sm font-medium text-cyan-100">
                Partner program
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Legyél az Aquadrop Expert Pro viszonteladó partnere
              </h1>
              <p className="text-lg leading-relaxed text-slate-200 md:text-xl">
                Ha olyan terméket keresel, amely mögött stabil márkaépítés és hosszú távú együttműködési
                lehetőség áll, jelentkezz partnernek.
              </p>
              <ul className="grid gap-3 pt-2 text-slate-100 sm:grid-cols-2">
                {PARTNER_BENEFITS.map((benefit) => (
                  <li key={benefit} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <ResellerSection />
              <p className="text-sm text-slate-300">
                A jelentkezéseket szakmai szempontok alapján egyedileg bíráljuk el.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-16 text-slate-900 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-10">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Kinek lehet jó partnerprogramunk?</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {PARTNER_AUDIENCE.map((item) => (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 text-slate-900 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 md:p-10">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Hogyan zajlik a jelentkezés?</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {APPLICATION_STEPS.map((step, index) => (
                <li key={step} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">{index + 1}. lépés</p>
                  <p className="mt-2 text-base font-medium text-slate-700">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
