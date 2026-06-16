import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';

/**
 * IBM Plex Sans — wordmarks, section headings, and body copy.
 * CSS-variable bound to `--font-sans`, self-hosted by next/font, swap.
 */
export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '600', '700'],
});

/**
 * JetBrains Mono — the "system voice": labels, kickers, skill chips,
 * telemetry/metrics, coordinate tags, command prompts, and code-comment taglines.
 * CSS-variable bound to `--font-mono`, self-hosted by next/font, swap.
 */
export const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '700'],
});
