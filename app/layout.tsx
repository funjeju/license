import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? 'IP-Assist',
  description: 'AI가 서류를 만들고, 사용자는 권리를 지킵니다. AI 기반 지식재산권 등록 보조 플랫폼.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
