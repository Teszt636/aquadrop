import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
