import type { Metadata } from 'next';
import { ThankYouPage } from '@/components/thank-you';

export const metadata: Metadata = {
  title: 'Köszönjük az igénylést | Aquadrop',
};

export default function GiftThankYouPage() {
  return (
    <ThankYouPage
      title="Megkaptuk az igénylésed"
      message="Az ajándékdoboz-igénylésedet rögzítettük. Ellenőrzés után emailben értesítünk a következő lépésekről."
    />
  );
}
