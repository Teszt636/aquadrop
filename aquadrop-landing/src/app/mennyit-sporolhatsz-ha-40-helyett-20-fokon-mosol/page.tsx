import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import { EnergySavingsCalculator } from '@/components/energy-savings-calculator';
import { ButtonLink } from '@/components/ui';

const articleTitle = 'Mennyit spórolhatsz, ha 40 helyett 20 fokon mosol?';
const discoverTitle = 'Sokan nem hiszik el, mennyit spórolhatsz, ha 40 helyett 20 fokon mosol';
const h1Title = '20 fokos mosás: mennyit spórolhatsz 40 fok helyett?';
const heroImageUrl = 'https://www.aquadrop.hu/20-fokos-mosas-megtakaritas-aquadrop.webp';
const socialImageUrl = 'https://www.aquadrop.hu/og/20-fokos-mosas-megtakaritas-aquadrop-og.webp';
const heroImageWidth = 1536;
const heroImageHeight = 1024;
const heroImageAlt = '20 fokos mosás megtakarítás összehasonlítás Aquadrop Expert Pro mosókapszulával';
const heroImageCaption = 'Ennyit spórolhatsz, ha 40 helyett 20 fokon mosol';
const articleDescription =
  'Számold ki, mennyit változhat a mosás energiaköltsége, ha alacsonyabb hőfokon mosol. Interaktív kalkulátorral mutatjuk meg a különbséget.';
const articleUrl = 'https://www.aquadrop.hu/mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol';
const publishedDate = '2026-04-23';

const faqItems = [
  {
    question: 'Tényleg olcsóbb 20 fokon mosni?',
    answer:
      'Sok esetben igen, mert a mosógép energiaigényének jelentős része a víz melegítéséből adódik. A pontos különbség program- és gépfüggő, ezért becslésként érdemes kezelni.'
  },
  {
    question: 'Miért használ több energiát a magasabb hőfok?',
    answer:
      'Mert magasabb hőmérsékleten több energiát kell befektetni a víz felmelegítésébe. Ez különösen 40 °C fölött válik látványossá a költségekben.'
  },
  {
    question: 'Tiszták maradnak a ruhák 20 fokon?',
    answer:
      'Sok mindennapi ruhánál igen, ha a mosási folyamat megfelelő: elegendő programidő, helyes kapszulaelhelyezés, nem túlzsúfolt dob és a textilhez illő beállítás.'
  },
  {
    question: 'Számít a program hossza?',
    answer:
      'Igen. Alacsonyabb hőfokon különösen fontos, hogy legyen idő az oldódásra és az összetevők egyenletes eloszlására. Ezért kulcsszabály a legalább 20 °C-os, legalább 18 perces program.'
  },
  {
    question: 'Mennyire pontos a kalkulátor?',
    answer:
      'A kalkulátor védhető, átlátható becslési modellt használ, nem laborpontosságú mérőműszert. Összehasonlításhoz és szemléltetéshez készült, a valós értékeket befolyásolja a gép, a töltet, a program és az áramár.'
  }
];


export const metadata: Metadata = {
  title: '20 fokos mosás: mennyit spórolhatsz valójában?',
  description: articleDescription,
  keywords: [
    'mennyit spórolhatsz 20 fokos mosással',
    '40 helyett 20 fokon mosás',
    'energiatakarékos mosás',
    'mosás költsége',
    'mosógép fogyasztás hőfok szerint',
    '20 fokos mosás költsége',
    '30 fokos mosás költsége',
    '40 fokos mosás költsége',
    'mosási program energiafogyasztása',
    'alacsony hőfokú mosás',
    'mosás éves költsége'
  ],
  alternates: {
    canonical: articleUrl,
  },
  openGraph: {
    title: 'Mennyit spórolhatsz 20 fokos mosással? Meglepő számok!',
    description: articleDescription,
    url: articleUrl,
    siteName: 'Aquadrop Expert Pro',
    locale: 'hu_HU',
    type: 'article',
    publishedTime: `${publishedDate}T08:00:00.000Z`,
    modifiedTime: `${publishedDate}T08:00:00.000Z`,
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: heroImageAlt
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '20 fokos mosás: mennyit spórolhatsz valójában?',
    description: articleDescription,
    images: [socialImageUrl]
  }
};

