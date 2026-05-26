import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Musical Studio',
  description: '아마추어 뮤지컬 배우용 넘버 연습 플랫폼',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
