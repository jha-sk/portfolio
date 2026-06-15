import './globals.css';

import { geistSans, geistMono } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { BootOverlay } from '@/components/boot/boot-overlay';

export const metadata = {
  title: 'Sourabh Jha — AI Engineer / Backend Engineer',
  description:
    'Career OS — the operating system of Sourabh Jha, AI Engineer / Backend Engineer.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'min-h-screen bg-background font-sans text-foreground antialiased'
        )}
      >
        <ThemeProvider>
          <BootOverlay />
          <header className="mx-auto flex w-full max-w-content items-center justify-between px-4 py-6 md:px-6 lg:px-8">
            <span className="font-mono text-label font-semibold uppercase tracking-[0.08em] text-primary">
              Career OS
            </span>
            <ThemeToggle />
          </header>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
