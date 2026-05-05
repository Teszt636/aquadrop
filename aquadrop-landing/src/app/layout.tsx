import type { Metadata } from 'next';
import Script from 'next/script';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import { SITE_URL } from '@/lib/constants';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Mosókapszula – Aquadrop Expert Pro | 2+1 ajándék kapszula',
    template: '%s | Aquadrop Expert Pro',
  },
  description:
    'Prémium mosókapszula Dubai gyártói háttérrel. Vásárolj 2 dobozt, a 3.-at ajándékba adjuk. Erős tisztítás, tartós illat, modern formula.',
  openGraph: {
    url: `${SITE_URL}/`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      'max-image-preview': 'large',
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu" data-scroll-behavior="smooth">
      <body>
        <Script
          id="google-consent-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('consent', 'default', {
                ad_storage: 'denied',
                analytics_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                wait_for_update: 500
              });
            `,
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KE6Z8CCYL4"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('js', new Date());
              gtag('config', 'G-KE6Z8CCYL4');
            `,
          }}
        />
        {children}
        <CookieConsentBanner />
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="oo1g6YvtUDzMb2+xzjQdrg"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
