import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mosókapszula – Aquadrop Expert Pro | 2+1 ajándék kapszula',
  description:
    'Prémium mosókapszula Dubai gyártói háttérrel. Vásárolj 2 dobozt, a 3.-at ajándékba adjuk. Erős tisztítás, tartós illat, modern formula.',
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
  return (
    <>
      <div className="relative w-full overflow-x-clip">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(248,252,255,0.8)_38%,rgba(244,249,255,0.86)_100%)]" />

          <div className="absolute -left-28 -top-24 h-[26rem] w-[26rem] rounded-full bg-[rgba(125,211,252,0.16)] blur-[130px] md:h-[38rem] md:w-[38rem]" />
          <div className="absolute -right-24 top-8 h-[24rem] w-[24rem] rounded-full bg-[rgba(34,211,238,0.15)] blur-[130px] md:h-[36rem] md:w-[36rem]" />

          <div className="absolute -left-20 top-[30%] h-[24rem] w-[24rem] rounded-full bg-[rgba(147,197,253,0.12)] blur-[130px] md:h-[36rem] md:w-[36rem]" />
          <div className="absolute -right-16 top-[44%] h-[24rem] w-[24rem] rounded-full bg-[rgba(103,232,249,0.11)] blur-[125px] md:h-[34rem] md:w-[34rem]" />

          <div className="absolute left-[12%] top-[66%] h-[24rem] w-[24rem] rounded-full bg-[rgba(125,211,252,0.11)] blur-[125px] md:h-[34rem] md:w-[34rem]" />
          <div className="absolute right-[6%] top-[78%] h-[24rem] w-[24rem] rounded-full bg-[rgba(56,189,248,0.1)] blur-[125px] md:h-[34rem] md:w-[34rem]" />
          <div className="absolute -bottom-24 -right-20 h-[20rem] w-[20rem] rounded-full bg-[rgba(56,189,248,0.1)] blur-[110px] md:h-[28rem] md:w-[28rem]" />
          <div className="absolute -bottom-32 left-1/2 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-[rgba(186,230,253,0.12)] blur-[130px] md:h-[34rem] md:w-[62rem]" />
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
