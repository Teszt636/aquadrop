import type { Metadata } from 'next';
import Link from 'next/link';

import { ArticleSignupCta } from '@/components/articles/ArticleSignupCta';
import { JsonLd } from '@/components/JsonLd';
import { RelatedGuides } from '@/components/RelatedGuides';
import { WashingCostCalculator } from '@/components/tools/WashingCostCalculator';

const faqItems = [
  {
    question: 'Mire jó a mosási költség kalkulátor?',
    answer:
      'A mosási költség kalkulátor segít megbecsülni, mennyibe kerül egy mosás, és hogyan változhat a költség, ha alacsonyabb hőfokon mosol.',
  },
  {
    question: 'Mitől függ egy mosás ára?',
    answer:
      'Egy mosás ára főleg a mosógép energiafogyasztásától, a választott hőfoktól, a program hosszától, az áramdíjtól és a heti mosások számától függ.',
  },
  {
    question: 'Olcsóbb 20 fokon mosni, mint 40 fokon?',
    answer:
      'Sok esetben igen, mert a mosógépnek kevesebb energiát kell vízmelegítésre fordítania. A pontos különbség a gép fogyasztásától és a mosási szokásoktól függ.',
  },
  {
    question: 'Pontos eredményt ad a kalkulátor?',
    answer:
      'A kalkulátor becslést ad, nem hivatalos mérési eredményt. Arra jó, hogy megmutassa a 20°C és 40°C közötti költségkülönbség nagyságrendjét.',
  },
  {
    question: 'Hogyan csökkenthető a mosási költség?',
    answer:
      'A költség csökkenthető alacsonyabb hőfokkal, megfelelő programmal, nem túltöltött dobbal és olyan mosószerrel, amely alacsony hőfokon is jól működik.',
  },
];

