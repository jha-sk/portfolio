import { Hero } from '@/components/hero/hero';
import { stats } from '@/data/stats';
import { isPlaceholder } from '@/data/placeholders.js';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';

/*
 * Home route (Phase 2). Leads with the boot→hero experience (D-11): the boot
 * overlay (mounted in layout.js) wipes away to reveal the full-viewport Hero.
 *
 * Below the hero, the Phase-1 stat grid is RELOCATED (D-11 permits "move below the
 * hero") so the hero's scroll cue has a destination and the data-driven + motion
 * baseline stays demonstrated. Stat VALUES are placeholders (FND-07), so each card
 * shows the UI-SPEC empty-state copy until Phase 3 formalizes the dashboard.
 *
 * Responsive container (UI-SPEC § Responsive Baseline): max-w-content (1200px),
 * gutters 16/24/32, mobile-first, no horizontal scroll at >=320px.
 */
export default function HomePage() {
  return (
    <>
      <Hero />

      <section
        id="below-hero"
        className="mx-auto w-full max-w-content px-4 py-16 md:px-6 md:py-20 lg:px-8 lg:py-24"
      >
        <p className="font-mono text-label uppercase tracking-[0.08em] text-muted-foreground">
          System metrics
        </p>

        <RevealGroup className="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {stats.map((stat) => (
            <RevealItem
              key={stat.id}
              className="glass-surface relative overflow-hidden rounded-lg border border-glass p-6 shadow-soft"
            >
              <p className="font-mono text-label uppercase tracking-[0.08em] text-muted-foreground">
                {stat.label}
              </p>
              {isPlaceholder(stat.value) ? (
                <div className="mt-3">
                  <p className="font-sans text-heading font-semibold text-foreground">
                    Nothing here yet
                  </p>
                  <p className="mt-2 text-body text-muted-foreground">
                    This section is awaiting data. Content loads from the in-repo
                    data files.
                  </p>
                </div>
              ) : (
                <p className="mt-3 font-mono text-display font-semibold text-primary">
                  {stat.value}
                  {stat.unit}
                </p>
              )}
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}
