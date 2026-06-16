import { Hero } from '@/components/hero/hero';
import { Snapshot } from '@/components/sections/snapshot';
import { About } from '@/components/sections/about';
import { Skills } from '@/components/sections/skills';
import { Experience } from '@/components/sections/experience';
import { Projects } from '@/components/sections/projects';
import { CertsEducation } from '@/components/sections/certs-education';

/*
 * Home route — Career OS single-page layout.
 *
 * Section order mirrors the IA (spec §4):
 *   1. Hero       — full-viewport terminal wordmark
 *   2. Snapshot   — telemetry stat strip
 *   3. About      — ~/about console panel
 *   4. Skills     — // system_spec grid of tech categories
 *   5. Experience — // changelog role + bullet log + tech chips
 *
 * The boot overlay (mounted in layout.js) wipes away to reveal Hero first.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Snapshot />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <CertsEducation />
    </>
  );
}
