import type { Metadata } from 'next';
import { ThankYouPage } from '@/components/thank-you';

export const metadata: Metadata = {
  title: 'Köszönjük a feliratkozást! | Aquadrop Expert Pro',
  description: 'Feliratkozás visszaigazolása az Aquadrop Expert Pro oldalon.'
};

export default function SubscriptionThankYouPage() {
  return (
    <ThankYouPage
      title="Köszönjük a feliratkozást!"
      message="Sikeresen feliratkoztál. Értesíteni fogunk, amikor megérkezik a nagy bejelentés."
    />
  );
}
