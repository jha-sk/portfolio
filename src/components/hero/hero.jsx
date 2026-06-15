import { identity } from '@/data/identity';
import { HeroGrid } from './hero-grid';
import { HeroPlot } from './hero-plot';
import { ScrollCue } from './scroll-cue';

/**
 * Hero — the "engineering blueprint" landing hero (HERO-01 / HERO-02).
 *
 * A schematic instrument plane (HeroGrid) under a left-anchored, oversized name
 * plotted at a live node + drawn axis (HeroPlot), with a vertical `Career OS`
 * spine and a scroll cue. Asymmetric and grid-breaking by design — the opposite of
 * a centered stack. Content is read from identity.js (D-09); styling is token-only;
 * all motion is transform/opacity and degrades to static under reduced motion.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden py-24">
      <HeroGrid />

      {/* vertical brand spine */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-2 top-1/2 hidden -translate-y-1/2 font-mono text-[11px] uppercase tracking-[0.4em] text-muted-foreground md:left-4 md:block lg:left-6"
        style={{ writingMode: 'vertical-rl' }}
      >
        Career OS
      </span>

      <div className="mx-auto w-full max-w-content px-4 md:px-10 lg:px-14">
        <HeroPlot
          name={identity.name}
          title={identity.title}
          tagline={identity.tagline}
        />
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 lg:right-14">
        <ScrollCue targetId="below-hero" />
      </div>
    </section>
  );
}

export default Hero;
