import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: ' Mosókapszula – Aquadrop Expert Pro | 2+1 ajándék kapszula ',
  description:
    ' Prémium mosókapszula Dubai gyártói háttérrel. Vásárolj 2 dobozt, a 3.-at ajándékba adjuk. Erős tisztítás, tartós illat, modern formula. ',
  openGraph: {
    title: 'Mosókapszula – Aquadrop Expert Pro',
    description: 'Prémium mosókapszula Dubai gyártói háttérrel...',
    url: 'https://www.aquadrop.hu',
    siteName: 'Aquadrop Expert Pro',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Aquadrop Expert Pro mosókapszula',
      },
    ],
    locale: 'hu_HU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mosókapszula – Aquadrop Expert Pro',
    description: 'Prémium mosókapszula Dubai gyártói háttérrel...',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>
        {children}
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
