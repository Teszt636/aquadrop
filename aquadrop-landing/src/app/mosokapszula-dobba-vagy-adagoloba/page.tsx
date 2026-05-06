import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import { RelatedGuides } from '@/components/RelatedGuides';
import { ButtonLink } from '@/components/ui';

const articleTitle = 'Mosókapszula dobba vagy adagolóba? Így használd helyesen';
const h1Title = 'Mosókapszula dobba vagy adagolóba? Így használd helyesen';
const articleDescription =
  'Gyakorlati útmutató arról, hova kell tenni a mosókapszulát, miért nem az adagolófiókba való, és hogyan előzheted meg a maradványokat.';
const articleUrl = 'https://www.aquadrop.hu/mosokapszula-dobba-vagy-adagoloba';
const publishedDate = '2026-05-06';
const modifiedDate = '2026-05-06';
const heroImageUrl = 'https://www.aquadrop.hu/mosokapszula-nem-oldodik-fel-megoldas-aquadrop.webp';
const heroImageWidth = 1536;
const heroImageHeight = 1024;
const heroImageAlt = 'Mosókapszula helyes elhelyezése a mosógép dobjában, ruhák betöltése előtt';
const heroImageCaption = 'Mosókapszula helyes elhelyezése a mosógép dobjában';

const faqItems = [
  {
    question: 'A mosókapszula dobba vagy adagolóba való?',
    answer:
      'A mosókapszula a mosógép dobjába való, nem az adagolófiókba. A legjobb, ha a dob aljára kerül, még a ruhák betöltése előtt.',
  },
  {
    question: 'Miért nem ajánlott az adagolófiókba tenni a mosókapszulát?',
    answer:
      'Az adagolófiókban a kapszula nem mindig kap elég vizet és mozgást a megfelelő oldódáshoz. Ez maradványt vagy gyengébb mosási eredményt okozhat.',
  },
  {
    question: 'Mi történik, ha a kapszula a ruhák tetejére kerül?',
    answer:
      'Ha a kapszula a ruhák tetején marad, később érheti víz, és könnyebben beragadhat a textíliák közé. Ez növelheti az oldódási hiba esélyét.',
  },
  {
    question: 'Először a kapszulát vagy a ruhákat kell betenni?',
    answer:
      'Először a kapszulát tedd a dob aljára, utána jöhetnek a ruhák. Így a kapszula hamarabb kerül kapcsolatba vízzel.',
  },
  {
    question: '20 fokon is működik ez az elhelyezés?',
    answer:
      'Igen, alacsony hőfokon is ez a helyes sorrend. Ilyenkor különösen fontos a megfelelő programhossz és az, hogy a dob ne legyen túltöltve.',
  },
] as const;

export const metadata: Metadata = {
  title: 'Mosókapszula dobba vagy adagolóba? Így használd helyesen',
  description:
    'Mosókapszula dobba vagy adagolóba kerüljön? Megmutatjuk, hova tedd a kapszulát, miért fontos a sorrend, és hogyan kerülheted el az oldódási hibákat.',
  keywords: [
    'mosókapszula dobba vagy adagolóba',
    'hova kell tenni a mosókapszulát',
    'mosókapszula adagolófiók',
    'mosókapszula dobba',
  ],
  alternates: {
    canonical: articleUrl,
  },
  openGraph: {
    title: 'Mosókapszula dobba vagy adagolóba? Ezt sokan rosszul tudják',
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
    title: 'Mosókapszula dobba vagy adagolóba? Így használd helyesen',
    description: articleDescription,
    images: [heroImageUrl],
  },
};

