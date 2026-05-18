import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { FooterSection } from '@/components/sections';
import { PartnerBrochureFlipbook, PartnerLanding } from '@/components/partner';

export const metadata: Metadata = {
  title: 'Mosókapszula viszonteladóknak | Aquadrop partnerprogram',
  description:
    'Prémium mosókapszula viszonteladóknak: erős termékpozíció, könnyen kommunikálható előnyök, értékesítési támogatás, raktározási és webshopos értékesítési szempontok.',
  alternates: {
    canonical: 'https://www.aquadrop.hu/partner',
  },
  openGraph: {
    type: 'website',
    locale: 'hu_HU',
    siteName: 'Aquadrop Expert Pro',
    title: 'Mosókapszula viszonteladóknak | Aquadrop',
    description:
      'Aquadrop partnerprogram viszonteladóknak: prémium mosókapszula, értékesítési támogatás, könnyen kommunikálható termékelőnyök és gyakorlati B2B szempontok.',
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
    title: 'Mosókapszula viszonteladóknak | Aquadrop',
    description:
      'Prémium 4 az 1-ben mosókapszula viszonteladóknak, üzleti fókuszú partnerprogrammal, értékesítési támogatással és könnyen kommunikálható termékelőnyökkel.',
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
        name: 'Mosókapszula viszonteladóknak | Aquadrop partnerprogram',
        description:
          'Aquadrop B2B partner oldal mosókapszula viszonteladóknak, prémium termékpozicionálással, értékesítési támogatással és gyakorlati viszonteladói információkkal.',
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
      <JsonLd data={partnerStructuredData} />
      <PartnerLanding />
      <PartnerBrochureFlipbook />
      <FooterSection />
    </>
  );
}
