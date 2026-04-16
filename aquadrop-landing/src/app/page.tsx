import {
  AnnouncementSection,
  BenefitsSection,
  FooterSection,
  GiftSection,
  HeroSection,
  ProblemSection,
  TechnologySection,
  TrustSection,
  ThreePathsSection,
  MobileStickyCTA,
  SocialProofSection
} from '@/components/sections';

export default function Home() {
  return (
    <main className="flex flex-col pb-24 md:pb-0">
      <HeroSection />
      <ProblemSection />
      <BenefitsSection />
      <TechnologySection />
      <TrustSection />
      <ThreePathsSection />
      <GiftSection />
      <SocialProofSection />
      <AnnouncementSection />
      <FooterSection />
      <MobileStickyCTA />
    </main>
  );
}
