import type { Metadata } from 'next';

import { FooterSection, ResellerSection } from '@/components/sections';

export const metadata: Metadata = {
  title: 'Viszonteladóknak | Aquadrop Expert Pro',
  description: 'Jelentkezés az Aquadrop Expert Pro viszonteladói programjába.'
};

export default function PartnerPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950">
      <ResellerSection />
      <FooterSection />
    </main>
  );
}
