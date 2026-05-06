import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Prémium mosókapszula alacsony hőfokra | Aquadrop Expert Pro',
  description:
    'Ismerd meg az Aquadrop Expert Pro prémium mosókapszulát: kényelmes adagolás, friss illat, alacsony hőfokú mosáshoz is praktikus megoldás. Keresd viszonteladó partnereinknél.',
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: 'Prémium mosókapszula alacsony hőfokú mosáshoz | Aquadrop',
    description:
      'Az Aquadrop Expert Pro kényelmes, előre adagolt mosókapszula friss illattal, modern formulával és 2+1 ajándék promócióval.',
    url: `${SITE_URL}/`,
    siteName: 'Aquadrop Expert Pro',
    images: [
      {
        url: '/aquadrop-mosokapszula-og-kep.webp',
        width: 1200,
        height: 630,
        alt: 'Aquadrop Expert Pro mosókapszula'
      }
    ],
    locale: 'hu_HU',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prémium mosókapszula alacsony hőfokra | Aquadrop',
    description:
      'Fedezd fel az Aquadrop Expert Pro mosókapszulát: kényelmes adagolás, friss illat és tudatosabb mosási rutin.',
    images: ['/aquadrop-mosokapszula-og-kep.webp']
  }
};

import {
  AnnouncementSection,
  BenefitsSection,
  DubaiSection,
  EnergySavingsSection,
  FooterSection,
  FaqSection,
  GiftConversionSection,
  HeroSection,
  HeroTrustStripSection,
  MicrocapsuleMagicSection,
  ProblemSection,
  SeoSection,
  SocialProofSection,
  TechnologySection,
  ThreePathsSection,
  TrustSection
} from '@/components/sections';
import { ScrollDepthTracker } from '@/components/analytics';
import { HomeKnowledgeHub } from '@/components/home-knowledge-hub';
import { HomeResellerCta } from '@/components/home-reseller-cta';
import { BeforeAfterSectionDynamic } from '@/components/sections/BeforeAfterSectionDynamic';

const GiftSectionDynamic = dynamic(() => import('@/components/sections').then((module) => module.GiftSection));

