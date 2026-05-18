import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { ArticleSignupCta } from '@/components/articles/ArticleSignupCta';
import { ArticleLayout } from '@/components/article/ArticleLayout';
import { JsonLd } from '@/components/JsonLd';
import { RelatedGuides } from '@/components/RelatedGuides';
import { ButtonLink } from '@/components/ui';

const articleTitle = 'Mosókapszula adagolás: hány kapszula kell egy mosáshoz?';
const h1Title = 'Mosókapszula adagolás: hány kapszula kell egy mosáshoz?';
const articleDescription =
  'Gyakorlati útmutató a mosókapszula adagolásához: mikor elég egy kapszula, mikor lehet szükség többre, és milyen hibákat érdemes elkerülni.';
const articleUrl = 'https://www.aquadrop.hu/mosokapszula-adagolas';
const publishedDate = '2026-05-06';
const modifiedDate = '2026-05-18';
const heroImageUrl = 'https://www.aquadrop.hu/mosokapszula-hasznalata.webp';
const heroImageWidth = 1731;
const heroImageHeight = 909;
const heroImageAlt = 'Mosókapszula adagolása Aquadrop Expert Pro kapszulával mindennapi mosáshoz';
const heroImageCaption = 'Mosókapszula adagolása Aquadrop Expert Pro kapszulával';

const faqItems = [
  {
    question: 'Hány mosókapszula kell egy mosáshoz?',
    answer:
      'Egy átlagos mosáshoz általában 1 mosókapszula elegendő. Nagyobb töltetnél, erősebb szennyeződésnél vagy kemény víznél indokolt lehet eltérő adagolás.',
  },
  {
    question: 'Lehet túl sok mosókapszulát használni?',
    answer:
      'Igen, a túl sok kapszula pazarló lehet, és nem feltétlenül ad jobb mosási eredményt. Mindig a ruhamennyiséget, a szennyezettséget és a gyártói ajánlást érdemes figyelembe venni.',
  },
  {
    question: 'Mikor kell több mosókapszula?',
    answer:
      'Nagyobb ruhatöltetnél, erősen szennyezett textíliáknál vagy kemény víz esetén lehet szükség több mosóerőre. Átlagos hétköznapi mosásnál általában 1 kapszula is elég.',
  },
  {
    question: 'Hova kell tenni a mosókapszulát?',
    answer:
      'A kapszulát közvetlenül a mosógép dobjának aljára kell tenni, még a ruhák betöltése előtt. Az adagolófiók nem ideális a mosókapszulához.',
  },
  {
    question: 'A nagyobb dobhoz mindig több kapszula kell?',
    answer:
      'Nem feltétlenül. A döntésnél nemcsak a dob mérete, hanem a tényleges ruhamennyiség, a szennyezettség és a program típusa is számít.',
  },
] as const;

