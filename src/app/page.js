import { Hero } from '@/components/hero/hero';
import { Snapshot } from '@/components/sections/snapshot';
import { About } from '@/components/sections/about';

/*
 * Home route — Career OS single-page layout.
 *
 * Section order mirrors the IA (spec §4):
 *   1. Hero       — full-viewport terminal wordmark
 *   2. Snapshot   — telemetry stat strip
 *   3. About      — ~/about console panel
 *
 * The boot overlay (mounted in layout.js) wipes away to reveal Hero first.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Snapshot />
      <About />
    </>
  );
}
