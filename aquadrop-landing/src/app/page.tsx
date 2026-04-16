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
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(248,252,255,0.78)_42%,rgba(244,249,255,0.84)_100%)]" />
        <div className="absolute -left-28 -top-24 h-[24rem] w-[24rem] rounded-full bg-[rgba(125,211,252,0.14)] blur-[110px] md:h-[34rem] md:w-[34rem]" />
        <div className="absolute -right-24 top-8 h-[22rem] w-[22rem] rounded-full bg-[rgba(34,211,238,0.16)] blur-[120px] md:h-[32rem] md:w-[32rem]" />
        <div className="absolute left-[8%] top-[42%] h-[24rem] w-[24rem] rounded-full bg-[rgba(147,197,253,0.11)] blur-[120px] md:h-[34rem] md:w-[34rem]" />
        <div className="absolute right-[5%] top-[56%] h-[22rem] w-[22rem] rounded-full bg-[rgba(103,232,249,0.1)] blur-[115px] md:h-[32rem] md:w-[32rem]" />
        <div className="absolute -bottom-36 left-1/2 h-[26rem] w-[40rem] -translate-x-1/2 rounded-full bg-[rgba(186,230,253,0.13)] blur-[120px] md:h-[30rem] md:w-[56rem]" />
        <div className="absolute -bottom-24 -right-20 h-[20rem] w-[20rem] rounded-full bg-[rgba(56,189,248,0.1)] blur-[110px] md:h-[28rem] md:w-[28rem]" />
      </div>

      <main className="relative isolate flex flex-col pb-24 md:pb-0">
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
    </div>
  );
}
