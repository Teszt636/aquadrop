import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import { RelatedGuides } from '@/components/RelatedGuides';
import { ButtonLink } from '@/components/ui';

const articleTitle = '30 fokos vagy 40 fokos mosás: mikor melyiket válaszd?';
const h1Title = '30 fokos vagy 40 fokos mosás: mikor melyiket válaszd?';
const articleDescription =
  'Gyakorlati útmutató a 30 és 40 fokos mosás közötti választáshoz: mikor elég az alacsonyabb hőfok, mikor kell magasabb hőmérséklet, és hogyan kapcsolódik mindez a mosási költségekhez.';
const articleUrl = 'https://www.aquadrop.hu/mosas-30-fokon-vagy-40-fokon';
const publishedDate = '2026-05-06';
const modifiedDate = '2026-05-06';
const heroImageUrl = 'https://www.aquadrop.hu/energiatakarekos-mosas-aquadrop-expert-pro.webp';
const heroImageWidth = 1600;
const heroImageHeight = 900;
const heroImageAlt = '30 fokos és 40 fokos mosás összehasonlítása energiatakarékos mosási rutinhoz';
const heroImageCaption = '30 és 40 fokos mosás tudatos összehasonlítása';

const faqItems = [
  {
    question: 'Mikor elég a 30 fokos mosás?',
    answer:
      'A 30 fokos mosás sok enyhén vagy közepesen szennyezett, mindennapi ruhához elég lehet. Különösen akkor jó választás, ha a ruhacímke alacsonyabb hőfokot javasol, és nem higiéniai mosás a cél.',
  },
  {
    question: 'Mikor jobb a 40 fokos mosás?',
    answer:
      '40 fokos mosás erősebb szennyeződésnél, törölközőknél, ágyneműnél, sportruhánál vagy higiéniai szempontból lehet indokolt, ha a textil címkéje ezt megengedi.',
  },
  {
    question: 'A 30 fokos mosás kevesebb energiát fogyaszt?',
    answer:
      'Általában az alacsonyabb hőfok kevesebb energiafelhasználást jelenthet, mert a mosógépnek kevesebb vizet kell melegítenie. A pontos különbség a géptől, programtól és töltettől is függ.',
  },
  {
    question: 'Tiszták lesznek a ruhák 30 fokon?',
    answer:
      'Sok hétköznapi ruha tiszta lehet 30 fokon, ha nem erősen szennyezett, a dob nincs túltöltve, és megfelelő programot választasz. Makacs foltoknál előkezelés vagy magasabb hőfok lehet szükséges.',
  },
  {
    question: 'Használható mosókapszula 30 fokon?',
    answer:
      'Igen, sok mosókapszula használható 30 fokon, de mindig ellenőrizd a termék útmutatóját. A kapszulát ilyenkor is a dob aljára tedd, még a ruhák betöltése előtt.',
  },
  {
    question: 'Melyik hőfok kíméli jobban a ruhákat?',
    answer:
      'Általában az alacsonyabb hőfok kíméletesebb lehet a színekhez és az anyagokhoz, de a ruhacímke az elsődleges irányadó. Kényes textileknél mindig a címke szerinti programot válaszd.',
  },
] as const;

export const metadata: Metadata = {
  title: '30 fokos vagy 40 fokos mosás: mikor melyiket válaszd?',
  description:
    '30 fokos vagy 40 fokos mosás? Megmutatjuk, mikor elég az alacsonyabb hőfok, mikor indokolt a 40°C, és hogyan spórolhatsz tudatos mosással.',
  keywords: [
    '30 fokos vagy 40 fokos mosás',
    '30 fokos mosás',
    '40 fokos mosás',
    'energiatakarékos mosás',
  ],
  alternates: {
    canonical: articleUrl,
  },
  openGraph: {
    title: '30 vagy 40 fokon moss? Nem mindig az erősebb a jobb',
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
    title: '30 fokos vagy 40 fokos mosás: mikor melyiket válaszd?',
    description: articleDescription,
    images: [heroImageUrl],
  },
};

