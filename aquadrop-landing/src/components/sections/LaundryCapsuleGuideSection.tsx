import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type GuideCard = {
  title: string;
  body: string;
  topic?: string;
};

const guideCards: GuideCard[] = [
  {
    title: 'Miért érdemes mosókapszulát használni?',
    body: 'A mosókapszula egyik legnagyobb előnye a pontos adagolás. Nem kell méricskélni, kisebb az esélye a túladagolásnak, és a használata gyorsabb, mint a hagyományos folyékony mosószeré vagy mosóporé. Ez különösen hasznos a mindennapi mosásnál, amikor a cél az egyszerű, tiszta és kiszámítható eredmény.'
  },
  {
    title: 'Hogyan működik egy mosókapszula?',
    body: 'A kapszula vízoldható fóliába zárt, koncentrált mosószert tartalmaz. A mosás során a fólia feloldódik, a hatóanyagok pedig a vízzel együtt eloszlanak a ruhák között. Az Aquadrop Expert Pro 4 az 1-ben koncepciója a tisztítóhatást, a friss illatélményt, a praktikus használatot és a modern mosási igényeket kapcsolja össze.'
  },
  {
    title: 'Hova kell tenni a mosókapszulát?',
    topic: 'mosókapszula dobba vagy adagolóba',
    body: 'A mosókapszulát mindig közvetlenül a mosógép dobjába érdemes tenni, még a ruhák behelyezése előtt. Nem az adagolófiókba való. Így nagyobb eséllyel érintkezik megfelelően a vízzel, és egyenletesebben tud feloldódni a program során.'
  },
  {
    title: 'Milyen hőmérsékleten működik jól?',
    topic: 'mosókapszula 20 fokon és mosókapszula 30 fokon',
    body: 'A modern mosókapszulák alacsonyabb hőfokon is jól használhatók, de a hőmérséklet mellett a programidő is fontos. Az Aquadrop kommunikációjában ezért kiemelt szerepet kap a 20–30°C-os mosás és az, hogy legalább 18 perces programidő mellett várható a legjobb oldódási eredmény.'
  },
  {
    title: 'Miért nem oldódik fel néha a mosókapszula?',
    topic: 'mosókapszula nem oldódik',
    body: 'A kapszulamaradék leggyakoribb oka a túl rövid program, a túl alacsony vízmennyiség, a túltöltött dob vagy az, ha a kapszula nem érintkezik megfelelően a vízzel. Ha gyakran jelentkezik ilyen probléma, érdemes hosszabb programot választani, kevesebb ruhát tenni a dobba, és ellenőrizni, hogy a kapszula valóban a dob aljába került-e.'
  },
  {
    title: 'Használható színes és fehér ruhákhoz is?',
    body: 'A mosókapszulák között léteznek univerzális, színes ruhákhoz ajánlott és speciális célra fejlesztett változatok is. A választásnál mindig érdemes figyelni a termék leírására és a ruhacímkékre. Az Aquadrop Expert Pro a mindennapi mosási helyzetekhez készült, ahol a tisztaság, az illatélmény és az egyszerű használat egyszerre fontos.'
  },
  {
    title: 'Mosókapszula vagy folyékony mosószer?',
    topic: 'mosókapszula vagy folyékony mosószer',
    body: 'A folyékony mosószer rugalmasan adagolható, a mosókapszula viszont előre kimért mennyiséget tartalmaz. Ez kényelmesebb lehet azoknak, akik gyors és egyszerű megoldást keresnek, és nem szeretnének minden mosásnál adagolással foglalkozni. A kapszula különösen praktikus a rendszeres, hétköznapi mosásoknál.'
  },
  {
    title: 'Hogyan kell biztonságosan tárolni?',
    topic: 'mosókapszula tárolása',
    body: 'A mosókapszulát száraz, hűvös helyen, nedvességtől védve kell tárolni. Kisgyermekes háztartásban különösen fontos, hogy mindig gyermekektől elzárva legyen. A zárható, stabil csomagolás nemcsak praktikus, hanem a biztonságos otthoni használat egyik fontos része is.'
  }
];

const steps = [
  'Tedd a kapszulát közvetlenül a mosógép dobjába.',
  'Pakold rá a ruhákat, de ne töltsd túl a dobot.',
  'Válassz megfelelő hosszúságú programot.',
  'Alacsonyabb hőfokon is figyelj arra, hogy legyen elegendő programidő az oldódáshoz.'
] as const;

const relatedGuides = [
  {
    href: '/mosokapszula-hasznalata',
    label: 'Mosókapszula használata lépésről lépésre'
  },
  {
    href: '/mosokapszula-dobba-vagy-adagoloba',
    label: 'Mosókapszula dobba vagy adagolóba?'
  },
  {
    href: '/mosokapszula-nem-oldodik-fel',
    label: 'Miért nem oldódik fel a mosókapszula?'
  }
] as const;

