import Image from 'next/image';

import { FooterSection, ResellerSection } from '@/components/sections';

const PARTNER_BENEFITS = [
  'Stabil ellátás',
  'Marketing támogatás',
  'Márkaépítési lehetőség',
  'Szelektív partnerprogram'
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

const PARTNER_REASONS = [
  'Növekvő kereslet a prémium mosókapszulák iránt',
  'Stabil ellátás és kiszámítható együttműködés',
  'Marketing támogatás az értékesítéshez',
  'Folyamatos termékfejlesztés és bővülő portfólió'
] as const;

const PERFORMANCE_BULLETS = [
  'Több mint 70% aktív hatóanyag-tartalom',
  '8× koncentrált tisztítóerő',
  'Környezetbarát formula',
  '600N nyomásállóság – ellenáll az összenyomásnak és rálépésnek',
  'Gyorsan oldódó PVA film – nem hagy maradványt.'
] as const;

export default function PartnerPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950">
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-[#08162b] py-16 text-slate-100 md:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.12),transparent_45%),radial-gradient(circle_at_88%_12%,rgba(56,189,248,0.14),transparent_42%),radial-gradient(circle_at_52%_88%,rgba(59,130,246,0.12),transparent_48%)]" />
          <div className="absolute -left-20 top-[-16%] h-[21rem] w-[21rem] rounded-full bg-cyan-400/15 blur-[110px]" />
          <div className="absolute -right-24 top-[8%] h-[24rem] w-[24rem] rounded-full bg-blue-400/15 blur-[130px]" />
        </div>
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-stretch">
            <div className="flex flex-col gap-8">
              <div className="space-y-6">
                <p className="inline-flex rounded-full border border-cyan-300/50 bg-cyan-300/15 px-4 py-1 text-sm font-medium text-cyan-100">
                  Partner program
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Legyél az Aquadrop Expert Pro viszonteladó partnere
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-slate-200 md:text-xl">
                  Ha olyan terméket keresel, amely mögött stabil márkaépítés és hosszú távú együttműködési
                  lehetőség áll, jelentkezz partnernek.
                </p>
                <ul className="grid gap-3 pt-2 text-slate-100 sm:grid-cols-2">
                  {PARTNER_BENEFITS.map((benefit) => (
                    <li
                      key={benefit}
                      className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/16 via-white/8 to-white/[0.04] px-4 py-3 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.95)] backdrop-blur-sm"
                    >
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <ResellerSection />
              <article className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <h2 className="text-xl font-semibold text-white">Miért érdemes az Aquadrop partnerének lenni?</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  {PARTNER_REASONS.map((reason) => (
                    <li key={reason} className="flex items-start gap-2">
                      <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <p className="text-sm text-slate-300">
                A jelentkezéseket szakmai szempontok alapján egyedileg bíráljuk el.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-gradient-to-b from-[#08162b] via-slate-900 to-slate-950 py-12 text-slate-100 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <article className="rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/85 via-slate-900/70 to-slate-950/85 p-6 shadow-[0_26px_70px_-45px_rgba(8,145,178,0.45)] backdrop-blur-sm md:p-8">
            <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
              <div className="order-1">
                <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-slate-900/55 p-2 shadow-[0_20px_40px_-30px_rgba(6,182,212,0.45)] lg:max-w-[430px]">
                  <Image
                    src="/aquadrop-partner-performance.png"
                    alt="Aquadrop Expert Pro teljesítmény és műszaki előnyök"
                    width={860}
                    height={860}
                    className="h-auto w-full rounded-xl object-cover"
                    sizes="(min-width: 1024px) 38vw, (min-width: 768px) 55vw, 92vw"
                  />
                </div>
              </div>
              <div className="order-2 space-y-4 md:space-y-5">
                <h2 className="text-2xl font-semibold leading-tight text-white md:text-3xl">
                  Műszaki előnyök, amelyek értékesítéskor is számítanak
                </h2>
                <p className="text-base leading-relaxed text-slate-200 md:text-lg">
                  Az Aquadrop Expert Pro nemcsak látványos termék, hanem műszaki paramétereiben is erős ajánlat.
                  Ezek az előnyök a végfelhasználói bizalom és az értékesíthetőség szempontjából is fontosak.
                </p>
                <ul className="space-y-2.5 text-sm text-slate-100 md:text-base">
                  {PERFORMANCE_BULLETS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-slate-100 py-16 text-slate-900 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-10 rounded-3xl border border-slate-200/70 bg-white/80 p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-10">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Kinek ajánljuk partnerprogramunkat?
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {PARTNER_AUDIENCE.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)] backdrop-blur-sm"
                >
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
          <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-10">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Hogyan zajlik a jelentkezés?</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {APPLICATION_STEPS.map((step, index) => (
                <li
                  key={step}
                  className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.5)] backdrop-blur-sm"
                >
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
