import {
  AnnouncementSection,
  B2BBridgeSection,
  BeforeAfterSection,
  BenefitsSection,
  FooterSection,
  GiftSection,
  HeroSection,
  MicrocapsuleMagicSection,
  ProblemSection,
  SocialProofSection,
  TechnologySection,
  ThreePathsSection,
  TrustSection
} from '@/components/sections';
import { ScrollDepthTracker } from '@/components/analytics';

export default function Home() {
  return (
    <>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(248,252,255,0.8)_38%,rgba(244,249,255,0.86)_100%)]" />

          <div className="absolute -left-28 -top-24 h-[26rem] w-[26rem] rounded-full bg-[rgba(125,211,252,0.16)] blur-[130px] md:h-[38rem] md:w-[38rem]" />
          <div className="absolute -right-24 top-8 h-[24rem] w-[24rem] rounded-full bg-[rgba(34,211,238,0.15)] blur-[130px] md:h-[36rem] md:w-[36rem]" />

          <div className="absolute -left-20 top-[30%] h-[24rem] w-[24rem] rounded-full bg-[rgba(147,197,253,0.12)] blur-[130px] md:h-[36rem] md:w-[36rem]" />
          <div className="absolute -right-16 top-[44%] h-[24rem] w-[24rem] rounded-full bg-[rgba(103,232,249,0.11)] blur-[125px] md:h-[34rem] md:w-[34rem]" />

          <div className="absolute left-[12%] top-[66%] h-[24rem] w-[24rem] rounded-full bg-[rgba(125,211,252,0.11)] blur-[125px] md:h-[34rem] md:w-[34rem]" />
          <div className="absolute right-[6%] top-[78%] h-[24rem] w-[24rem] rounded-full bg-[rgba(56,189,248,0.1)] blur-[125px] md:h-[34rem] md:w-[34rem]" />

          <div className="absolute -bottom-32 left-1/2 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-[rgba(186,230,253,0.12)] blur-[130px] md:h-[34rem] md:w-[62rem]" />
        </div>

        <main className="relative isolate flex flex-col pb-24 md:pb-0">
          <ScrollDepthTracker />
          <HeroSection />
          <ProblemSection />
          <BenefitsSection />
          <TechnologySection />
          <MicrocapsuleMagicSection />
          <TrustSection />
          <SocialProofSection />
          <ThreePathsSection />
          <GiftSection />
          <AnnouncementSection />
          <BeforeAfterSection />
          <B2BBridgeSection />
          <FooterSection />
        </main>
      </div>
    </>
  );
}