export const metadata: Metadata = {
  title: 'Mosókapszula adagolás: hány kapszula kell egy mosáshoz?',
  description:
    'Mosókapszula adagolás egyszerűen: mikor elég 1 kapszula, mikor kell több, és mire figyelj nagyobb töltetnél vagy erősebb szennyeződésnél?',
  keywords: [
    'mosókapszula adagolás',
    'hány mosókapszula kell',
    'mosókapszula mennyiség',
    'mosókapszula használata',
  ],
  alternates: {
    canonical: articleUrl,
  },
  openGraph: {
    title: 'Sokan rosszul adagolják a mosókapszulát - te jól használod?',
    description: articleDescription,
    url: articleUrl,
    siteName: 'Aquadrop Expert Pro',
    locale: 'hu_HU',
    type: 'article',
    publishedTime: `${publishedDate}T08:00:00.000Z`,
    modifiedTime: `${modifiedDate}T08:00:00.000Z`,
    images: [
      {
        url: heroImageUrl,
        width: 1200,
        height: 630,
        alt: heroImageAlt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mosókapszula adagolás: hány kapszula kell egy mosáshoz?',
    description: articleDescription,
    images: [heroImageUrl],
  },
};

export default function MosokapszulaAdagolasPage() {
  const blogPostingStructuredData = {
    '@type': 'BlogPosting',
    headline: articleTitle,
    description: articleDescription,
    url: articleUrl,
    inLanguage: 'hu-HU',
    image: {
      '@type': 'ImageObject',
      url: heroImageUrl,
      width: heroImageWidth,
      height: heroImageHeight,
    },
    author: {
      '@type': 'Organization',
      name: 'Aquadrop Expert Pro',
      url: 'https://www.aquadrop.hu/',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Aquadrop Expert Pro',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.aquadrop.hu/logo.png',
        width: 1182,
        height: 1182,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    datePublished: `${publishedDate}T08:00:00.000Z`,
    dateModified: `${modifiedDate}T08:00:00.000Z`,
  };

  const breadcrumbStructuredData = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Főoldal', item: 'https://www.aquadrop.hu/' },
      { '@type': 'ListItem', position: 2, name: 'Mosási tudástár', item: 'https://www.aquadrop.hu/#tudastar' },
      { '@type': 'ListItem', position: 3, name: articleTitle, item: articleUrl },
    ],
  };

  return (
    <>
      <JsonLd data={{
            '@context': 'https://schema.org',
            '@graph': [
              blogPostingStructuredData,
              {
                '@type': 'FAQPage',
                mainEntity: faqItems.map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: { '@type': 'Answer', text: item.answer },
                })),
              },
              breadcrumbStructuredData,
            ],
          }} />

      <ArticleLayout
        slug="mosokapszula-adagolas"
        category="Mosási útmutató"
        readingTime="kb. 7 perc olvasás"
        title={h1Title}
        intro={articleDescription}
        cta={
          <div className="rounded-[28px] border border-cyan-100/80 bg-gradient-to-br from-white via-cyan-50/80 to-teal-50/80 p-7 shadow-[0_22px_65px_rgba(15,23,42,0.1)] md:p-10">
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl leading-tight md:text-3xl">Egyszerű adagolás a mindennapi mosáshoz</h2>
              <p>
                Az Aquadrop Expert Pro kapszula a hétköznapi rutinban is könnyen használható: nincs méricskélés,
                csak tudatos töltet, megfelelő program és következetes elhelyezés.
              </p>
              <ButtonLink className="mt-2" href="/#gift-form">
                Megnézem az ajánlatot
              </ButtonLink>
            </div>
          </div>
        }
      >
        <figure className="overflow-hidden rounded-2xl border border-cyan-100 bg-white/80 shadow-sm">
          <Image
            src="/mosokapszula-hasznalata.webp"
            alt={heroImageAlt}
            width={1600}
            height={900}
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
            title={heroImageCaption}
          />
          <figcaption className="px-4 py-3 text-sm text-slate-600 md:px-5">{heroImageCaption}</figcaption>
        </figure>

        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5 md:p-6">
          <p className="mt-3">
            A mosókapszula adagolása akkor jó, ha a ruhamennyiséghez, a szennyezettséghez és a vízkeménységhez
            igazodik. Egy átlagos mosáshoz általában 1 kapszula elegendő, de nagyobb töltetnél, erősen szennyezett
            ruháknál vagy kemény víznél indokolt lehet eltérő adagolás. A kapszulát mindig a dob aljára tedd, még a
            ruhák betöltése előtt.
          </p>
          <ul className="mt-4 space-y-2">
            <li>Átlagos mosáshoz általában 1 kapszula elegendő.</li>
            <li>Nagyobb töltetnél vagy erős szennyeződésnél több mosóerőre lehet szükség.</li>
            <li>A túladagolás nem feltétlenül ad jobb eredményt, viszont pazarló lehet.</li>
          </ul>
        </div>

        <h2>Mit jelent a helyes mosókapszula adagolás?</h2>
        <p>
          A helyes adagolás nem csak arról szól, hogy hány kapszulát teszel a gépbe. Ugyanilyen fontos, hogy mennyi ruha
          kerül a dobba, milyen programot választasz, mennyire szennyezett a töltet, és a kapszula megfelelő helyre
          kerül-e. Ha ezek együtt rendben vannak, a kapszulás mosás kényelmes és kiszámítható tud lenni.
        </p>
        <p>
          A részletes alaplépéseket a <Link href="/mosokapszula-hasznalata">mosókapszula használata</Link> útmutatóban is
          összefoglaltuk. Itt most kifejezetten az adagolás logikájára figyelünk: mikor elég az alapmennyiség, és mikor
          érdemes óvatosan eltérni tőle.
        </p>

        <h2>Hány mosókapszula kell egy átlagos mosáshoz?</h2>
        <p>
          Átlagos hétköznapi mosásnál általában 1 kapszula elegendő. Ez a legtöbb vegyes ruhatöltetnél jó kiindulási
          pont, főleg akkor, ha a dob nincs túltöltve, a ruhák nem extrém szennyezettek, és normál hosszúságú programot
          választasz. A kapszula előnye éppen az, hogy nem kell minden alkalommal külön méricskélni.
        </p>
        <p>
          A túl kevés mosóerő fakóbb eredményt adhat, a túl sok viszont nem feltétlenül tisztít jobban. A cél a jó
          egyensúly: elég hatóanyag a tisztításhoz, de felesleges pazarlás nélkül.
        </p>

        <h2>Mikor lehet szükség több mosókapszulára?</h2>
        <p>
          Több mosóerő akkor lehet indokolt, ha a ruhák erősen szennyezettek, a töltet nagyobb az átlagosnál, vagy a víz
          kifejezetten kemény. Ilyenkor sem automatikus szabály, hogy mindig több kapszula kell; előbb nézd meg, nem a
          túlzsúfolt dob vagy a túl rövid program okozza-e a gyengébb eredményt.
        </p>
        <p>
          Nagyobb családi adagoknál különösen fontos, hogy maradjon hely a dobban. Ha a ruhák egy tömör tömegként
          mozognak, a víz és a mosószer sem tud egyenletesen dolgozni. Ilyenkor nem csak az adagolás, hanem a töltet
          csökkentése is megoldás lehet.
        </p>

        <h2>Miért nem érdemes túladagolni a mosókapszulát?</h2>
        <p>
          A túladagolás gyakori reflex: ha nem lett elég jó a mosás, legközelebb többet használunk. Ez azonban nem mindig
          vezet jobb eredményhez. Ha a gondot a rossz elhelyezés, a túl rövid program vagy a túltöltött dob okozza, akkor
          a több kapszula csak drágábbá teszi a mosást, de nem oldja meg a gyökérokot.
        </p>
        <p>
          Ha maradványt tapasztalsz, előbb nézd meg, <Link href="/mosokapszula-nem-oldodik-fel">miért nem oldódik fel a mosókapszula</Link>.
          Sokszor nem adagolási, hanem oldódási vagy programválasztási kérdésről van szó.
        </p>

        <h2>Számít a dob mérete és a ruhamennyiség?</h2>
        <p>
          Igen, de nem önmagában a dob mérete dönt. Egy nagyobb dobban is lehet kevés ruha, és egy kisebb dob is lehet
          túlzsúfolt. A tényleges ruhamennyiség számít: tudnak-e mozogni a textilek, átjárja-e őket a víz, és a kapszula
          eljut-e a program elején a megfelelő vízmozgáshoz.
        </p>
        <p>
          Jó gyakorlati jel, ha a ruhák nincsenek erősen lenyomva, és kézzel is érezhetően marad tér a dob tetején. Ez
          segíti az oldódást, az öblítést és az egyenletes mosási eredményt.
        </p>

        <h2>Kemény víznél változhat az adagolás?</h2>
        <p>
          Kemény víznél a mosás általában nagyobb kihívás, mert a víz összetétele befolyásolhatja a tisztítás érzetét és
          a mosószer munkáját. Ilyenkor érdemes a gyártói ajánlást figyelni, és nem automatikusan emelni az adagot.
          Először a programhossz, a töltet és az elhelyezés legyen rendben.
        </p>
        <p>
          Ha alacsony hőfokon mosol, a <Link href="/hogyan-mossunk-20-fokon">hogyan moss hatékonyan 20 fokon</Link> cikk
          segít összehangolni a hőfokot, a programot és a kapszula használatát.
        </p>

        <h2>Hova kell tenni a kapszulát adagolás után?</h2>
        <p>
          A kapszula helye a dob alja, még a ruhák betöltése előtt. Ez azért fontos, mert így hamarabb éri víz, és
          kisebb eséllyel marad a ruhák tetején vagy egy szárazabb textilcsomóban. Az adagolófiók nem ideális, mert ott a
          kapszula nem mindig kap elegendő vízmozgást.
        </p>
        <p>
          A sorrend egyszerű: kapszula a dobba, ruhák utána, majd a program indítása. Ez a kis rutin az egyik legjobb
          módja annak, hogy az adagolás ne csak mennyiségben, hanem használatban is helyes legyen.
        </p>

        <h2>Milyen mosókapszulát érdemes választani a mindennapi mosáshoz?</h2>
        <p>
          A jó mosókapszula a hétköznapi rutinban ad biztonságot: könnyű használni, egyértelmű az adagolása, és nem kér
          bonyolult előkészületet. Az Aquadrop Expert Pro ebbe a szemléletbe illeszkedik: a cél nem az agresszív
          túlígéret, hanem a stabil, kényelmes és modern mosási rutin támogatása.
        </p>
        <p>
          Ha a mosásodban az energiahasználat is fontos szempont, az <Link href="/energiatakarekos-mosas">energiatakarékos mosás</Link>
          útmutató segít átlátni, hogyan kapcsolódik össze a hőfok, a programidő, a töltet és a mosószerhasználat.
        </p>

        <RelatedGuides
          title="Kapcsolódó útmutatók a mosókapszula adagolásához"
          intro="Az adagolás mellett az elhelyezés, az oldódás és az alacsony hőfokú mosási rutin is sokat számít."
          items={[
            {
              label: 'Használat',
              title: 'Mosókapszula használata helyesen',
              description: 'Nézd meg, hova kell tenni a kapszulát, és hogyan építs stabil mosási rutint.',
              href: '/mosokapszula-hasznalata',
            },
            {
              label: 'Elhelyezés',
              title: 'Mosókapszula dobba vagy adagolóba?',
              description: 'Tudd meg, miért a dob alja a legbiztosabb hely a kapszulának.',
              href: '/mosokapszula-dobba-vagy-adagoloba',
            },
            {
              label: 'Oldódási hiba',
              title: 'Miért nem oldódik fel a mosókapszula?',
              description: 'A leggyakoribb okok és megoldások, ha maradvány marad a ruhán vagy a dobban.',
              href: '/mosokapszula-nem-oldodik-fel',
            },
            {
              label: '20 fokos kapszula',
              title: 'Mosókapszula 20 fokon',
              description: 'Mikor működik jól alacsony hőfokon, és hogyan előzheted meg az oldódási hibákat?',
              href: '/mosokapszula-20-fokon',
            },
          ]}
        />

        <ArticleSignupCta
          source="article:mosokapszula-adagolas"
          title="Kérsz még praktikus mosókapszula tippeket?"
          description="Iratkozz fel, és küldünk hasznos útmutatókat a mosókapszula használatához, adagolásához és az oldódási hibák megelőzéséhez."
        />

        <h2>Gyakori kérdések a mosókapszula adagolásáról</h2>
        <div className="space-y-6">
          {faqItems.map((item) => (
            <section key={item.question} className="rounded-2xl border border-cyan-100 bg-white/70 p-5">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </section>
          ))}
        </div>
      </ArticleLayout>
    </>
  );
}