export default function Home() {

  const faqItems = [
    {
      question: 'Hova kell tenni az Aquadrop Expert Pro mosókapszulát?',
      answer:
        'A mosókapszulát közvetlenül a mosógép dobjának aljára érdemes tenni, még a ruhák behelyezése előtt. Így hamarabb éri víz, és egyenletesebben tud oldódni.'
    },
    {
      question: 'Használható az Aquadrop Expert Pro alacsony hőfokon is?',
      answer:
        'Igen, az Aquadrop Expert Pro mindennapi ruhákhoz alacsonyabb hőfokon is praktikus választás lehet, ha megfelelő programot választasz, és nem töltöd túl a dobot.'
    },
    {
      question: 'Miben különbözik a mosókapszula a folyékony mosószertől?',
      answer:
        'A mosókapszula előre adagolt és kényelmesen használható, míg a folyékony mosószer rugalmasabban mérhető. A kapszula jó választás lehet, ha gyors, tiszta és kiszámítható adagolást szeretnél.'
    },
    {
      question: 'Hogyan igényelhető a 2+1 ajándék kapszula?',
      answer:
        'A promócióhoz 2 doboz Aquadrop Expert Pro terméket kell vásárolni valamely partnernél, majd a vásárlást igazoló blokk képét fel kell tölteni az oldalon található űrlapon.'
    },
    {
      question: 'Hol lehet megvásárolni az Aquadrop Expert Pro mosókapszulát?',
      answer:
        'Az Aquadrop Expert Pro jelenleg viszonteladó partnereken keresztül érhető el. Az oldalon közvetlen online vásárlás nem működik.'
    },
    {
      question: 'Biztonságos a csomagolás gyermekek mellett?',
      answer:
        'A termék gyerekzáras, stabil dobozban érkezik, de a mosókapszulákat mindig gyermekektől elzárva kell tárolni. A kapszulákhoz való hozzáférést minden háztartásban meg kell előzni.'
    }
  ];

  const homeStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.aquadrop.hu/#organization',
        name: 'Aquadrop Expert Pro',
        url: `${SITE_URL}/`,
        logo: 'https://www.aquadrop.hu/logo.png'
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.aquadrop.hu/#website',
        url: `${SITE_URL}/`,
        name: 'Aquadrop Expert Pro',
        publisher: {
          '@id': 'https://www.aquadrop.hu/#organization'
        }
      },
      {
        '@type': 'WebPage',
        '@id': 'https://www.aquadrop.hu/#webpage',
        url: 'https://www.aquadrop.hu/',
        name: 'Mosókapszula – Aquadrop Expert Pro | 2+1 ajándék kapszula',
        isPartOf: {
          '@id': 'https://www.aquadrop.hu/#website'
        },
        about: {
          '@id': 'https://www.aquadrop.hu/#organization'
        },
        mainEntity: {
          '@id': 'https://www.aquadrop.hu/#product'
        }
      },
      {
        '@type': 'Product',
        '@id': 'https://www.aquadrop.hu/#product',
        name: 'Aquadrop Expert Pro mosókapszula',
        brand: {
          '@type': 'Brand',
          name: 'Aquadrop'
        },
        description:
          'Prémium, előre adagolt mosókapszula mindennapi ruhákhoz, kényelmes használathoz és alacsony hőfokú mosási rutinhoz.',
        image: 'https://www.aquadrop.hu/aquadrop-mosokapszula-hero.webp',
        category: 'Laundry detergent capsules',
        url: 'https://www.aquadrop.hu/',
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStoreOnly',
          url: 'https://www.aquadrop.hu/',
          seller: {
            '@type': 'Organization',
            name: 'Aquadrop'
          }
        }
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.aquadrop.hu/#faq',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer
          }
        }))
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />
      <div className="relative w-full overflow-x-clip bg-gradient-to-b from-cyan-50 via-sky-50 to-teal-50">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,255,255,0.92)_0%,rgba(232,250,252,0.9)_50%,rgba(225,247,246,0.94)_100%)]" />

          <div className="absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-cyan-300/30 blur-[120px] md:h-[38rem] md:w-[38rem]" />
          <div className="absolute -right-24 top-[5%] h-[24rem] w-[24rem] rounded-full bg-teal-300/25 blur-3xl md:h-[35rem] md:w-[35rem]" />
          <div className="absolute left-[8%] top-[40%] h-[22rem] w-[22rem] rounded-full bg-sky-300/25 blur-[120px] md:h-[33rem] md:w-[33rem]" />
          <div className="absolute right-[2%] top-[66%] h-[24rem] w-[24rem] rounded-full bg-emerald-200/20 blur-3xl md:h-[34rem] md:w-[34rem]" />

          <div className="absolute left-[14%] top-[16%] h-20 w-20 rounded-full bg-cyan-200/30 blur-xl" />
          <div className="absolute left-[28%] top-[12%] h-14 w-14 rounded-full bg-sky-200/30 blur-xl" />
          <div className="absolute left-[42%] top-[18%] h-16 w-16 rounded-full bg-teal-200/25 blur-2xl" />
          <div className="absolute left-[64%] top-[14%] h-20 w-20 rounded-full bg-emerald-100/25 blur-xl" />
          <div className="absolute left-[79%] top-[24%] h-12 w-12 rounded-full bg-cyan-200/30 blur-xl" />
          <div className="absolute left-[20%] top-[36%] h-12 w-12 rounded-full bg-sky-200/30 blur-xl" />
          <div className="absolute left-[52%] top-[34%] h-24 w-24 rounded-full bg-teal-200/25 blur-2xl" />
          <div className="absolute left-[72%] top-[44%] h-16 w-16 rounded-full bg-emerald-100/25 blur-xl" />
          <div className="absolute left-[9%] top-[58%] h-16 w-16 rounded-full bg-cyan-200/30 blur-2xl" />
          <div className="absolute left-[33%] top-[61%] h-12 w-12 rounded-full bg-sky-200/30 blur-xl" />
          <div className="absolute left-[48%] top-[68%] h-20 w-20 rounded-full bg-teal-200/25 blur-2xl" />
          <div className="absolute left-[66%] top-[72%] h-12 w-12 rounded-full bg-emerald-100/25 blur-xl" />
          <div className="absolute left-[83%] top-[62%] h-16 w-16 rounded-full bg-cyan-200/30 blur-xl" />
          <div className="absolute left-[24%] top-[84%] h-14 w-14 rounded-full bg-sky-200/30 blur-xl" />
        </div>

        <main className="relative isolate flex w-full flex-col">
          <ScrollDepthTracker />
          <header>
            <HeroSection />
            <HeroTrustStripSection />
          </header>
          <GiftConversionSection />
          <EnergySavingsSection />
          <DubaiSection />
          <HomeKnowledgeHub />
          <GiftSectionDynamic />
          <ProblemSection />
          <BenefitsSection />
          <TechnologySection />
          <MicrocapsuleMagicSection />
          <TrustSection />
          <SocialProofSection />
          <BeforeAfterSectionDynamic />
          <ThreePathsSection />
          <AnnouncementSection />
          <SeoSection />
          <FaqSection items={faqItems} />
          <HomeResellerCta />
          <footer>
            <FooterSection />
          </footer>
        </main>
      </div>
    </>
  );
}
