import type { Metadata } from 'next';
import Script from 'next/script';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.aquadrop.hu'),
  title: {
    default: 'Mosókapszula – Aquadrop Expert Pro | 2+1 ajándék kapszula',
    template: '%s | Aquadrop Expert Pro',
  },
  description:
    'Prémium mosókapszula Dubai gyártói háttérrel. Vásárolj 2 dobozt, a 3.-at ajándékba adjuk. Erős tisztítás, tartós illat, modern formula.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    url: 'https://www.aquadrop.hu/',
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
        {children}
        <CookieConsentBanner />
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
              gtag('js', new Date());
              gtag('config', 'G-KE6Z8CCYL4');
            `,
          }}
        />
      </body>
    </html>
  );
}