export default function MennyitSporolhatsz20FokonPage() {
  void discoverTitle;

  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: articleTitle,
    description: articleDescription,
    image: {
      '@type': 'ImageObject',
      url: heroImageUrl,
      width: heroImageWidth,
      height: heroImageHeight
    },
    author: {
      '@type': 'Organization',
      name: 'Aquadrop',
      url: 'https://www.aquadrop.hu/'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Aquadrop',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.aquadrop.hu/logo.png',
        width: 1182,
        height: 1182
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    },
    datePublished: `${publishedDate}T08:00:00.000Z`,
    dateModified: `${publishedDate}T08:00:00.000Z`
  };

  const faqStructuredData = {
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  const breadcrumbStructuredData = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Főoldal', item: 'https://www.aquadrop.hu/' },
      { '@type': 'ListItem', position: 2, name: 'Mosási tudástár', item: 'https://www.aquadrop.hu/#tudastar' },
      { '@type': 'ListItem', position: 3, name: articleTitle, item: articleUrl }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              articleStructuredData,
              faqStructuredData,
              breadcrumbStructuredData
            ]
          })
        }}
      />

      <ArticleLayout
        slug="mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol"
        category="Energiatudatos mosás"
        readingTime="kb. 8 perc olvasás"
        title={h1Title}
        intro="Egyre többen keresik, hogyan csökkenthető a háztartási energiafelhasználás anélkül, hogy a tisztaságérzetből engedni kellene. A mosás hőfoka ebben kulcstényező: a 40 helyett 20 fokon történő mosás érzékelhetően alacsonyabb energiaigényt jelenthet, ha a programhossz, a töltet és a mosási megoldás is megfelelően van megválasztva."
        cta={
          <div className="rounded-[28px] border border-cyan-100/80 bg-gradient-to-br from-white via-cyan-50/80 to-teal-50/80 p-7 shadow-[0_22px_65px_rgba(15,23,42,0.1)] md:p-10">
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl leading-tight md:text-3xl">Ismerd meg az Aquadrop Expert Pro megoldását</h2>
              <p>
                Ha olyan mosási megoldást keresel, amely alacsony hőfokon is kényelmes, kiszámítható és hatékony
                használatot támogat, nézd meg az Aquadrop Expert Pro részleteit és aktuális ajánlatait.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <ButtonLink className="mt-2" href="/#gift-form">
                  Megnézem az ajánlatot
                </ButtonLink>
                <Link className="mt-2 font-semibold text-brand-primary transition hover:text-blue-800" href="/#partners">
                  Hol kapható?
                </Link>
              </div>
            </div>
          </div>
        }
      >
        <figure className="overflow-hidden rounded-2xl border border-cyan-100 bg-white/80 shadow-sm">
          <Image
            src="/20-fokos-mosas-megtakaritas-aquadrop.webp"
            alt={heroImageAlt}
            title={heroImageCaption}
            width={1600}
            height={900}
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
          <figcaption className="px-4 py-3 text-sm text-slate-600 md:px-5">{heroImageCaption}</figcaption>
        </figure>

                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5 md:p-6">
          <p className="mt-3">A 20 fokos mosás megtakarítás főként abból adódik, hogy a mosógépnek kevesebb energiát kell vízmelegítésre fordítania. Ha gyakran mosol 40°C helyett 20°C-on, éves szinten érezhetően csökkenhet a mosási energiafogyasztásod, különösen akkor, ha a mindennapi ruhákat alacsony hőfokon, jól oldódó mosószerrel mosod.</p>
          <ul className="mt-4 space-y-2">
            <li>A legnagyobb energiaigény általában a víz felmelegítéséből jön.</li>
            <li>A megtakarítás a mosások számától és a gép energiafogyasztásától függ.</li>
            <li>A kalkulátorral gyorsan megbecsülheted a saját különbségedet.</li>
          </ul>
        </div>

        <h2>Mennyit lehet reálisan spórolni, ha 40 helyett 20 fokon mosol?</h2>
        <p>
          Az alacsonyabb hőfok sok háztartásban mérhető éves különbséget adhat, főleg akkor, ha gyakran mosol. A
          pontos érték géptípustól és programtól függ, ezért érdemes saját adatokkal becslést futtatni.
        </p>
        <p>
          Kiindulásként nézd át az <Link href="/energiatakarekos-mosas">energiatakarékos mosás</Link> alapelveit, majd
          a kalkulátorban ellenőrizd a te heti rutinodra vetített számokat.
        </p>
        <p>
          Amikor a háztartási költségek optimalizálásáról beszélünk, a figyelem gyakran a fűtésre vagy a főzésre
          irányul. Pedig a rendszeres mosás is olyan terület, ahol a napi rutinból éves szinten jelentős különbség
          adódhat. Nem feltétlenül egyetlen nagy döntésből, hanem sok kisebb, tudatos beállításból.
        </p>
        <p>
          A „40 helyett 20 fokon mosás” kérdése ezért nem csak technikai téma, hanem gyakorlati döntés. A legtöbb
          háztartásban nem laborpontosságú adatokat keresnek, hanem egy jól értelmezhető választ arra, hogy melyik
          beállítás mennyire lehet költségtudatos, és mikor marad meg a tiszta, rendezett végeredmény.
        </p>
        <p>
          Ezen az oldalon éppen erre adunk használható keretet: közérthetően bemutatjuk, miért számít ennyit a
          hőfok, milyen szerepe van a programhossznak, és egy interaktív kalkulátorral megmutatjuk, hogyan változhat
          a becsült mosási költség a különböző beállítások között.
        </p>

        <h2>Miért kerül kevesebbe az alacsony hőfokú mosás?</h2>
        <p>
          A mosógép energiafelhasználásának jelentős része a víz melegítéséhez kapcsolódik. Minél magasabb a célhőfok,
          annál több energiát igényel a program, különösen akkor, ha nagyobb töltettel vagy hosszabb ciklussal
          mosol. Emiatt a 20–30 fokos programok sok esetben alacsonyabb energiaigénnyel futnak, mint a 40 fokos vagy
          annál melegebb alternatívák.
        </p>
        <p>
          Fontos ugyanakkor árnyaltan fogalmazni: a valós fogyasztás mindig gép- és programfüggő. Számít az adott
          készülék energiahatékonysága, a dob töltöttsége, a kiválasztott üzemmód és az is, mennyire hosszú a ciklus.
          Ezért érdemes becslési szemléletben gondolkodni, nem pedig univerzális, minden gépre érvényes fix számokban.
        </p>
        <p>
          A gyakorlati előny mégis egyértelmű: ha a mindennapi, nem erősen szennyezett ruháknál biztonsággal működik
          az alacsonyabb hőfok, akkor a heti rutinban jól érzékelhető költségkülönbség gyűlhet össze. Ez az oka annak,
          hogy az energiatakarékos mosás ma már nem kompromisszumos kísérlet, hanem tudatos, prémium háztartási
          stratégia.
        </p>

        <h2>Mikor éri meg 40 helyett 20 fokon mosni? A részletes lépésekért nézd meg, <Link href="/hogyan-mossunk-20-fokon">hogyan moss hatékonyan 20 fokon</Link>.</h2>
        <p>
          Sok háztartásban igen, de nem automatikusan minden helyzetben. A hétköznapi, enyhén vagy közepesen
          szennyezett ruháknál a 20 fok jó választás lehet, ha a teljes mosási folyamat megfelelően van felépítve.
          Ilyenkor a programidő, az adagolás, a dob töltöttsége és a használt mosási megoldás együtt adja a stabil
          eredményt.
        </p>
        <p>
          Az Aquadrop Expert Pro belső oldódási tesztjei ebben fontos kapaszkodót adnak. 30 °C-os vízben az összes
          összetevő maradékmentes feloldódása körülbelül 4,5 perc, 20 °C-on körülbelül 8 perc, közel jéghideg,
          4 °C-os vízben pedig körülbelül 12 perc volt. A számokból jól látszik, hogy alacsonyabb hőfokon is
          megbízható oldódás érhető el, ha elegendő idő áll rendelkezésre.
        </p>
        <p>
          Emiatt szakmai szempontból az a jó gyakorlat, hogy legalább 20 °C-os és legalább 18 perces programot
          választasz. Ilyen feltételek mellett biztosítható, hogy az Aquadrop Expert Pro kapszula ne hagyjon nyomot a
          ruhán, és kiszámítható, kényelmes használatot támogasson.
        </p>

        <h2>Számold ki a saját mosási költségedet és megtakarításodat</h2>
        <p>
          Az alábbi kalkulátor nem hivatalos mérőműszer, hanem átlátható összehasonlító modell. Két tényezőt vesz
          figyelembe: a mosógép alapműködésének energiaigényét és a hőfokfüggő melegítési komponenst. A programhossz
          hatását nem teljesen lineárisan számolja, így reálisabb becslést ad különböző ciklusidők mellett.
        </p>
        <p>
          A modell kalibrációja úgy készült, hogy modern, energiacímkés gépnél a 40 °C / 180 perces tartományban
          körülbelül 0,44 kWh/ciklus körüli becslést adjon. A rövidebb, hidegebb programok ehhez képest alacsonyabb,
          a magasabb hőfokok pedig érzékelhetően magasabb költséget mutatnak.
        </p>
        <p>
          Konkrét példa: évi 220 mosásnál a 40 °C-ról 30 °C-ra váltás már látható megtakarítást adhat. 40 °C-ról 20
          °C-ra váltva a különbség tovább nőhet, ezért a havi költségtervezésben is kézzel fogható lehet az eltérés.
        </p>

        <EnergySavingsCalculator />

