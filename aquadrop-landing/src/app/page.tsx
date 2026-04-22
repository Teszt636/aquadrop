import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mosókapszula – Aquadrop Expert Pro | 2+1 ajándék kapszula',
  description:
    'Prémium mosókapszula Dubai gyártói háttérrel. Vásárolj 2 dobozt, a 3.-at ajándékba adjuk. Erős tisztítás, tartós illat, modern formula.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Mosókapszula – Aquadrop Expert Pro | 2+1 ajándék kapszula',
    description:
      'Prémium mosókapszula Dubai gyártói háttérrel. Vásárolj 2 dobozt, a 3.-at ajándékba adjuk. Erős tisztítás, tartós illat, modern formula.',
    url: 'https://www.aquadrop.hu',
    siteName: 'Aquadrop Expert Pro',
    images: [
      {
        url: '/og-image.png',
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
      'Prémium mosókapszula Dubai gyártói háttérrel. Vásárolj 2 dobozt, a 3.-at ajándékba adjuk. Erős tisztítás, tartós illat, modern formula.',
    images: ['/og-image.png']
  }
};

import {
  AnnouncementSection,
  B2BBridgeSection,
  BeforeAfterSection,
  BenefitsSection,
  DubaiSection,
  FooterSection,
  GiftConversionSection,
  GiftSection,
  HeroSection,
  MicrocapsuleMagicSection,
  ProblemSection,
  SeoSection,
  SocialProofSection,
  TechnologySection,
  ThreePathsSection,
  TrustSection
} from '@/components/sections';
import { ScrollDepthTracker } from '@/components/analytics';

export default function Home() {
  const homeStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.aquadrop.hu/#organization',
        name: 'Aquadrop Expert Pro',
        url: 'https://www.aquadrop.hu',
        logo: 'https://www.aquadrop.hu/logo.png'
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.aquadrop.hu/#website',
        url: 'https://www.aquadrop.hu',
        name: 'Aquadrop Expert Pro',
        publisher: {
          '@id': 'https://www.aquadrop.hu/#organization'
        }
      },
      {
        '@type': 'Product',
        '@id': 'https://www.aquadrop.hu/#product',
        name: 'Aquadrop Expert Pro mosókapszula',
        description:
          'Prémium mosókapszula erős tisztítóerővel, tartós illattal és modern formulával, Dubai gyártói háttérrel.',
        image: 'https://www.aquadrop.hu/og-image.png',
        brand: {
          '@type': 'Brand',
          name: 'Aquadrop Expert Pro'
        },
        category: 'Laundry Detergent Pods'
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
          <HeroSection />
          <GiftConversionSection />
          <DubaiSection />
          <GiftSection />
          <ProblemSection />
          <BenefitsSection />
          <TechnologySection />
          <MicrocapsuleMagicSection />
          <TrustSection />
          <SocialProofSection />
          <BeforeAfterSection />
          <ThreePathsSection />
          <AnnouncementSection />
          <B2BBridgeSection />
          <SeoSection />
          <FooterSection />
        </main>
      </div>
    </>
  );
}
