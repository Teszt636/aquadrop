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
  MobileStickyCTA
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
      <AnnouncementSection />
      <FooterSection />
      <MobileStickyCTA />
    </main>
  );
}
