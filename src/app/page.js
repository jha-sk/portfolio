import { SystemHero } from '@/components/system/system-hero';
import { Snapshot } from '@/components/sections/snapshot';
import { About } from '@/components/sections/about';
import { Skills } from '@/components/sections/skills';
import { Experience } from '@/components/sections/experience';
import { Projects } from '@/components/sections/projects';
import { CertsEducation } from '@/components/sections/certs-education';
import { Contact } from '@/components/sections/contact';

/*
 * Home route — Career OS single-page layout.
 *
 * Section order:
 *   1. SystemHero    — full-viewport 3D system topology (R3F canvas + static HUD)
 *   2. Snapshot      — telemetry stat strip
 *   3. About         — ~/about console panel
 *   4. Skills        — // system_spec grid of tech categories
 *   5. Experience    — // changelog role + bullet log + tech chips
 *   6. Projects      — project capsules
 *   7. CertsEducation — certifications + education
 *   8. Contact       — transmission center
 */
export default function HomePage() {
  return (
    <>
      <SystemHero />
      <Snapshot />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <CertsEducation />
      <Contact />
    </>
  );
}
