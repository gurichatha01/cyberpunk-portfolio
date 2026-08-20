import type { Metadata, Viewport } from 'next';
import { Chakra_Petch, JetBrains_Mono } from 'next/font/google';
import AnimatedFavicon from '@/components/AnimatedFavicon';
import './globals.css';

/* Self-hosted by next/font at build time — no runtime request to Google (§1).
   Only the weights we actually use: Chakra Petch 600/700 for display,
   JetBrains Mono 400/500 for everything else. */
const display = Chakra_Petch({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-display',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'GURI//OS',
  description:
    'Data Analyst at Criteo and indie product builder. Electronics engineer by training, analyst by trade, builder by choice.',
};

export const viewport: Viewport = {
  themeColor: '#05060a',
  // Let the OS honour safe-area insets (notches) so the mobile bottom bar sits right.
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <AnimatedFavicon />
        {children}
      </body>
    </html>
  );
}
