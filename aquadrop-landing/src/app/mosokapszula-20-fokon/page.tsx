import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { ArticleSignupCta } from '@/components/articles/ArticleSignupCta';
import { ArticleLayout } from '@/components/article/ArticleLayout';
import { RelatedGuides } from '@/components/RelatedGuides';
import { ButtonLink } from '@/components/ui';

const articleTitle = 'Mosókapszula 20 fokon: feloldódik és tisztít rendesen?';
const h1Title = 'Mosókapszula 20 fokon: feloldódik és tisztít rendesen?';
const articleDescription =
  'Gyakorlati útmutató arról, mikor működik jól a mosókapszula 20 fokon, hogyan kell elhelyezni, és milyen programmal kerülhetők el az oldódási hibák.';
const articleUrl = 'https://www.aquadrop.hu/mosokapszula-20-fokon';
const publishedDate = '2026-05-06';
const modifiedDate = '2026-05-06';
const heroImageUrl = 'https://www.aquadrop.hu/20-fokos-mosas.webp';
const heroImageWidth = 1600;
const heroImageHeight = 900;
const heroImageAlt = 'Mosókapszula használata 20 fokos mosásnál alacsony hőfokon';
const heroImageCaption = 'Mosókapszula használata 20 fokos, alacsony hőfokú mosásnál';

const faqItems = [
  {
    question: 'Feloldódik a mosókapszula 20 fokon?',
    answer:
      'Igen, a mosókapszula 20 fokon is feloldódhat, ha alacsony hőfokra alkalmas, a dob nincs túltöltve, és a program nem túl rövid. A kapszula helyes elhelyezése ilyenkor különösen fontos.',
  },
  {
    question: 'Hova kell tenni a mosókapszulát 20 fokos mosásnál?',
    answer:
      'A kapszulát közvetlenül a mosógép dobjának aljára tedd, még a ruhák betöltése előtt. Ne az adagolófiókba kerüljön, mert ott könnyebben maradhat vissza belőle maradvány.',
  },
  {
    question: 'Milyen program kell 20 fokos mosáshoz?',
    answer:
      'Olyan programot válassz, amely elég időt és vízmozgást ad a kapszula oldódásához. A nagyon rövid, gyorsprogramok nagyobb töltetnél vagy hidegebb víznél növelhetik az oldódási hiba esélyét.',
  },
  {
    question: 'Mikor nem ajánlott 20 fokon mosni?',
    answer:
      'Erősen szennyezett ruháknál, higiéniai mosásnál, törölközőknél, ágyneműnél vagy betegség után indokolt lehet magasabb hőfok, ha a ruhacímke és a mosógép programja ezt megengedi.',
  },
  {
    question: 'Miért maradhat kapszulamaradvány a ruhán?',
    answer:
      'Leggyakrabban a túlzsúfolt dob, a rossz elhelyezés, a túl rövid program vagy az okozza, hogy a kapszula későn ér vízhez. Ilyenkor nem feltétlenül a hőfok az egyetlen probléma.',
  },
  {
    question: 'Milyen ruhákhoz jó a 20 fokos mosás?',
    answer:
      'A 20 fokos mosás főleg enyhén vagy közepesen szennyezett, mindennapi ruhákhoz jó választás lehet. Kényesebb textileknél mindig a ruhacímke, erősebb szennyeződésnél pedig a mosási cél döntsön.',
  },
] as const;

export const metadata: Metadata = {
  title: 'Mosókapszula 20 fokon: feloldódik és tisztít rendesen?',
  description:
    'Mosókapszula 20 fokon: mikor működik jól, mire figyelj a programhossznál, és hogyan előzheted meg az oldódási hibákat alacsony hőfokon?',
  keywords: [
    'mosókapszula 20 fokon',
    'mosókapszula alacsony hőfokon',
    'mosókapszula nem oldódik fel',
    '20 fokos mosás',
  ],
  alternates: {
    canonical: articleUrl,
  },
  openGraph: {
    title: 'Mosókapszula 20 fokon? Ezekre figyelj, hogy működjön',
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
    title: 'Mosókapszula 20 fokon: feloldódik és tisztít rendesen?',
    description: articleDescription,
    images: [heroImageUrl],
  },
};

