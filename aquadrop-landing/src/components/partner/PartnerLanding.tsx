import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, CircleAlert, Compass, Gem, Handshake, LineChart, Megaphone, ShieldCheck } from 'lucide-react';

import { PartnerMediaKitSection, ResellerSection } from '@/components/sections';

const HERO_BULLETS = [
  'Kevesebb ügyfélszolgálati terhelés a visszatérő panaszok csökkentésével.',
  'Prémium termékpozíció, amely jobb kosárértéket és stabilabb árrést támogat.',
  'Gyors bevezetés kész értékesítési és edukációs anyagokkal.'
] as const;

const PROBLEM_POINTS = [
  {
    title: 'Nem oldódó kapszula',
    description:
      'A vásárlók gyakori panasza, hogy hideg vagy rövid programnál a kapszula maradványt hagy.'
  },
  {
    title: 'Foltos ruhák és visszahozott termék',
    description:
      'A nem megfelelő oldódásból adódó foltok reklamációhoz, cseréhez és veszteséges ügykezeléshez vezetnek.'
  },
  {
    title: 'Bizalomvesztés a polcnál',
    description:
      'Ha egy termékkel rossz tapasztalat társul, a vevő nemcsak márkát, hanem boltot is vált.'
  }
] as const;

const DISSOLUTION_RESULTS = [
  { water: '30°C', time: '~4.5 perc' },
  { water: '20°C', time: '~8 perc' },
  { water: '4°C', time: '~12 perc' }
] as const;

const BUSINESS_BENEFITS = [
  'Kevesebb reklamációs eset és alacsonyabb utókezelési költség.',
  'Magasabb vevői elégedettség és jobb újravásárlási arány.',
  'Könnyebb értékesítési párbeszéd: mérhető műszaki előnyökkel érvelhetsz.',
  'Prémium pozicionálás, ami védi az árrést és csökkenti az árverseny-kitettséget.',
  'Stabil, üzleti fókuszú partneri együttműködés hosszú távra.'
] as const;

const SALES_SUPPORT = [
  {
    title: 'Marketing anyagok',
    description: 'Kész kreatívok, termékelőny-kivonatok és POS üzenetek online és offline használatra.',
    icon: Megaphone
  },
  {
    title: 'Edukációs tartalmak',
    description: 'Hideg vizes mosásról, helyes használatról és kapszulaoldódásról kész, közérthető anyagok.',
    icon: Compass
  },
  {
    title: 'Megtérülési kalkulátor',
    description: 'Egyszerűen kommunikálható költség/érték logika a vásárlói döntés gyorsítására.',
    icon: LineChart
  },
  {
    title: 'Online jelenlét támogatása',
    description: 'SEO-kompatibilis termékszövegek, strukturált ajánlati blokkok és konverziós javaslatok.',
    icon: Handshake
  }
] as const;

const PERFORMANCE_POINTS = [
  'Gyors oldódási viselkedés alacsonyabb hőfokon is, ezért egyszerűbb a vásárlói edukáció.',
  'Könnyen kommunikálható műszaki előny a napi értékesítési párbeszédben.',
  'Prémium polci pozicionálás, ami támogatja a magasabb érzékelt értéket.',
  'Támogatható értékesítési történet, amely stabil végfelhasználói élményre épül.'
] as const;

