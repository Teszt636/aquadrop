import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aquadrop',
  description: 'Aquadrop landing oldal és jelentkezési felületek.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
