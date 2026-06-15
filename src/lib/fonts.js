import { Geist, Geist_Mono } from 'next/font/google';

/**
 * Geist Sans — display / heading / body (UI default).
 * CSS-variable bound to `--font-geist-sans`, self-hosted by next/font, swap.
 */
export const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
});

/**
 * Geist Mono — OS / terminal accent ONLY (stat readouts, Mission Log IDs,
 * command-palette text). Never the body typeface.
 * CSS-variable bound to `--font-geist-mono`.
 */
export const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});
