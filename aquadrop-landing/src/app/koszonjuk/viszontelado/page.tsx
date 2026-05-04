import type { Metadata } from 'next';
import { ThankYouPage } from '@/components/thank-you';

export const metadata: Metadata = {
  title: 'Köszönjük a jelentkezést | Aquadrop',
};

export default function ResellerThankYouPage() {
  return (
    <ThankYouPage
      title="Köszönjük a jelentkezést!"
      message="Viszonteladói jelentkezésed megérkezett. Hamarosan felvesszük veled a kapcsolatot."
    />
  );
}
