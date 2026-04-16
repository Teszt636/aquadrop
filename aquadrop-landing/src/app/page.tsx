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

export default function Home() {
  return (
    <main className="flex flex-col pb-24 md:pb-0">
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
