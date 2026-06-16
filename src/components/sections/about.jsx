'use client';

import { about } from '@/data/about';
import { ConsolePanel } from '@/components/ui/console-panel';
import { Reveal } from '@/components/motion/reveal';

/**
 * About — ~/about console panel (section #3 in Career OS IA).
 *
 * A ConsolePanel with traffic dots titled `~/about`. Inside: a mono prompt
 * flourish (`$ whoami`) followed by the `about` paragraphs in IBM Plex Sans
 * body copy, capped at max-w-prose for optimal readability.
 *
 * Design contract: token-only styling, dichromatic #020202/#B2D5E5, no raw hex.
 * Motion: single Reveal wrapper — fade + 16px y translate, GPU-friendly,
 * gated by useReducedMotion (inherited from Reveal).
 */
export function About() {
  return (
    <section id="about" aria-label="About Sourabh Jha">
      <div className="mx-auto w-full max-w-content px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <Reveal>
          <ConsolePanel title="~/about" dots>
            {/* Shell prompt flourish */}
            <p className="font-mono text-label text-fg3 mb-6">$ whoami</p>

            {/* Bio paragraphs */}
            <div className="max-w-prose space-y-4">
              {about.map((para, i) => (
                <p
                  key={i}
                  className="font-sans text-body text-fg2 leading-relaxed"
                >
                  {para}
                </p>
              ))}
            </div>
          </ConsolePanel>
        </Reveal>
      </div>
    </section>
  );
}

export default About;