<p>
          A megtakarítás háztartásonként eltérhet, ezért érdemes saját mosási szokásokkal is kipróbálni a kalkulátort. Add meg, milyen gyakran mosol, milyen programot használsz, és nézd meg, mekkora különbséget jelenthet az alacsonyabb hőfok.
        </p>
        <p>
          <Link href="https://www.aquadrop.hu/mosasi-koltseg-kalkulator">Megnyitom külön oldalon a mosási költség kalkulátort</Link>
        </p>


        <h2>Mikor nem a 20 fokos mosás a jó választás? Kezdd a <Link href="/mosokapszula-hasznalata">mosókapszula helyes használata</Link> alapjaival.</h2>
        <ul>
          <li>
            <strong>Válassz megfelelő programhosszt:</strong> alacsony hőfokon különösen fontos az idő, ezért a
            legalább 20 °C-os, legalább 18 perces program legyen az alap.
          </li>
          <li>
            <strong>Helyesen helyezd el a kapszulát:</strong> közvetlenül a dobba, lehetőleg a ruhák alá, hogy a
            program elején egyenletesen érje víz.
          </li>
          <li>
            <strong>Kerüld a túlzsúfolt dobot:</strong> ha a textíliák nem tudnak mozogni, romolhat a tisztítóhatás,
            és az oldódás sem lesz ideális; ennek okait itt részletezzük: <Link href="/mosokapszula-nem-oldodik-fel">miért nem oldódik fel a mosókapszula</Link>.
          </li>
          <li>
            <strong>Illeszd a megoldást a szennyezettséghez:</strong> hétköznapi ruháknál gyakran elég az alacsony
            hőfok, erősebb foltoknál célzott előkezelésre vagy más programra lehet szükség.
          </li>
          <li>
            <strong>Kövesd a ruhacímkét és a készülék útmutatóját:</strong> ez a legbiztosabb alap ahhoz, hogy a
            textília tartós maradjon, a mosás pedig kiszámítható legyen.
          </li>
        </ul>

        <h2>Mit ad hozzá ehhez az Aquadrop Expert Pro?</h2>
        <p>
          Az Aquadrop Expert Pro abban erős, hogy a kényelmes használatot és az alacsony hőfokú rutinok elvárásait
          egyszerre támogatja. A 4 kamrás prémium formula különböző funkciókat hangol össze, így a mindennapi mosásban
          nem több külön termékkel kell tervezni, hanem egy jól felépített rendszerrel.
        </p>
        <p>
          A koncentrált, mélytisztító összetevők mellett specifikus enzimekkel támogatott foltkezelés dolgozik,
          miközben a textilöblítő hatású komponensek és a színvédő, ragyogást támogató elemek a ruhák összképét is
          segítik megőrizni. Ez különösen akkor értékes, ha gyakran mosol alacsonyabb hőfokon, és fontos számodra a
          kiszámítható eredmény.
        </p>
        <p>
          A fent bemutatott oldódási adatokkal együtt ez azt jelenti, hogy megfelelő használat mellett a 20 fok közeli
          mosás nem szükségmegoldás, hanem tudatos, jól működő választás lehet. A kulcs itt is ugyanaz: legalább
          20 °C-os, legalább 18 perces program, helyes kapszulaelhelyezés és a dob ésszerű terhelése.
        </p>

        <h2>Gyakori kérdések a 20 fokos mosás megtakarításáról</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <section className="rounded-2xl border border-cyan-100 bg-cyan-50/45 px-5 pb-5 pt-1 md:px-6 md:pb-6 md:pt-4" key={item.question}>
              <h3 className="mt-0 text-lg md:text-xl">{item.question}</h3>
              <p className="mt-3 text-slate-700">{item.answer}</p>
            </section>
          ))}
        </div>

      </ArticleLayout>
    </>
  );
}