export const metadata: Metadata = {
  title: 'Mosási költség kalkulátor: mennyit spórolsz 20 fokon?',
  description: 'Számold ki, mennyit spórolhatsz alacsony hőfokú mosással. Ingyenes mosási költség kalkulátor az Aquadroptól.',
  alternates: { canonical: 'https://www.aquadrop.hu/mosasi-koltseg-kalkulator' },
  openGraph: {
    title: 'Számold ki: ennyit spórolsz 20 fokos mosással',
    description: 'Interaktív kalkulátor, amellyel kiszámolhatod, mennyi energiát és pénzt takaríthatsz meg alacsonyabb hőfokú mosással.',
    url: 'https://www.aquadrop.hu/mosasi-koltseg-kalkulator',
    siteName: 'Aquadrop Expert Pro',
    type: 'website',
    images: [
      {
        url: 'https://www.aquadrop.hu/20-fokos-mosas-megtakaritas-aquadrop-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Mosási költség kalkulátor 20 fokos mosás megtakarítás'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mosási költség kalkulátor: mennyit spórolsz 20 fokon?',
    description: 'Számold ki, mennyit spórolhatsz alacsony hőfokú mosással.',
    images: ['https://www.aquadrop.hu/20-fokos-mosas-megtakaritas-aquadrop-og.jpg']
  }
};

export default async function WashingCostCalculatorPage({ searchParams }: { searchParams: Promise<{ embed?: string }> }) {
  const params = await searchParams;
  const isEmbed = params.embed === 'true';
  const webAppSchema = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Mosási költség kalkulátor', applicationCategory: 'UtilityApplication', operatingSystem: 'Web', description: 'Ingyenes kalkulátor, amellyel kiszámolható a 20 fokos mosás lehetséges energiamegtakarítása.', url: 'https://www.aquadrop.hu/mosasi-koltseg-kalkulator', publisher: { '@type': 'Organization', name: 'Aquadrop Expert Pro' } };
  const faqStructuredData = {
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [webAppSchema, faqStructuredData],
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-50 via-sky-50 to-white px-4 py-10 md:px-6 md:py-12">
      <JsonLd data={structuredData} />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:gap-10">
        {!isEmbed && (
          <header className="rounded-3xl border border-cyan-100/70 bg-white/85 p-7 text-center shadow-[0_18px_55px_rgba(14,116,144,0.12)] backdrop-blur-sm md:p-10">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <p className="inline-flex rounded-full border border-cyan-200/80 bg-cyan-100/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">
                INGYENES MOSÁSI KALKULÁTOR
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">Mosási költség kalkulátor 20 és 40 fokos mosáshoz</h1>
              <p className="text-lg font-medium text-slate-800 md:text-xl">Számold ki, mennyit spórolhatsz 20 fokos mosással</p>
              <p className="text-slate-700">
                Add meg a mosási szokásaidat, és nézd meg, mekkora különbséget jelenthet az alacsonyabb hőfok a villanyszámlában.
                Ha a gyakorlatban bizonytalan vagy a hőfokválasztásban, a <Link href="/mosas-30-fokon-vagy-40-fokon">30 fokos vagy 40 fokos mosás</Link> útmutató segít dönteni.
              </p>
            </div>

            <div className="mx-auto mt-6 grid w-full max-w-3xl gap-3 text-center text-sm font-semibold text-cyan-900 md:grid-cols-3">
              {['Ingyenes kalkulátor', 'Megosztható eredmény', 'Beágyazható iframe'].map((item) => (
                <div key={item} className="rounded-2xl border border-cyan-100 bg-gradient-to-b from-white to-cyan-50/70 px-4 py-3 shadow-[0_8px_24px_rgba(8,145,178,0.10)]">
                  {item}
                </div>
              ))}
            </div>
          </header>
        )}

        <WashingCostCalculator placement="calculator_page" showShare={!isEmbed} showEmbed={!isEmbed} showIntroBadge={true} isEmbed={isEmbed} />
        {!isEmbed && (
          <section className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5 text-slate-700 md:p-6">
            <p>A mosási költség kalkulátor abban segít, hogy a saját mosási szokásaidat lásd számokban, ne csak általános spórolási tanácsokat olvass. Add meg a mosások számát és az energiaadatokat, majd hasonlítsd össze, hogyan változhat a becsült költség 40°C és 20°C között.</p>
            <p className="mt-3">
              Az eredményt érdemes becslésként kezelni, nem hivatalos energetikai tanúsításként. A tényleges költséget
              befolyásolja a mosógép típusa, a program hossza, a töltet mennyisége, a vízfelhasználás és az is, hogy a
              mosást elsőre sikerül-e jól beállítani.
            </p>
            <ul className="mt-4 space-y-2">
              <li>Gyors becslést ad a mosási energiafelhasználásról.</li>
              <li>Segít összehasonlítani a 20°C és 40°C közötti különbséget.</li>
              <li>Segít végiggondolni, mikor éri meg 20–30°C-ra váltani, és mikor jobb a hosszabb vagy melegebb program.</li>
            </ul>
          </section>
        )}


        {!isEmbed && (
          <>
            <section className="rounded-3xl border border-cyan-100/70 bg-white/80 p-7 shadow-[0_18px_55px_rgba(14,116,144,0.09)] backdrop-blur-sm md:p-8">
              <h2 className="text-center text-2xl font-semibold text-slate-900">Hogyan működik a mosási költség kalkulátor?</h2>
              <p className="mx-auto mt-3 max-w-3xl text-center text-slate-700">
                A mosási hőfok és a program hossza látványosan befolyásolhatja az energiafelhasználást. A kalkulátor segít megérteni,
                hogy ugyanazzal a heti mosásszámmal mekkora különbséget okozhat egy energiatudatosabb beállítás, például ha
                néhány hétköznapi töltetet 30 vagy 20 fokon mosol.
              </p>
              <div className="mt-6 grid gap-4 text-left text-slate-700 md:grid-cols-2">
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-800">Gyakorlati tanács</p>
                  <p className="mt-3">
                    A megtakarítás nem csak az alacsonyabb hőfokon múlik. Ha a túl rövid program miatt a ruha nem lesz
                    friss, vagy a kapszula maradékot hagy, az újramosás elviheti a különbséget. A jó beállítás elsőre ad
                    használható eredményt.
                  </p>
                </div>
                <div className="rounded-2xl border border-cyan-100 bg-white/85 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-800">Aquadrop nézőpont</p>
                  <p className="mt-3">
                    30°C sok hétköznapi mosásnál jó kompromisszum lehet, 20°C pedig enyhén szennyezett ruháknál takarékos
                    opció. Kapszulás mosásnál figyelj arra, hogy a program legalább 18 perces legyen, és a kapszula a dob
                    alján induljon.
                  </p>
                </div>
              </div>
              <p className="mx-auto mt-6 max-w-3xl text-slate-700">
                Ha a kalkulátor alapján nagy különbség látszik, nem kell egyik napról a másikra minden mosást hidegebbre
                állítani. Kezdd azokkal a töltetekkel, ahol kicsi a kockázat: enyhén szennyezett pólók, ingek, hétköznapi
                ruhák. A döntéshez hasznos háttér az <Link href="/energiatakarekos-mosas">energiatakarékos mosás</Link>{' '}
                útmutató és a <Link href="/mosokapszula-20-fokon">mosókapszula 20 fokon</Link> cikk is.
              </p>
              <ul className="mt-5 grid gap-3 text-sm font-medium text-cyan-900 md:grid-cols-3 md:text-base">
                {['Gyors becslés saját mosási szokások alapján', 'Megosztható eredménylink', 'Beágyazható kalkulátor más weboldalakhoz'].map((item) => (
                  <li key={item} className="flex min-h-28 items-center justify-center rounded-2xl border border-cyan-100 bg-white/85 px-4 py-3 text-center">
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <RelatedGuides
              title="Kapcsolódó útmutatók a mosási költségek csökkentéséhez"
              intro="Ha szeretnéd csökkenteni a mosás energiafogyasztását, ezek az útmutatók segítenek a hőfok, a programhossz és a mosókapszula használatának optimalizálásában."
              items={[
                { label: 'Megtakarítás', title: 'Mennyit spórolhatsz 20 fokos mosással?', description: 'Nézd meg, miért csökkentheti a mosási költséget, ha 40 helyett 20 fokon mosol.', href: '/mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol' },
                { label: 'Hőfokválasztás', title: '30 fokos vagy 40 fokos mosás?', description: 'Döntési útmutató, mikor elég az alacsonyabb hőfok, és mikor indokolt a 40°C.', href: '/mosas-30-fokon-vagy-40-fokon' },
                { label: 'Pillar útmutató', title: 'Energiatakarékos mosás lépésről lépésre', description: 'Alacsonyabb hőfok, tudatos programválasztás és kevesebb energiafelhasználás a mindennapi mosásban.', href: '/energiatakarekos-mosas' },
                { label: '20 fokos mosás', title: 'Hogyan moss hatékonyan 20 fokon?', description: 'Gyakorlati tanácsok ahhoz, hogy a 20 fokos mosás tiszta eredményt adjon a hétköznapi ruháknál.', href: '/hogyan-mossunk-20-fokon' },
              ]}
            />

            <ArticleSignupCta
              source="article:mosasi-koltseg-kalkulator"
              title="Kérsz még spórolási tippeket a mosáshoz?"
              description="Iratkozz fel, és értesítünk az új Aquadrop útmutatókról, promóciókról és energiatakarékos mosási tippekről."
            />

            <section className="rounded-3xl border border-cyan-100 bg-white/80 p-6 shadow-sm md:p-8">
              <h2 className="text-center text-2xl font-semibold text-slate-900">Gyakori kérdések a mosási költség kalkulátorról</h2>
              <div className="mt-5 space-y-4">
                {faqItems.map((item) => (
                  <section key={item.question} className="rounded-2xl border border-cyan-100 bg-white/80 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
                    <p className="mt-3 text-slate-700">{item.answer}</p>
                  </section>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-cyan-100/70 bg-white/80 p-7 text-center shadow-[0_18px_55px_rgba(14,116,144,0.10)] backdrop-blur-sm md:p-8">
              <h2 className="text-2xl font-semibold text-slate-900">20 vagy 40 fokon olcsóbb mosni?</h2>
              <p className="mt-3 text-slate-700">
                Ha szeretnél energiatudatosabban mosni, érdemes olyan mosókapszulát választani, amely alacsonyabb hőfokon is megbízható
                teljesítményt ad.
              </p>
              <Link
                href="/"
                className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-[0_10px_30px_rgba(8,145,178,0.35)] transition hover:from-cyan-500 hover:to-blue-500"
              >
                Megnézem az Aquadrop Expert Pro-t
              </Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
