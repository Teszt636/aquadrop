import {
  AnnouncementSection,
  BenefitsSection,
  FooterSection,
  GiftSection,
  HeroSection,
  TechnologySection,
  TrustSection
} from '@/components/sections';

export default function Home() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <BenefitsSection />
      <TechnologySection />
      <TrustSection />
      <GiftSection />
      <AnnouncementSection />
      <FooterSection />
    </main>
  );
}
