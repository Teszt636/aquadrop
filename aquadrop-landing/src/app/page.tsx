import {
  AnnouncementSection,
  BenefitsSection,
  FooterSection,
  GiftSection,
  HeroSection,
  TechnologySection,
  TrustSection,
  MobileStickyCTA
} from '@/components/sections';

export default function Home() {
  return (
    <main className="flex flex-col pb-24 md:pb-0">
      <HeroSection />
      <BenefitsSection />
      <TechnologySection />
      <TrustSection />
      <GiftSection />
      <AnnouncementSection />
      <FooterSection />
      <MobileStickyCTA />
    </main>
  );
}
