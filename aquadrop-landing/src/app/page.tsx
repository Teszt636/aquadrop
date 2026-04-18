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
      <div className="relative">
        <main className="relative isolate flex flex-col pb-24 md:pb-0">
          <ScrollDepthTracker />
          <HeroSection />
          <ProblemSection />
          <BenefitsSection />
          <TechnologySection />
          <MicrocapsuleMagicSection />
          <TrustSection />
          <SocialProofSection />
          <BeforeAfterSection />
          <ThreePathsSection />
          <GiftSection />
          <AnnouncementSection />
          <B2BBridgeSection />
          <FooterSection />
        </main>
      </div>
    </>
  );
}