export default function MosokapszulaDobbaVagyAdagolobaPage() {
  const blogPostingStructuredData = {
    '@type': 'BlogPosting',
    headline: articleTitle,
    description: articleDescription,
    image: {
      '@type': 'ImageObject',
      url: heroImageUrl,
      width: heroImageWidth,
      height: heroImageHeight,
    },
    author: {
      '@type': 'Organization',
      name: 'Aquadrop',
      url: 'https://www.aquadrop.hu/',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Aquadrop',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />

      <ArticleLayout
        slug="mosokapszula-dobba-vagy-adagoloba"
        category="Mosási útmutató"
        readingTime="kb. 7 perc olvasás"
        title={h1Title}
        intro={articleDescription}
        cta={
          <div className="rounded-[28px] border border-cyan-100/80 bg-gradient-to-br from-white via-cyan-50/80 to-teal-50/80 p-7 shadow-[0_22px_65px_rgba(15,23,42,0.1)] md:p-10">
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl leading-tight md:text-3xl">Legyen egyszerűbb a kapszulás mosás</h2>
              <p>
                Az Aquadrop Expert Pro használatánál a legfontosabb alap ugyanaz: kapszula a dob aljára, ruhák utána,
                majd a ruhához illő program.
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
            src="/mosokapszula-nem-oldodik-fel-megoldas-aquadrop.webp"
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
            A mosókapszulát a mosógép dobjába kell tenni, nem az adagolófiókba. A legjobb, ha a kapszula kerül legalulra,
            még a ruhák betöltése előtt, mert így hamarabb éri víz és könnyebben feloldódik. Az adagolófiókban a kapszula
            nem mindig kap elegendő vízmozgást, ezért oldódási hiba vagy maradvány alakulhat ki.
          </p>
          <ul className="mt-4 space-y-2">
            <li>A kapszula mindig a dob aljára kerüljön.</li>
            <li>Ne tedd az adagolófiókba.</li>
            <li>Először a kapszula, utána a ruhák.</li>
          </ul>
        </div>

        <h2>Mosókapszula dobba vagy adagolóba kerüljön?</h2>
        <p>
          A rövid válasz: a mosókapszula a dobba való. Nem az adagolófiókba, nem a ruhák tetejére, és nem a mosógép ajtaja
          mellé. A kapszula úgy működik a legbiztosabban, ha a program elején víz és mozgás éri, ezért érdemes már az
          üres dob aljára tenni.
        </p>
        <p>
          Ha az alapokat szeretnéd egyben látni, a <Link href="/mosokapszula-hasznalata">mosókapszula használata</Link>
          cikkben lépésről lépésre végigvettük a teljes rutint. Ez az útmutató most csak a leggyakoribb kérdésre fókuszál:
          hova kerüljön a kapszula, hogy jól oldódjon.
        </p>

        <h2>Miért nem jó az adagolófiók mosókapszulához?</h2>
        <p>
          Az adagolófiókot elsősorban folyékony vagy por állagú mosószerekhez tervezték. A kapszula ezzel szemben egy
          előre adagolt, vízben oldódó burkolatú egység. Ha az adagolófiókban marad, nem biztos, hogy elég víz és mozgás
          éri ahhoz, hogy időben és teljesen feloldódjon.
        </p>
        <p>
          Ez gyengébb mosási eredményt, maradványt vagy kellemetlen újramosási helyzetet okozhat. Ha már találkoztál
          ilyesmivel, érdemes elolvasni a <Link href="/mosokapszula-nem-oldodik-fel">mosókapszula nem oldódik fel</Link>
          útmutatót is.
        </p>

        <h2>Miért kell először a kapszulát betenni?</h2>
        <p>
          A sorrend azért fontos, mert a dob alján lévő kapszula hamarabb kerül kapcsolatba vízzel. Ha először a ruhák
          mennek be, és a kapszula csak a tetejükre kerül, előfordulhat, hogy a program elején nem kap elég vízmozgást.
          Ez különösen nagyobb vagy sűrűbb töltetnél okozhat problémát.
        </p>
        <p>
          A jó rutin néhány másodperc: kapszula az üres dob aljára, ruhák rá, ajtó becsuk, program indít. Ennyi elég
          ahhoz, hogy sok oldódási hibát megelőzz.
        </p>

        <h2>Mi történik, ha a kapszula a ruhák tetejére kerül?</h2>
        <p>
          Nem biztos, hogy minden alkalommal gond lesz belőle, de nagyobb a kockázat. A kapszula később érhet vízhez,
          beragadhat egy textilréteg közé, vagy nem oszlik el elég korán a mosásban. Ilyenkor a mosóerő késve indul, a
          burkolat pedig könnyebben hagyhat maradványt.
        </p>
        <p>
          Ezért nem érdemes a kapszulát utólag a töltet tetejére dobni. A helyes elhelyezés nem bonyolult, de sokat számít
          a kiszámítható eredményben.
        </p>

        <h2>Hogyan előzheted meg az oldódási hibákat?</h2>
        <p>
          A legfontosabb a dob aljára helyezés, de nem ez az egyetlen szempont. Ne tömd tele a gépet, válassz a ruhákhoz
          illő programot, és kerüld a túl rövid ciklusokat, ha nagyobb vagy szennyezettebb töltetet mosol. A kapszulát
          száraz kézzel kezeld, és tartsd visszazárt, száraz csomagolásban.
        </p>
        <p>
          Az adagolás is számít: a <Link href="/mosokapszula-adagolas">mosókapszula adagolás</Link> cikkben külön
          összefoglaltuk, mikor elég 1 kapszula, és mikor lehet indokolt több mosóerő.
        </p>

        <h2>Számít a programhossz és a vízmozgás?</h2>
        <p>
          Igen. A kapszulának időre, vízre és mozgásra van szüksége. Egy nagyon rövid programnál, főleg hidegebb víz és
          zsúfolt dob mellett, kisebb a hibahatár. Ez nem azt jelenti, hogy alacsony hőfokon ne lehetne jól mosni, hanem
          azt, hogy a körülményeknek együtt kell működniük.
        </p>
        <p>
          Ha a ruhák szabadon mozognak, a kapszula alulról indul, és a program nem extrém rövid, az oldódás esélyei sokkal
          jobbak.
        </p>

        <h2>Használható így a mosókapszula 20-30°C-on is?</h2>
        <p>
          Igen, a helyes sorrend alacsony hőfokon is ugyanaz: kapszula a dob aljára, ruhák utána. Ilyenkor különösen fontos,
          hogy ne legyen túltöltve a dob, és a program elég időt adjon a vízmozgásnak. A <Link href="/hogyan-mossunk-20-fokon">20 fokos mosás</Link>
          cikk segít abban, hogyan hangold össze a hőfokot és a programválasztást.
        </p>

        <h2>Milyen mosókapszulát érdemes választani?</h2>
        <p>
          Olyat, amelynél a használati logika egyszerű, az adagolás egyértelmű, és a márka nem bonyolítja túl a napi rutint.
          Az Aquadrop Expert Pro természetes választás lehet, ha kényelmes, modern kapszulás megoldást keresel a mindennapi
          mosáshoz. A jó eredményhez azonban itt is fontos a helyes elhelyezés és a tudatos programválasztás.
        </p>

        <RelatedGuides
          title="Kapcsolódó útmutatók a mosókapszula elhelyezéséhez"
          intro="Az elhelyezés, az adagolás és az alacsony hőfokú rutin együtt ad stabil mosási eredményt."
          items={[
            {
              label: 'Használat',
              title: 'Mosókapszula használata helyesen',
              description: 'Teljes alapútmutató a kapszula elhelyezéséhez, adagolásához és biztonságos használatához.',
              href: '/mosokapszula-hasznalata',
            },
            {
              label: 'Adagolás',
              title: 'Mosókapszula adagolás: hány kapszula kell?',
              description: 'Tudd meg, mikor elég egy kapszula, és mikor lehet szükség több mosóerőre.',
              href: '/mosokapszula-adagolas',
            },
            {
              label: 'Oldódási hiba',
              title: 'Miért nem oldódik fel a mosókapszula?',
              description: 'Gyakori okok és megoldások, ha maradvány marad a ruhán vagy a dobban.',
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

        <h2>Gyakori kérdések a mosókapszula elhelyezéséről</h2>
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
