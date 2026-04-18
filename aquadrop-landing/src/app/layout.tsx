import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aquadrop Expert Pro',
  description: 'Aquadrop Expert Pro landing oldal és jelentkezési felületek.',
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
