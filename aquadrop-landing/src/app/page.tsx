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
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/6 via-white to-cyan-50/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(186,230,253,0.07)_0%,_rgba(255,255,255,0)_55%)]" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-sky-300/8 blur-3xl md:h-96 md:w-96" />
        <div className="absolute right-[-8%] top-[35%] h-80 w-80 rounded-full bg-cyan-300/7 blur-3xl md:h-[28rem] md:w-[28rem]" />
        <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-blue-200/7 blur-3xl md:h-[24rem] md:w-[24rem]" />
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