export function PartnerLanding() {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-14 pt-12 sm:px-6 md:px-10 md:pb-20 md:pt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(34,211,238,0.18),transparent_36%),radial-gradient(circle_at_85%_8%,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(15,23,42,0.8),transparent_65%)]" />
          <div className="absolute -left-10 top-16 h-52 w-52 rounded-full bg-cyan-400/20 blur-[110px] md:h-72 md:w-72" />
          <div className="absolute -right-16 top-5 h-56 w-56 rounded-full bg-blue-500/20 blur-[120px] md:h-80 md:w-80" />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="space-y-6 md:space-y-8">
            <p className="inline-flex rounded-full border border-cyan-200/40 bg-cyan-200/10 px-4 py-1 text-sm text-cyan-100 backdrop-blur-md">
              Aquadrop B2B partnerprogram
            </p>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                Kevesebb reklamáció. Egyszerűbben eladható termék. Stabilabb napi működés.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg md:text-xl">
                Az Aquadrop Expert Pro nem egy átlagos mosókapszula: alacsony hőfokú mosásnál is megbízhatóan működik, így csökkenti a visszatérő panaszokat és kiszámíthatóbbá teszi az értékesítést.
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {HERO_BULLETS.map((bullet) => (
                <li
                  key={bullet}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-slate-100 shadow-[0_16px_26px_-24px_rgba(14,116,144,0.56)] backdrop-blur-lg"
                >
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="flex justify-center text-center md:justify-start md:text-left">
              <a
                href="#jelentkezes"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-400 px-6 text-sm font-semibold text-slate-950 shadow-[0_12px_22px_-16px_rgba(34,211,238,0.74)] transition hover:from-cyan-200 hover:to-sky-300"
              >
                Partneri egyeztetést kérek
              </a>
            </div>
          </div>

          <article className="flex h-full flex-col rounded-3xl border border-white/15 bg-white/10 p-6 shadow-[0_26px_48px_-40px_rgba(6,182,212,0.5)] backdrop-blur-xl md:p-7">
            <div>
              <h2 className="text-xl font-semibold text-white md:text-2xl">Üzleti fókusz, nem zajos sales kommunikáció</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-200 md:text-base">
                Prémium termék, kevesebb panasz és egyszerűbb értékesítési üzenet a napi partneri működéshez.
                Több bizalom a vásárlónál, stabilabb teljesítmény az értékesítésben.
              </p>
              <ul className="mt-6 space-y-4 text-sm text-slate-100 md:text-base">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" />
                  Webshopokra és bolti viszonteladásra optimalizálva.
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" />
                  Értékalapú prémium pozicionálás, árharc nélkül.
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" />
                  Bevezetési támogatás kész marketing és edukációs anyagokkal.
                </li>
              </ul>
            </div>

            <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.06] p-4 md:mt-auto md:p-5">
              <p className="text-sm font-semibold text-white md:text-base">Miért könnyebb eladni?</p>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-200 md:text-sm">
                <li>Kevesebb reklamáció → kevesebb ügyfélszolgálati terhelés</li>
                <li>Egyszerűen kommunikálható előny (20–30°C működés)</li>
                <li>Prémium érzet → magasabb kosárérték</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg md:p-10">
            <h2 className="text-2xl font-semibold text-white md:text-4xl">A probléma, amit a végén mindig a viszonteladó fizet meg</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {PROBLEM_POINTS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-red-200/20 bg-slate-950/50 p-5 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.85)]"
                >
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-red-200">
                    <CircleAlert className="h-4 w-4" />
                    {item.title}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300 md:text-base">{item.description}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/70 px-5 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-6 md:gap-8 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-[0_24px_44px_-38px_rgba(14,116,144,0.62)] backdrop-blur-xl md:p-8">
            <p className="text-sm font-medium uppercase tracking-wide text-cyan-200">Megoldás</p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">4 kamrás technológia, kiszámítható oldódási viselkedéssel</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-200 md:text-base">
              A labor- és használati tesztek alapján az oldódás hőmérséklet és programidő függvényében jól előrejelezhető.
              Ez lehetővé teszi a pontos vásárlói edukációt és a panaszforrások csökkentését.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {DISSOLUTION_RESULTS.map((result) => (
                <div
                  key={result.water}
                  className="rounded-2xl border border-cyan-100/30 bg-cyan-100/10 p-4 text-center shadow-[0_14px_26px_-26px_rgba(8,145,178,0.7)]"
                >
                  <p className="text-lg font-semibold text-cyan-100">{result.water}</p>
                  <p className="mt-1 text-sm text-slate-200">{result.time}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 rounded-2xl border border-emerald-200/25 bg-emerald-200/10 p-4 text-sm font-medium text-emerald-100 md:text-base">
              Következtetés: legalább 20°C és legalább 18 perc programidő mellett maradék nélküli oldódás érhető el.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_38px_-36px_rgba(15,23,42,0.8)] backdrop-blur-lg md:p-8">
            <p className="text-sm font-medium uppercase tracking-wide text-cyan-200">Üzleti előnyök</p>
            <h3 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Mérhető nyereség a napi működésben</h3>
            <ul className="mt-6 space-y-3">
              {BUSINESS_BENEFITS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-200 md:text-base">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-slate-900/50 p-6 shadow-[0_24px_44px_-38px_rgba(8,47,73,0.64)] backdrop-blur-xl md:p-10">
            <p className="text-sm font-medium uppercase tracking-wide text-cyan-200">Termékpozicionálás</p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-4xl">Prémium kategória, racionális ár/érték üzenettel</h2>
            <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-200 md:text-lg">
              Az Aquadrop nem diszkont alternatíva. A termékpozíció lényege, hogy a végfelhasználó magasabb minőséget,
              kiszámíthatóbb teljesítményt és kevesebb kellemetlenséget kapjon — a partner pedig stabilabb értékesítést és
              erősebb márkakapcsolatot építsen.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-slate-950/50 p-5 shadow-[0_14px_24px_-22px_rgba(15,23,42,0.72)]">
                <Gem className="h-5 w-5 text-cyan-300" />
                <p className="mt-3 text-base font-medium text-white">Magas érzékelt érték</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-slate-950/50 p-5 shadow-[0_14px_24px_-22px_rgba(15,23,42,0.72)]">
                <LineChart className="h-5 w-5 text-cyan-300" />
                <p className="mt-3 text-base font-medium text-white">Fenntartható árrés</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-slate-950/50 p-5 shadow-[0_14px_24px_-22px_rgba(15,23,42,0.72)]">
                <Handshake className="h-5 w-5 text-cyan-300" />
                <p className="mt-3 text-base font-medium text-white">Hosszú távú partnerérték</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/70 px-5 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-2xl font-semibold text-white md:text-4xl">Értékesítési támogatás, ami tényleg használható</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {SALES_SUPPORT.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-[0_18px_30px_-30px_rgba(8,47,73,0.72)] backdrop-blur-lg md:p-6"
              >
                <Icon className="h-5 w-5 text-cyan-300" />
                <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-200 md:text-base">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950 px-5 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-5xl">
            <p className="text-sm font-medium uppercase tracking-wide text-cyan-200">Viszonteladói szempontok</p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-4xl">
              Mosókapszula viszonteladóknak: mire figyel egy jó partner?
            </h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-slate-200 sm:text-lg sm:leading-8 [&_p]:text-slate-200 [&_p]:leading-8">
              <p>
                A mosókapszula ma már nemcsak kényelmi termék, hanem önálló értékesítési kategória. A vásárlók gyors,
                pontosan adagolható és megbízható megoldást keresnek, a kereskedők számára pedig az számít, hogy a termék
                könnyen elmagyarázható, jól pozicionálható és kevés utólagos panaszt okozzon.
              </p>
              <p>
                Az Aquadrop Expert Pro azoknak a partnereknek készült, akik nem pusztán egy újabb mosószert szeretnének a
                kínálatukba tenni, hanem olyan prémium mosókapszulát keresnek, amely mögé világos értékesítési történet
                építhető: 4 az 1-ben hatás, alacsony hőfokú mosás támogatása, praktikus használat és erős márkaélmény.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:border-cyan-300/40 hover:bg-white/[0.1] md:p-7">
              <h3 className="text-lg font-semibold text-slate-50">Miért lehet jó üzlet a mosókapszula viszonteladóknak?</h3>
              <div className="mt-5 space-y-5 text-base leading-7 text-slate-200 [&_p]:text-slate-200 [&_p]:leading-7">
                <p>
                  A kapszulás mosószerek egyik legnagyobb előnye, hogy a vásárló számára egyszerűen érthetők. Nincs
                  méricskélés, nincs túladagolás, a használat gyors és kényelmes. Ez a bolti és online értékesítésben is
                  előny, mert a termékelőny néhány mondatban átadható.
                </p>
                <p>
                  Viszonteladói oldalról a jó termék nemcsak eladható, hanem csökkenti az utólagos bizonytalanságot is. Ha
                  a vevő érti, hogyan kell használni a kapszulát, milyen hőfokon működik jól, és milyen programidő mellett
                  várható a legjobb eredmény, kisebb eséllyel alakul ki félreértés vagy reklamáció.
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:border-cyan-300/40 hover:bg-white/[0.1] md:p-7">
              <h3 className="text-lg font-semibold text-slate-50">Mitől lesz erős egy mosókapszula beszállítói ajánlat?</h3>
              <div className="mt-5 space-y-5 text-base leading-7 text-slate-200 [&_p]:text-slate-200 [&_p]:leading-7">
                <p>
                  Egy viszonteladó számára nem kizárólag a beszerzési ár számít. Legalább ilyen fontos a termékpozíció, a
                  márkaépítés, az elérhető marketinganyagok, a logisztikai kiszámíthatóság és az, hogy a termék milyen
                  választ ad a vásárlók valódi problémáira.
                </p>
                <p>
                  Az Aquadrop partneri ajánlata erre épül: prémium megjelenés, egyértelmű kommunikáció, edukációs tartalmak
                  és olyan termékelőnyök, amelyeket a vásárló is könnyen megért. Ez különösen fontos azoknál a kereskedőknél,
                  akik nem árversenyben, hanem értékalapú értékesítésben gondolkodnak.
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:border-cyan-300/40 hover:bg-white/[0.1] md:p-7">
              <h3 className="text-lg font-semibold text-slate-50">Milyen termékelőnyöket keresnek a vásárlók?</h3>
              <div className="mt-5 space-y-5 text-base leading-7 text-slate-200 [&_p]:text-slate-200 [&_p]:leading-7">
                <p>
                  A vásárlók többsége nem technológiai részleteket keres, hanem egyszerű választ szeretne: tiszta lesz-e a
                  ruha, kellemes lesz-e az illat, nem marad-e kapszulamaradék, használható-e alacsonyabb hőfokon, és megéri-e
                  az árát.
                </p>
                <p>
                  Ezért az Aquadrop kommunikációja gyakorlati előnyökre épül. A 20-30°C-os mosás támogatása, a megfelelő
                  használat és a legalább 18 perces programidő hangsúlyozása segít elmagyarázni, hogyan csökkenthető a
                  kapszulamaradék kockázata. A 4 az 1-ben hatás és a prémium illatélmény szintén olyan üzenet, amelyet
                  egy viszonteladó könnyen be tud építeni a saját értékesítési folyamataiba.
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:border-cyan-300/40 hover:bg-white/[0.1] md:p-7">
              <h3 className="text-lg font-semibold text-slate-50">Hogyan érdemes tárolni és kommunikálni a mosókapszulát?</h3>
              <div className="mt-5 space-y-5 text-base leading-7 text-slate-200 [&_p]:text-slate-200 [&_p]:leading-7">
                <p>
                  A mosókapszulákat száraz, hűvös helyen, nedvességtől és közvetlen napfénytől védve érdemes tárolni. A
                  vásárlók felé különösen fontos hangsúlyozni, hogy a kapszulákat mindig gyermekektől elzárva kell tartani,
                  lehetőség szerint zárható dobozban.
                </p>
                <p>
                  Ez nemcsak biztonsági kérdés, hanem bizalomépítési pont is. Egy felelős viszonteladó nemcsak eladja a
                  terméket, hanem segít a helyes használatban is. Az ilyen edukáció hosszabb távon erősíti a vásárlói
                  elégedettséget és az újravásárlási arányt.
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 shadow-xl shadow-black/25 backdrop-blur-xl transition hover:border-cyan-300/40 hover:bg-white/[0.1] md:col-span-2 md:p-7">
              <h3 className="text-lg font-semibold text-slate-50">Kinek ajánlott az Aquadrop partnerprogram?</h3>
              <div className="mt-5 grid gap-5 text-base leading-7 text-slate-200 md:grid-cols-2 [&_p]:text-slate-200 [&_p]:leading-7">
                <p>
                  Az Aquadrop partnerprogram azoknak a boltoknak, webáruházaknak és értékesítési partnereknek lehet jó
                  választás, akik prémium mosókapszulát keresnek viszonteladásra, és fontos számukra a jól kommunikálható
                  termékelőny, az igényes márkamegjelenés és a hosszú távon építhető vásárlói bizalom.
                </p>
                <p>
                  A cél nem az, hogy egy újabb átlagos mosószer kerüljön a polcra. A cél az, hogy a partner olyan terméket
                  kapjon, amely mögött erős történet, gyakorlati előny és támogatható értékesítési logika áll.
                </p>
              </div>
            </article>
          </div>

          <div className="mt-12">
            <div className="max-w-5xl">
              <h3 className="text-2xl font-semibold text-white md:text-3xl">
                Gyakorlati útmutató mosókapszula viszonteladóknak
              </h3>
              <p className="mt-4 max-w-4xl text-base leading-7 text-slate-200 md:text-lg md:leading-8">
                A sikeres viszonteladói értékesítés nemcsak a jó terméken múlik. Fontos a megfelelő kategóriázás, az
                érthető vásárlói kommunikáció, a kiszerelés, a raktározás és az is, hogy a partner gyorsan el tudja
                magyarázni, miért érdemes prémium mosókapszulát választani.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 shadow-xl shadow-black/25 backdrop-blur-xl [&_p]:text-slate-200 [&_p]:leading-7">
                <h4 className="text-lg font-semibold text-slate-50">Termékkategóriák és vásárlói igények</h4>
                <div className="mt-5 space-y-5 text-base">
                  <p>
                    A vásárlók eltérő szempontok alapján keresnek mosószert. Van, akinek az egyszerű adagolás fontos,
                    más a kellemes illatot, az alacsony hőfokú mosást, a színes ruhák védelmét vagy az érzékenyebb
                    textíliák kíméletes kezelését keresi. Egy viszonteladónak ezért érdemes nemcsak terméket, hanem
                    érthető választási szempontokat is adnia.
                  </p>
                  <p>
                    Az Aquadrop Expert Pro kommunikációja ebben segít: a 4 az 1-ben hatás, a praktikus használat, a
                    prémium illatélmény és az alacsony hőfokú mosás támogatása könnyen beépíthető bolti ajánlásba,
                    webshopos termékleírásba vagy értékesítési kampányba.
                  </p>
                </div>
              </article>

              <article className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 shadow-xl shadow-black/25 backdrop-blur-xl [&_p]:text-slate-200 [&_p]:leading-7">
                <h4 className="text-lg font-semibold text-slate-50">Kiszerelés, raktározás és szállítás</h4>
                <div className="mt-5 space-y-5 text-base">
                  <p>
                    A mosókapszula viszonteladóknak logisztikai szempontból is kedvező kategória lehet, mert kompakt,
                    jól tervezhető és könnyen készletezhető. A tárolásnál ugyanakkor fontos a száraz, hűvös környezet,
                    a nedvességtől való védelem és a gyermekektől elzárt elhelyezés.
                  </p>
                  <p>
                    A partneri működésben az is számít, hogy a termék kiszerelése, csomagolása és szállíthatósága
                    illeszkedjen a bolti vagy online értékesítéshez. Egy jól kommunikálható prémium termék kevesebb
                    magyarázatot igényel, miközben nagyobb bizalmat építhet a vásárlóban.
                  </p>
                </div>
              </article>

              <article className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 shadow-xl shadow-black/25 backdrop-blur-xl [&_p]:text-slate-200 [&_p]:leading-7">
                <h4 className="text-lg font-semibold text-slate-50">Webshopos és bolti értékesítési logika</h4>
                <div className="mt-5 space-y-5 text-base">
                  <p>
                    Webshopban érdemes külön figyelni a kategóriákra, a termékelőnyök rövid megfogalmazására és a
                    gyakori vásárlói kérdések megválaszolására. A vevő gyorsan szeretné látni, mire való a termék,
                    hogyan kell használni, milyen hőfokon ajánlott, és milyen előnyt kap a hagyományos mosószerekhez
                    képest.
                  </p>
                  <p>
                    Bolti értékesítésnél a polci megjelenés, a rövid ajánlószöveg és az eladói edukáció kap nagyobb
                    szerepet. Az Aquadrop partnerprogram célja, hogy a viszonteladó ne egyedül találja ki ezeket az
                    üzeneteket, hanem használható termékelőnyökkel és kommunikációs alapokkal dolgozhasson.
                  </p>
                </div>
              </article>
            </div>

            <aside className="mt-6 rounded-2xl border border-cyan-200/30 bg-cyan-200/10 p-5 shadow-[0_18px_34px_-32px_rgba(34,211,238,0.72)] backdrop-blur-xl md:p-6">
              <h4 className="text-lg font-semibold text-white">Gyors válasz viszonteladóknak</h4>
              <p className="mt-3 text-base leading-7 text-slate-100">
                A mosókapszula viszonteladóknak akkor lehet jó választás, ha a termék könnyen magyarázható, jól
                készletezhető, erős vásárlói előnyt ad, és támogatja a prémium értékesítési pozíciót. Az Aquadrop
                Expert Pro ezt 4 az 1-ben hatással, alacsony hőfokú mosási kommunikációval és partneri értékesítési
                támogatással segíti.
              </p>
            </aside>
          </div>

          <div className="mt-8 rounded-2xl border border-cyan-200/40 bg-cyan-200/15 p-5 shadow-[0_20px_38px_-34px_rgba(34,211,238,0.78)] backdrop-blur-xl md:flex md:items-center md:justify-between md:gap-8 md:p-7">
            <div>
              <h3 className="text-xl font-semibold text-white">Érdekel a viszonteladói együttműködés?</h3>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-200">
                Kérj partneri egyeztetést, és nézzük meg, hogyan illeszthető az Aquadrop Expert Pro a kínálatodba.
              </p>
            </div>
            <a
              href="#jelentkezes"
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-400 px-6 text-sm font-semibold text-slate-950 shadow-[0_12px_22px_-16px_rgba(34,211,238,0.74)] transition hover:from-cyan-200 hover:to-sky-300 md:mt-0 md:w-auto"
            >
              Partneri egyeztetést kérek
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:items-stretch lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-slate-950/55 p-6 shadow-[0_24px_42px_-36px_rgba(14,116,144,0.58)] backdrop-blur-xl md:p-8 lg:flex lg:h-full lg:flex-col lg:justify-between">
            <p className="text-sm font-medium uppercase tracking-wide text-cyan-200">Teljesítmény</p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Teljesítmény, ami a gyakorlatban is számít</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200 md:text-base">
              A partner számára a kiszámítható minőség akkor érték, ha a végfelhasználói élmény is stabil marad. Az Aquadrop
              Expert Pro alacsony hőfokú mosásnál is jól kommunikálható, differenciáló termék, ezért a prémium pozicionálás
              nemcsak ígéret, hanem napi szinten átadható értékesítési érv.
            </p>
            <div className="mt-6 space-y-5 md:hidden">
              {PERFORMANCE_POINTS.slice(0, 2).map((item) => (
                <article
                  key={item}
                  className="rounded-2xl border border-white/25 bg-white/[0.08] p-4 text-sm text-slate-200 shadow-[0_14px_24px_-24px_rgba(8,145,178,0.6)] transition-colors hover:bg-white/[0.1]"
                >
                  <p className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/95" />
                    <span className="text-white/90">{item}</span>
                  </p>
                </article>
              ))}
              <div className="my-8 flex justify-center">
                <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-slate-900/60 shadow-[0_16px_28px_-26px_rgba(8,145,178,0.7)]">
                  <Image
                    src="/aquadrop-viszontelado-ertekesites-tamogatas.webp"
                    alt="Aquadrop partner teljesítmény vizuális összefoglaló"
                    width={920}
                    height={620}
                    className="h-full w-full object-cover"
                    sizes="(min-width: 768px) 70vw, 100vw"
                  />
                </div>
              </div>
              {PERFORMANCE_POINTS.slice(2).map((item) => (
                <article
                  key={item}
                  className="rounded-2xl border border-white/25 bg-white/[0.08] p-4 text-sm text-slate-200 shadow-[0_14px_24px_-24px_rgba(8,145,178,0.6)] transition-colors hover:bg-white/[0.1]"
                >
                  <p className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/95" />
                    <span className="text-white/90">{item}</span>
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 hidden md:grid md:gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                {PERFORMANCE_POINTS.slice(0, 2).map((item) => (
                  <article
                    key={item}
                    className="rounded-2xl border border-white/25 bg-white/[0.08] p-4 text-sm text-slate-200 shadow-[0_14px_24px_-24px_rgba(8,145,178,0.6)] transition-colors hover:bg-white/[0.1] md:text-base"
                  >
                    <p className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/95" />
                      <span className="text-white/90">{item}</span>
                    </p>
                  </article>
                ))}
              </div>
              <div className="my-4 flex justify-center">
                <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-slate-900/60 shadow-[0_16px_28px_-26px_rgba(8,145,178,0.7)]">
                  <Image
                    src="/aquadrop-viszontelado-ertekesites-tamogatas.webp"
                    alt="Aquadrop partner teljesítmény vizuális összefoglaló"
                    width={920}
                    height={620}
                    className="h-full w-full object-cover"
                    sizes="(min-width: 1280px) 44rem, (min-width: 768px) 78vw, 100vw"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {PERFORMANCE_POINTS.slice(2).map((item) => (
                  <article
                    key={item}
                    className="rounded-2xl border border-white/25 bg-white/[0.08] p-4 text-sm text-slate-200 shadow-[0_14px_24px_-24px_rgba(8,145,178,0.6)] transition-colors hover:bg-white/[0.1] md:text-base"
                  >
                    <p className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/95" />
                      <span className="text-white/90">{item}</span>
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </article>

          <div id="jelentkezes" className="scroll-mt-24 lg:h-full">
            <ResellerSection />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/80 px-5 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wide text-cyan-200">Partner tudástár</p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-4xl">Viszonteladói tudástár</h2>
            <p className="mt-4 text-base leading-7 text-slate-200 md:text-lg">
              Hasznos cikkek üzleteknek, webshopoknak és beszerzőknek az Aquadrop Expert Pro forgalmazásához.
            </p>
          </div>
          <Link
            href="/partner/tudastar"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-cyan-300 px-6 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Cikkek viszonteladóknak
          </Link>
        </div>
      </section>

      <PartnerMediaKitSection />
    </main>
  );
}