export default function Mosas30FokonVagy40FokonPage() {
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
        slug="mosas-30-fokon-vagy-40-fokon"
        category="Összehasonlító útmutató"
        readingTime="kb. 7 perc olvasás"
        title={h1Title}
        intro={articleDescription}
        cta={
          <div className="rounded-[28px] border border-cyan-100/80 bg-gradient-to-br from-white via-cyan-50/80 to-teal-50/80 p-7 shadow-[0_22px_65px_rgba(15,23,42,0.1)] md:p-10">
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl leading-tight md:text-3xl">Tudatosabb mosás kevesebb találgatással</h2>
              <p>
                Az Aquadrop Expert Pro kapszulával a mindennapi mosás egyszerűbb döntéssé válhat: megfelelő hőfok,
                átgondolt töltet és kényelmes adagolás egy rutinban.
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
            src="/energiatakarekos-mosas-aquadrop-expert-pro.webp"
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
            A 30 fokos mosás sok hétköznapi, enyhén vagy közepesen szennyezett ruhához elegendő lehet, míg a 40 fokos
            mosás erősebb szennyeződésnél, törölközőknél, ágyneműnél vagy higiéniai okból lehet indokolt. Ha a ruha
            nem nagyon koszos, a 30°C energiatakarékosabb választás lehet, de mindig vedd figyelembe a ruhacímkét és a
            mosási célt.
          </p>
          <ul className="mt-4 space-y-2">
            <li>30°C gyakran elég mindennapi ruhákhoz.</li>
            <li>40°C erősebb szennyeződésnél vagy higiéniai mosásnál lehet jobb.</li>
            <li>Az alacsonyabb hőfok kevesebb energiafelhasználást jelenthet.</li>
          </ul>
        </div>

        <h2>30 fokos vagy 40 fokos mosás: mi a különbség?</h2>
        <p>
          A különbség nem csak 10 fok. A 30 fokos mosás inkább a mindennapi, enyhébb szennyeződésekhez illik, míg a 40
          fokos mosás több helyzetben adhat erősebb tisztítási tartalékot. A jó döntéshez azt érdemes nézni, mit mosol,
          mennyire koszos, és mi a cél: frissítés, folteltávolítás, ruhakímélés vagy higiénia.
        </p>
        <p>
          Ha a fő szempont az alacsonyabb energiafelhasználás, az{' '}
          <Link href="/energiatakarekos-mosas">energiatakarékos mosás</Link> útmutató segít tágabb rendszerben látni a
          hőfok, a programidő és a töltet szerepét.
        </p>

        <h2>Mikor elég a 30 fokos mosás?</h2>
        <p>
          A 30 fokos mosás sok hétköznapi ruhához elég lehet: pólókhoz, ingekhez, nadrágokhoz, vékonyabb textilekhez és
          enyhén vagy közepesen szennyezett darabokhoz. Különösen jó választás lehet akkor, ha a ruhacímke alacsonyabb
          hőfokot javasol, vagy ha a cél inkább frissítés, mint intenzív tisztítás.
        </p>
        <p>
          A 30 fok nem varázsszám, hanem egy kímélőbb beállítás. Akkor működik jól, ha a dob nincs túlzsúfolva, a program
          nem túl rövid, és a mosószer vagy mosókapszula alkalmas a választott körülményekhez.
        </p>

        <h2>Mikor érdemes 40 fokon mosni?</h2>
        <p>
          A 40 fokos mosás akkor lehet jobb, ha a ruhák erősebben szennyezettek, izzadt sportruhákról van szó, vagy a
          textil jellege miatt fontosabb a tisztítási intenzitás. Törölközőknél, ágyneműnél és higiéniai szempontból
          kényesebb helyzetekben gyakran indokolt lehet a magasabb hőfok, ha a címke engedi.
        </p>
        <p>
          Ha korábban automatikusan 40 fokot választottál, érdemes szétválasztani a tölteteket. Nem biztos, hogy minden
          ruha igényli ugyanazt az intenzitást.
        </p>

        <h2>Melyik hőfok kíméli jobban a ruhákat?</h2>
        <p>
          Általában az alacsonyabb hőfok kímélőbb lehet a színekhez, a rostokhoz és az anyagok tapintásához. Ez különösen
          fontos gyakran mosott, sötét vagy kényesebb daraboknál. Ettől még nem minden textilhez ugyanaz az ideális
          beállítás: a ruhacímke mindig elsőbbséget élvez.
        </p>
        <p>
          Ha a ruha kényes, ne a megszokásból indulj ki, hanem a címkéből és a mosási célból. Sokszor a kímélőbb program
          többet ér, mint egy automatikusan magasabb hőfok.
        </p>

        <h2>Melyik kerül kevesebbe energiafogyasztásban?</h2>
        <p>
          A mosógép energiafelhasználásának jelentős része a víz melegítéséhez kapcsolódik, ezért az alacsonyabb hőfok
          általában kedvezőbb lehet. A pontos különbség függ a géptől, a programtól, a töltettől és attól is, milyen
          gyakran mosol.
        </p>
        <p>
          Ha számszerű becslést szeretnél, nézd meg, <Link href="/mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol">mennyit spórolhatsz 20 fokos mosással</Link>,
          vagy próbáld ki a <Link href="/mosasi-koltseg-kalkulator">mosási költség kalkulátor</Link> oldalt saját
          mosási szokásokkal.
        </p>

        <h2>Mosókapszula használata 30–40°C között</h2>
        <p>
          Mosókapszulánál 30 és 40 fok között is fontos a helyes sorrend: kapszula a dob aljára, ruhák utána, majd a
          megfelelő program. A kapszula ne az adagolófiókba kerüljön, mert ott kevésbé kiszámítható az oldódása.
        </p>
        <p>
          A részletes alapokat a <Link href="/mosokapszula-hasznalata">mosókapszula használata</Link> útmutatóban találod.
          Ha kifejezetten alacsonyabb hőfokra váltanál, a <Link href="/mosokapszula-20-fokon">mosókapszula 20 fokon</Link>
          cikk is hasznos lehet.
        </p>

        <h2>Hogyan válassz hőfokot tudatosan?</h2>
        <p>
          A legegyszerűbb döntési sorrend: először nézd meg a ruhacímkét, utána a szennyezettséget, majd a mosási célt.
          Ha a ruha csak frissítésre vár, gyakran elég lehet a 30 fok. Ha erősebb tisztítás, törölköző, ágynemű vagy
          higiéniai cél van, a 40 fok lehet jobb választás.
        </p>
        <p>
          A tudatos mosás nem azt jelenti, hogy mindig a legalacsonyabb hőfokot kell választani. Inkább azt, hogy nem
          mosol minden töltetet ugyanazzal a reflexszel.
        </p>

        <RelatedGuides
          title="Kapcsolódó útmutatók a 30 és 40 fokos mosáshoz"
          intro="A hőfokválasztás a költségekkel, a mosókapszula használatával és az alacsony hőfokú rutinokkal együtt érthető igazán."
          items={[
            {
              label: 'Energiatakarékosság',
              title: 'Energiatakarékos mosás lépésről lépésre',
              description: 'Alacsonyabb hőfok, tudatos programválasztás és kevesebb energiafelhasználás a mindennapokban.',
              href: '/energiatakarekos-mosas',
            },
            {
              label: 'Megtakarítás',
              title: 'Mennyit spórolhatsz 20 fokos mosással?',
              description: 'Nézd meg, mekkora különbséget jelenthet a hőfokváltás a mosási költségekben.',
              href: '/mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol',
            },
            {
              label: 'Kalkulátor',
              title: 'Mosási költség kalkulátor',
              description: 'Add meg saját mosási szokásaidat, és becsüld meg a hőfokok közötti költségkülönbséget.',
              href: '/mosasi-koltseg-kalkulator',
            },
            {
              label: '20 fokos kapszula',
              title: 'Mosókapszula 20 fokon',
              description: 'Mikor működik jól alacsony hőfokon, és hogyan előzheted meg az oldódási hibákat?',
              href: '/mosokapszula-20-fokon',
            },
          ]}
        />

        <h2>Gyakori kérdések a 30 és 40 fokos mosásról</h2>
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