export default function Mosokapszula20FokonPage() {
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
        slug="mosokapszula-20-fokon"
        category="Mosási útmutató"
        readingTime="kb. 7 perc olvasás"
        title={h1Title}
        intro={articleDescription}
        cta={
          <div className="rounded-[28px] border border-cyan-100/80 bg-gradient-to-br from-white via-cyan-50/80 to-teal-50/80 p-7 shadow-[0_22px_65px_rgba(15,23,42,0.1)] md:p-10">
            <div className="max-w-3xl space-y-5">
              <h2 className="text-2xl leading-tight md:text-3xl">Alacsony hőfokon is legyen egyszerű a rutin</h2>
              <p>
                Az Aquadrop Expert Pro kapszula kényelmes választás lehet a mindennapi mosáshoz, ha a kapszula
                elhelyezése, a töltet és a programhossz együtt rendben van.
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
            src="/20-fokos-mosas.webp"
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
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-800">Gyors válasz</p>
          <p className="mt-3">
            A mosókapszula 20 fokon is működhet jól, ha a kapszula alacsony hőfokra alkalmas, a dob nincs túltöltve,
            és a program nem túl rövid. A kapszulát mindig a dob aljára tedd, még a ruhák betöltése előtt, mert így
            hamarabb éri víz és könnyebben feloldódik. Erősen szennyezett ruháknál vagy higiéniai mosásnál magasabb
            hőfok is indokolt lehet.
          </p>
          <ul className="mt-4 space-y-2">
            <li>A kapszula a dob aljára kerüljön, ne az adagolófiókba.</li>
            <li>A túl rövid program növeli az oldódási hiba esélyét.</li>
            <li>20 fokon főleg enyhén vagy közepesen szennyezett ruháknál ideális.</li>
          </ul>
        </div>

        <h2>Működik a mosókapszula 20 fokon?</h2>
        <p>
          Igen, a mosókapszula 20 fokon is működhet, de alacsony hőfokon kevesebb a hibahatár. Ilyenkor nem elég csak
          a fokszámot nézni: számít a program hossza, a dob telítettsége, a kapszula helye és az is, mennyire szennyezett
          a ruha. Ha ezek rendben vannak, a 20 fokos mosás sok hétköznapi töltetnél jó választás lehet.
        </p>
        <p>
          A teljes alacsony hőfokú rutinhoz érdemes átnézni, hogyan moss hatékonyan 20 fokon a{' '}
          <Link href="/hogyan-mossunk-20-fokon">hogyan moss hatékonyan 20 fokon</Link> útmutatóban. Ez segít összehangolni
          a hőfokot, a programot és a ruhamennyiséget.
        </p>

        <h2>Feloldódik a mosókapszula alacsony hőfokon?</h2>
        <p>
          A kapszula oldódása alacsony hőfokon is lehetséges, ha elegendő víz és mozgás éri. A gond sokszor nem önmagában
          a 20 fok, hanem az, hogy a kapszula egy szárazabb ruhacsomó közé szorul, a program túl rövid, vagy a dob annyira
          tele van, hogy nincs hely az egyenletes vízmozgásnak.
        </p>
        <p>
          Ha már tapasztaltál maradványt a ruhán vagy a dobban, olvasd el a{' '}
          <Link href="/mosokapszula-nem-oldodik-fel">mosókapszula nem oldódik fel</Link> útmutatót is. Ott a leggyakoribb
          okokat és gyors javításokat külön vettük végig.
        </p>

        <h2>Hova kell tenni a kapszulát 20 fokos mosásnál?</h2>
        <p>
          A kapszula helye a dob alja, még a ruhák betöltése előtt. Ez az egyik legfontosabb apróság, mert így a kapszula
          már a program elején vízzel találkozik. Ha a ruhák tetejére kerül, később érheti víz, és könnyebben maradhat
          egy sűrűbb textilrétegben.
        </p>
        <p>
          A részletes elhelyezési szabályokat a <Link href="/mosokapszula-dobba-vagy-adagoloba">mosókapszula dobba vagy adagolóba</Link>
          cikk foglalja össze. 20 fokon különösen érdemes ezt a sorrendet tartani: kapszula a dobba, ruhák utána, program
          indít.
        </p>

        <h2>Milyen programot válassz 20 fokos mosáshoz?</h2>
        <p>
          Olyan programot válassz, amely nem csak hideg vagy alacsony hőfokú, hanem elég időt is ad a mosásnak. A nagyon
          rövid gyorsprogram kényelmesnek tűnik, de nagyobb töltetnél vagy sűrűbb anyagoknál növelheti az oldódási hiba
          esélyét. A programhossz itt a tisztítóhatás és az oldódás egyik kulcsa.
        </p>
        <p>
          A kapszula mennyisége sem mindegy: átlagos töltethez általában egy kapszula elég, de a{' '}
          <Link href="/mosokapszula-adagolas">mosókapszula adagolás</Link> cikk segít eldönteni, mikor lehet szükség
          eltérő megközelítésre.
        </p>

        <h2>Mikor nem elég a 20 fokos mosás?</h2>
        <p>
          Nem minden ruha és nem minden mosási cél való 20 fokra. Erősen szennyezett munkaruhánál, zsíros foltoknál,
          törölközőknél, ágyneműnél vagy higiéniai okból gyakran indokolt lehet magasabb hőfok. Betegség után vagy
          kifejezetten fertőtlenítő célú mosásnál sem az energiatakarékosság az első szempont.
        </p>
        <p>
          A döntésnél mindig a ruhacímke, a szennyezettség és a mosási cél legyen az alap. A 20 fok nem univerzális
          szabály, hanem egy hasznos lehetőség a megfelelő helyzetekben.
        </p>

        <h2>Hogyan előzheted meg az oldódási hibákat?</h2>
        <p>
          A legjobb megelőzés egyszerű: ne tömd túl a dobot, tedd a kapszulát alulra, válassz elég hosszú programot, és
          ne használj feleslegesen nagy töltetet gyorsprogramon. Ha a ruhák szabadon mozognak, a víz jobban átjárja őket,
          a kapszula pedig könnyebben eloszlik a mosás elején.
        </p>
        <p>
          Ha a cél a kisebb energiafelhasználás, az <Link href="/energiatakarekos-mosas">energiatakarékos mosás</Link>
          útmutatóban találsz további gyakorlati szempontokat a hőfok, a programidő és a mosási rutin összehangolásához.
        </p>

        <h2>Milyen mosókapszula működik jól 20 fokon?</h2>
        <p>
          Alacsony hőfokon olyan kapszulát érdemes választani, amelynek használati útmutatója támogatja az alacsonyabb
          hőmérsékletű mosást, és amelynél a gyártó egyértelműen jelzi a megfelelő körülményeket. A kapszula önmagában
          nem pótolja a jó programválasztást, de egy stabil, modern formula sokat segíthet a kiszámítható napi rutinban.
        </p>
        <p>
          A gyakorlatban a legjobb eredményt a jó termék, a helyes elhelyezés és a reális mosási cél együtt adja. 20 fokon
          különösen ez az összhang számít.
        </p>

        <RelatedGuides
          title="Kapcsolódó útmutatók a mosókapszula 20 fokos használatához"
          intro="A 20 fokos mosás akkor működik jól, ha a hőfokot, az elhelyezést, az oldódást és a költségeket együtt nézed."
          items={[
            {
              label: '20 fokos mosás',
              title: 'Hogyan moss hatékonyan 20 fokon?',
              description: 'Programhossz, töltet és kapszulaelhelyezés alacsony hőfokú mosáshoz.',
              href: '/hogyan-mossunk-20-fokon',
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
              label: 'Energiatakarékosság',
              title: 'Energiatakarékos mosás lépésről lépésre',
              description: 'Átfogó útmutató tudatos, kímélő és költséghatékony mosási rutinhoz.',
              href: '/energiatakarekos-mosas',
            },
          ]}
        />

        <ArticleSignupCta
          source="article:mosokapszula-20-fokon"
          title="Kérsz még praktikus mosókapszula tippeket?"
          description="Iratkozz fel, és küldünk hasznos útmutatókat a mosókapszula használatához, adagolásához és az oldódási hibák megelőzéséhez."
        />

        <h2>Gyakori kérdések a mosókapszula 20 fokos használatáról</h2>
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
