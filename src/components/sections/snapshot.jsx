'use client';

import { stats } from '@/data/stats';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';

/**
 * Snapshot — telemetry stat strip (section #2 in Career OS IA).
 *
 * Renders the `stats` array as a responsive grid of bordered stat cells.
 * Each cell shows the value (large, glowing, IBM Plex Sans) above the label
 * (mono, uppercase, muted). Staggered scroll-reveal via RevealGroup/RevealItem.
 *
 * Design contract: token-only styling, dichromatic #020202/#B2D5E5, no raw hex.
 * Motion: transform/opacity only, gated by useReducedMotion (inherited from
 * RevealGroup/RevealItem).
 */
export function Snapshot() {
  return (
    <section id="snapshot" aria-label="Career telemetry snapshot">
      <div className="mx-auto w-full max-w-content px-4 md:px-6 lg:px-8 py-16 md:py-20">
        {/* Section kicker */}
        <p className="font-mono text-label uppercase tracking-[0.18em] text-fg3 mb-6">
          <span aria-hidden="true">{'// '}</span>snapshot
        </p>

        {/* Stat grid */}
        <RevealGroup
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          as="ul"
        >
          {stats.map((stat) => (
            <RevealItem key={stat.id} as="li">
              <div className="rounded-lg border border-line bg-background p-5 relative overflow-hidden h-full">
                {/* Scanline texture */}
                <span
                  aria-hidden="true"
                  className="scanlines pointer-events-none absolute inset-0"
                />

                {/* Content above scanline */}
                <div className="relative">
                  {/* Metric value */}
                  <p
                    className="font-sans font-bold text-fg text-glow leading-none mb-2"
                    style={{ fontSize: 'clamp(28px, 5vw, 40px)' }}
                  >
                    {stat.value}
                  </p>

                  {/* Metric label */}
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg3">
                    {stat.label}
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

export default Snapshot;
