'use client';

import { skills } from '@/data/skills';
import { ConsolePanel } from '@/components/ui/console-panel';
import { Chip } from '@/components/blueprint/chip';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';

/**
 * Skills — system_spec console panel (section #4 in Career OS IA).
 *
 * A ConsolePanel titled `// system_spec` containing a responsive 3-column
 * grid of skill-category blocks. Each block shows a mono category index
 * label and a flex-wrap row of Chip primitives for the items.
 *
 * RevealGroup / RevealItem produces a staggered scroll-in so blocks cascade
 * in from invisible to visible as the section enters the viewport.
 *
 * Design contract: token-only styling, dichromatic #020202/#B2D5E5, no raw hex.
 * Motion: RevealGroup/RevealItem stagger — fade + 16px y translate, GPU-friendly,
 * gated by useReducedMotion (inherited from RevealItem).
 */
export function Skills() {
  return (
    <section id="skills" aria-label="Skills — system spec">
      <div className="mx-auto w-full max-w-content px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <ConsolePanel title="// system_spec">
          <RevealGroup
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {skills.map((group, i) => (
              <RevealItem key={group.category}>
                {/* Category index label */}
                <p className="font-mono text-label uppercase tracking-[0.18em] text-fg2 mb-3">
                  <span className="text-fg3 mr-2">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {group.category}
                </p>

                {/* Skill chips */}
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <Chip key={item}>{item}</Chip>
                  ))}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </ConsolePanel>
      </div>
    </section>
  );
}

export default Skills;
