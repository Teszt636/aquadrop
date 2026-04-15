import { AnnouncementSection, BenefitsSection, GiftSection, HeroSection, TechnologySection, TrustSection } from '@/components/sections';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <BenefitsSection />
      <GiftSection />
      <TechnologySection />
      <TrustSection />
      <AnnouncementSection />
    </main>
  );
}
