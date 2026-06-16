import './globals.css';

import { ibmPlexSans, jetBrainsMono } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { BootOverlay } from '@/components/boot/boot-overlay';
import { Dock } from '@/components/nav/dock';

export const metadata = {
  title: 'Sourabh Jha — AI Engineer · Backend Engineer',
  description: 'Backend & systems engineer, AI-augmented — building scalable systems.',
  metadataBase: new URL('https://sourabhj.dev'),
  openGraph: {
    title: 'Sourabh Jha — AI Engineer · Backend Engineer',
    description: 'Backend & systems engineer, AI-augmented — building scalable systems.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={cn(
          ibmPlexSans.variable,
          jetBrainsMono.variable,
          'min-h-screen bg-background font-sans text-foreground antialiased'
        )}
      >
        <BootOverlay />
        <Dock />
        <main>{children}</main>
      </body>
    </html>
  );
}
