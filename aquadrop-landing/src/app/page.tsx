import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Mosókapszula – Aquadrop Expert Pro | 2+1 ajándék kapszula',
  description:
    'Prémium mosókapszula Dubai minőségben. Erős tisztítás már 20°C-on, hosszan tartó illat. Próbáld ki az Aquadrop Expert Pro-t!',
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: 'Mosókapszula – Aquadrop Expert Pro | 2+1 ajándék kapszula',
    description:
      'Prémium mosókapszula Dubai minőségben. Erős tisztítás már 20°C-on, hosszan tartó illat. Próbáld ki az Aquadrop Expert Pro-t!',
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
    title: 'Mosókapszula – Aquadrop Expert Pro | 2+1 ajándék kapszula',
    description:
      'Prémium mosókapszula Dubai minőségben. Erős tisztítás már 20°C-on, hosszan tartó illat. Próbáld ki az Aquadrop Expert Pro-t!',
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
      question: 'Hogyan kell használni az Aquadrop Expert Pro mosókapszulát?',
      answer:
        'A kapszulát közvetlenül a mosógép dobjába érdemes helyezni, még a ruhák behelyezése előtt. A kapszulás megoldás egyszerűbbé és tisztábbá teszi az adagolást.'
    },
    {
      question: 'Miben különbözik az Aquadrop Expert Pro a hagyományos mosószerektől?',
      answer:
        'Az Aquadrop Expert Pro egy koncentrált, előreadagolt mosókapszula, amely kényelmesebb használatot, gyors adagolást és egyszerűbb mindennapi mosást kínál.'
    },
    {
      question: 'Hogyan igényelhető az ajándék mosókapszula?',
      answer:
        'Az ajándék igényléséhez 2 doboz Aquadrop Expert Pro terméket kell vásárolni valamely partnernél, majd a vásárlást igazoló blokk képét fel kell tölteni az oldalon található űrlapon.'
    },
    {
      question: 'Mi történik, ha a két doboz két külön blokkon szerepel?',
      answer:
        'Ebben az esetben a két blokkot egy jól olvasható, közös képen érdemes feltölteni, hogy az adatok egyértelműen ellenőrizhetők legyenek.'
    },
    {
      question: 'Mennyire biztonságos a csomagolás gyermekek mellett?',
      answer:
        'A gyermekek védelmében különös figyelmet fordítottunk a gyerekzáras csomagolásra. A doboz erős kialakításának köszönhetően akkor sem törik szét könnyen, ha a gyermek lerántja vagy eldobja, stabil nyitási technikája pedig segít megakadályozni a kapszulákhoz való hozzáférést.'
    },
    {
      question: 'Hol lehet megvásárolni az Aquadrop Expert Pro mosókapszulát?',
      answer: 'Az Aquadrop Expert Pro jelenleg viszonteladó partnereken keresztül érhető el.'
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