export function LaundryCapsuleGuideSection() {
  return (
    <section
      className="relative overflow-hidden px-5 py-16 sm:px-6 md:px-10 md:py-24 [&_p]:text-slate-700"
      aria-labelledby="laundry-capsule-guide-title"
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(240,253,250,0.94),rgba(255,255,255,0.86)_46%,rgba(224,242,254,0.88))]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(14,116,144,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,116,144,0.05)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Mosókapszula alacsony hőfokon
          </p>
          <h2
            id="laundry-capsule-guide-title"
            className="mt-4 text-balance text-3xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-5xl"
          >
            Mosókapszula kisokos: hogyan használd jól, hogy tényleg működjön?
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-700 md:text-lg">
            A mosókapszula akkor adja a legjobb eredményt, ha megfelelően használod: közvetlenül a dobba kerül, nincs túltöltve a mosógép, és a program ideje elegendő ahhoz, hogy a kapszula teljesen feloldódjon. Az Aquadrop Expert Pro célja, hogy a mindennapi mosás egyszerűbb, tisztább és kiszámíthatóbb legyen – akár alacsonyabb hőfokon is.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-cyan-200/80 bg-white/85 p-5 shadow-xl shadow-cyan-950/5 backdrop-blur md:p-7">
          <h3 className="text-xl font-extrabold text-slate-950">Gyors válasz</h3>
          <p className="mt-3 text-base leading-8 text-slate-700 md:text-lg">
            A mosókapszula előre adagolt, vízoldható fóliába zárt mosószer, amelyet közvetlenül a mosógép dobjába kell tenni. Előnye a kényelmes használat, a pontos adagolás és a friss mosási eredmény. Alacsonyabb hőfokon is jól működhet, ha a programidő elegendő, a dob nincs túltöltve, és a kapszula megfelelően érintkezik a vízzel.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {guideCards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-xl shadow-cyan-950/5 backdrop-blur md:p-6"
            >
              {card.topic ? (
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">{card.topic}</p>
              ) : null}
              <h3 className={card.topic ? 'mt-3 text-xl font-bold leading-snug text-slate-950' : 'text-xl font-bold leading-snug text-slate-950'}>
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">{card.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-cyan-200/80 bg-white/85 p-5 shadow-xl shadow-cyan-950/5 backdrop-blur md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">mosókapszula vagy mosópor</p>
          <h3 className="mt-3 text-2xl font-extrabold leading-tight text-slate-950 md:text-3xl">
            Mosókapszula, folyékony mosószer vagy mosópor?
          </h3>
          <p className="mt-4 text-base leading-8 text-slate-700 md:text-lg">
            A mosópor sok háztartásban megszokott megoldás, a folyékony mosószer rugalmasan adagolható, a mosókapszula pedig a kényelmet és a pontos adagolást helyezi előtérbe. Az Aquadrop Expert Pro azoknak készült, akik a mindennapi mosásban gyors, tiszta és prémium érzetű megoldást keresnek, különösen akkor, ha fontos az alacsonyabb hőfokú, energiatakarékos mosás is.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-xl shadow-cyan-950/5 backdrop-blur md:p-6">
            <h3 className="text-2xl font-extrabold leading-tight text-slate-950 md:text-3xl">
              A mosókapszula használata 4 egyszerű lépésben
            </h3>
            <ol className="mt-5 space-y-3">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-7 text-slate-700 md:text-base">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50/80 px-4 py-3 text-sm leading-7 text-slate-700 md:text-base">
              Az Aquadrop esetében a 20–30°C-os mosás is jó választás lehet, ha a program legalább 18 percig tart, és a kapszula megfelelően érintkezik a vízzel.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-200/80 bg-gradient-to-br from-cyan-700 via-cyan-800 to-slate-950 p-5 shadow-xl shadow-cyan-950/15 md:p-7">
            <h3 className="text-2xl font-extrabold leading-tight text-white md:text-3xl">
              Próbáld ki a prémium mosási élményt
            </h3>
            <p className="mt-4 text-base leading-8 !text-cyan-50 md:text-lg">
              Ismerd meg az Aquadrop Expert Pro 4 az 1-ben mosókapszulát, és nézd meg, hogyan segíthet egyszerűbbé, frissebbé és tudatosabbá tenni a mindennapi mosást.
            </p>
            <a
              href="#gift-form"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-cyan-900 shadow-lg shadow-cyan-950/20 transition hover:-translate-y-0.5 hover:bg-cyan-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
            >
              Érdekel az Aquadrop
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200/70 bg-white/75 p-5 shadow-xl shadow-cyan-950/5 backdrop-blur md:p-6">
          <h3 className="text-xl font-bold text-slate-950">Kapcsolódó útmutatók</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {relatedGuides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-cyan-100 bg-white/80 px-4 py-3 text-sm font-bold leading-6 text-cyan-900 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
              >
                <span>{guide.label}</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
