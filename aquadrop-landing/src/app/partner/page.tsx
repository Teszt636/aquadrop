import type { Metadata } from 'next';

import { FooterSection, ResellerSection } from '@/components/sections';

export const metadata: Metadata = {
  title: 'Viszonteladóknak | Aquadrop Expert Pro',
  description: 'Jelentkezés az Aquadrop Expert Pro viszonteladói programjába.'
};

export default function PartnerPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950">
      <section className="border-b border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-20 text-slate-100 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl space-y-6">
            <p className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-sm font-medium text-cyan-200">
              Partner program
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Legyél az Aquadrop Expert Pro viszonteladó partnere
            </h1>
            <p className="text-lg leading-relaxed text-slate-300 md:text-xl">
              Ha olyan terméket keresel, amely mögött stabil márkaépítés és hosszú távú együttműködési
              lehetőség áll, jelentkezz partnernek.
            </p>
            <ul className="grid gap-3 pt-2 text-slate-200 sm:grid-cols-2">
              <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">stabil ellátás</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">marketing támogatás</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">márkaépítési lehetőség</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">szelektív partnerprogram</li>
            </ul>
          </div>
        </div>
      </section>
      <ResellerSection />
      <FooterSection />
    </main>
  );
}
