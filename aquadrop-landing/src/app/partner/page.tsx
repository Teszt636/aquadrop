import type { Metadata } from 'next';

import { FooterSection } from '@/components/sections';
import { PartnerLanding } from '@/components/partner';

export const metadata: Metadata = {
  title: 'Prémium viszonteladói partnerprogram | Aquadrop',
  description:
    'Aquadrop B2B partner oldal viszonteladóknak: kevesebb reklamáció, elégedettebb vevők, könnyebb értékesítés. Jelentkezz partneri egyeztetésre.',
  alternates: {
    canonical: 'https://www.aquadrop.hu/partner',
  },
  openGraph: {
    type: 'website',
    locale: 'hu_HU',
    siteName: 'Aquadrop',
    title: 'Prémium viszonteladói partnerprogram | Aquadrop',
    description:
      'Kevesebb reklamáció. Elégedettebb vevők. Könnyebb értékesítés. Ismerd meg az Aquadrop partnerprogramot.',
    url: 'https://www.aquadrop.hu/partner',
    images: [
      {
        url: 'https://www.aquadrop.hu/aquadrop-mosokapszula-og-kep.webp',
        width: 1200,
        height: 630,
        alt: 'Aquadrop Expert Pro mosókapszula',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prémium viszonteladói partnerprogram | Aquadrop',
    description:
      'Aquadrop B2B partner oldal viszonteladóknak: kevesebb reklamáció, elégedettebb vevők, könnyebb értékesítés. Jelentkezz partneri egyeztetésre.',
    images: ['https://www.aquadrop.hu/aquadrop-mosokapszula-og-kep.webp'],
  },
};

export default function PartnerPage() {
  const partnerStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.aquadrop.hu/#organization',
        name: 'Aquadrop Expert Pro',
        url: 'https://www.aquadrop.hu',
        logo: 'https://www.aquadrop.hu/logo.png'
      },
      {
        '@type': 'WebPage',
        '@id': 'https://www.aquadrop.hu/partner/#webpage',
        url: 'https://www.aquadrop.hu/partner',
        name: 'Prémium viszonteladói partnerprogram | Aquadrop',
        description:
          'B2B landing oldal viszonteladóknak, konkrét reklamáció-csökkentési és értékesítéstámogatási fókuszú ajánlattal.',
        inLanguage: 'hu-HU',
        isPartOf: {
          '@id': 'https://www.aquadrop.hu/#website'
        },
        about: {
          '@id': 'https://www.aquadrop.hu/#organization'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(partnerStructuredData) }}
      />
      <PartnerLanding />
      <FooterSection />
    </>
  );
}
