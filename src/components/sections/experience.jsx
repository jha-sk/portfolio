'use client';

import { experience } from '@/data/experience';
import { ConsolePanel } from '@/components/ui/console-panel';
import { Chip } from '@/components/blueprint/chip';
import { Reveal } from '@/components/motion/reveal';

/**
 * Experience — changelog console panel (section #5 in Career OS IA).
 *
 * A ConsolePanel titled `// changelog` containing the primary experience entry.
 * Layout:
 *   - Header row: role (heading weight, text-fg) + company (mono label, text-fg2)
 *     on the left; period (mono label, text-fg3) right-aligned at md+; stacks on mobile.
 *   - Bullet log-list: each bullet as `flex gap-3` row — a mono `+` marker (text-fg,
 *     shrink-0) and the body text (text-body, text-fg2, leading-relaxed).
 *   - Footer: flex-wrap Chip row for the tech stack.
 *
 * Design contract: token-only styling, dichromatic #020202/#B2D5E5, no raw hex.
 * Motion: single Reveal wrapper — fade + 16px y translate, GPU-friendly,
 * gated by useReducedMotion (inherited from Reveal).
 */
export function Experience() {
  const entry = experience[0];

  return (
    <section id="experience" aria-label="Work experience">
      <div className="mx-auto w-full max-w-content px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <Reveal>
          <ConsolePanel title="// changelog">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-4 mb-8">
              <div>
                <p className="font-sans text-heading font-semibold text-fg leading-tight">
                  {entry.role}
                </p>
                <p className="font-mono text-label text-fg2 mt-1">
                  {entry.company}
                </p>
              </div>
              <p className="font-mono text-label text-fg3 md:text-right shrink-0">
                {entry.period}
              </p>
            </div>

            {/* Bullet log-list */}
            <ul className="space-y-4 mb-8" role="list">
              {entry.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="font-mono text-fg shrink-0 select-none"
                    aria-hidden="true"
                  >
                    +
                  </span>
                  <span className="font-sans text-body text-fg2 leading-relaxed">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>

            {/* Tech stack chips */}
            <div className="flex flex-wrap gap-2">
              {entry.tech.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
          </ConsolePanel>
        </Reveal>
      </div>
    </section>
  );
}

export default Experience;
