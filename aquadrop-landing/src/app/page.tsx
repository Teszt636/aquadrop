import {
  AnnouncementSection,
  B2BBridgeSection,
  BenefitsSection,
  FooterSection,
  GiftSection,
  HeroSection,
  MobileStickyCTA,
  ProblemSection,
  SocialProofSection,
  TechnologySection,
  ThreePathsSection,
  TrustSection
} from '@/components/sections';
import { ScrollDepthTracker } from '@/components/analytics';

export default function Home() {
  return (
    <main className="relative isolate flex flex-col overflow-hidden pb-24 md:pb-0">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-28 -top-24 h-[24rem] w-[24rem] rounded-full bg-[rgba(125,211,252,0.14)] blur-[110px] md:h-[34rem] md:w-[34rem]" />
        <div className="absolute -right-24 top-8 h-[22rem] w-[22rem] rounded-full bg-[rgba(34,211,238,0.16)] blur-[120px] md:h-[32rem] md:w-[32rem]" />
        <div className="absolute -left-16 top-[44%] h-[20rem] w-[20rem] rounded-full bg-[rgba(147,197,253,0.1)] blur-[100px] md:h-[30rem] md:w-[30rem]" />
        <div className="absolute -bottom-40 left-1/2 h-[26rem] w-[40rem] -translate-x-1/2 rounded-full bg-[rgba(186,230,253,0.12)] blur-[120px] md:h-[30rem] md:w-[56rem]" />
      </div>
      <ScrollDepthTracker />
      <HeroSection />
      <ProblemSection />
      <BenefitsSection />
      <TechnologySection />
      <TrustSection />
      <SocialProofSection />
      <ThreePathsSection />
      <GiftSection />
      <AnnouncementSection />
      <B2BBridgeSection />
      <FooterSection />
      <MobileStickyCTA />
    </main>
  );
}
