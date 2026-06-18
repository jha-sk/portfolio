import './globals.css';

import { ibmPlexSans, jetBrainsMono } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { CustomCursor } from '@/components/system/custom-cursor';
// Note: Dock is intentionally not rendered here — navigation is now the 3D HUD nav.
// The dock component is preserved on disk at src/components/nav/dock.jsx for future reuse.

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
        <main>{children}</main>
        <CustomCursor />
      </body>
    </html>
  );
}
