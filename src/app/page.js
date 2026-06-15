import { identity } from '@/data/identity';
import { Reveal } from '@/components/motion/reveal';

/*
 * Phase-1 placeholder home route. Proves the foundation end-to-end:
 * tokens (bg-background / text-primary / glass / glow), the motion reveal
 * wrapper, and one real data read from src/data/identity.js — all on screen.
 * The named sections (boot, hero, dashboard, etc.) arrive in Phases 2-6.
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
    </section>
  );
}
