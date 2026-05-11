import type { Metadata } from 'next';
import { ThankYouPage } from '@/components/thank-you';

export const metadata: Metadata = {
  title: 'Köszönjük a feliratkozást | Aquadrop',
};

export default function SubscriptionThankYouPage() {
  return (
    <ThankYouPage
      title="Sikeres feliratkozás"
      message="Köszönjük, hogy érdeklődsz az Aquadrop Expert Pro iránt. Értesítünk, ha új információ, promóció vagy fontos bejelentés érkezik."
      secondaryMessage="Addig is érdemes megnézni a mosókapszula használati útmutatóinkat és a mosási költség kalkulátort."
      showGoogleReviewCta={false}
      actions={[
        {
          href: '/',
          label: 'Vissza a főoldalra'
        },
        {
          href: '/mosokapszula-hasznalata',
          label: 'Mosókapszula használati útmutató',
          variant: 'secondary'
        },
        {
          href: '/mosasi-koltseg-kalkulator',
          label: 'Mosási költség kalkulátor',
          variant: 'secondary'
        }
      ]}
    />
  );
}
