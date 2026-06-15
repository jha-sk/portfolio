import { identity } from '@/data/identity';
import { stats } from '@/data/stats';
import { isPlaceholder } from '@/data/placeholders.js';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';

/*
 * Phase-1 placeholder home route. Proves the foundation end-to-end:
 * tokens (bg-background / text-primary / glass / glow), the motion reveal
 * wrapper (single + grouped/staggered), a clean responsive reflow across
 * mobile/tablet/desktop (FND-04), and real data reads from src/data/*.
 * The named sections (boot, hero, dashboard, etc.) arrive in Phases 2-6.
 *
 * Responsive container (UI-SPEC § Spacing Scale / Responsive Baseline):
 *   max content width 1200px (max-w-content), gutters 16px / md:24px / lg:32px,
 *   mobile-first Tailwind only, no horizontal scroll at >=320px.
 */
export default function HomePage() {
  return (
    <section className="mx-auto w-full max-w-content px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-24">
      <Reveal className="relative overflow-hidden rounded-lg border border-glass bg-gradient-aurora p-8 shadow-soft md:p-12">
        <div className="glass-surface absolute inset-0 -z-10 rounded-lg" />
        <p className="font-mono text-label uppercase tracking-[0.08em] text-muted-foreground">
          {identity.name}
        </p>
        <h1 className="mt-4 font-sans text-display font-semibold text-primary [text-shadow:var(--glow-accent)]">
          System initialized
        </h1>
        <p className="mt-4 max-w-prose text-body text-muted-foreground">
          Career OS foundation is online. Tokens, theme, and motion are live.
        </p>
      </Reveal>

      {/*
        Grouped, staggered demo (MOT-01): the five stat cards reveal in sequence
        (0.06s stagger) and prove the responsive grid reflow —
        1 column -> md:2-up -> lg:3-up. Stat VALUES are placeholders, so each
        card renders the UI-SPEC empty-state copy instead of a raw TODO_ token.
      */}
      <RevealGroup className="mt-8 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
        {stats.map((stat) => (
          <RevealItem
            key={stat.id}
            className="glass-surface relative overflow-hidden rounded-lg border border-glass bg-glass p-6 shadow-soft"
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
  );
}
