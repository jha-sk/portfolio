'use client';

import {
  Code2, Server, Cloud, Database, Activity,
  ShieldCheck, Sparkles, Workflow, Boxes,
} from 'lucide-react';
import { skills } from '@/data/skills';
import { ConsolePanel } from '@/components/ui/console-panel';
import { Chip } from '@/components/blueprint/chip';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';

/* Lucide icon per skill category (falls back to a generic block icon). */
const CATEGORY_ICONS = {
  'Languages': Code2,
  'Backend & APIs': Server,
  'Cloud & DevOps': Cloud,
  'Databases': Database,
  'Tools & Observability': Activity,
  'Security': ShieldCheck,
  'AI-Augmented Engineering': Sparkles,
  'Practices': Workflow,
};

/**
 * Skills — system_spec console panel (section #4 in Sourabh Jha portfolio IA).
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
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-9"
          >
            {skills.map((group, i) => {
              const Icon = CATEGORY_ICONS[group.category] ?? Boxes;
              return (
              <RevealItem key={group.category}>
                {/* Category index label */}
                <p className="flex items-center gap-2 font-mono text-label uppercase tracking-[0.08em] leading-snug text-fg2 mb-4">
                  <Icon className="w-4 h-4 text-fg3 shrink-0" aria-hidden="true" />
                  <span className="text-fg3 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{group.category}</span>
                </p>

                {/* Skill chips */}
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <Chip key={item}>{item}</Chip>
                  ))}
                </div>
              </RevealItem>
              );
            })}
          </RevealGroup>
        </ConsolePanel>
      </div>
    </section>
  );
}

export default Skills;
