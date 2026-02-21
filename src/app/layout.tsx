import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Tony's Geauxpanion — LSU Fan Companion",
  description:
    'The ultimate LSU Tigers fan app. Live game-day polls, AI-powered "Ask the Tiger" chat, and everything Death Valley.',
  keywords: ['LSU', 'Tigers', 'football', 'game day', 'Death Valley', 'Baton Rouge', 'Geaux Tigers'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#461D7C',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
