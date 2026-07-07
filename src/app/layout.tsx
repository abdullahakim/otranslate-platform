import './globals.css';

import type { Metadata } from 'next';
import { Noto_Sans_Arabic } from 'next/font/google';
import type { ReactNode } from 'react';

const arabicFont = Noto_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic',
});

export const metadata: Metadata = {
  title: 'OTranslate Platform',
  description: 'Bilingual translation services platform skeleton.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl" className={arabicFont.variable}>
      <body>{children}</body>
    </html>
  );
}
