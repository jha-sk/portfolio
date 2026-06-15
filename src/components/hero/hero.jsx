import { identity } from '@/data/identity';
import { HeroBackground } from './hero-background';
import { ScrollCue } from './scroll-cue';
import { HeroReveal, HeroRevealItem } from '@/components/motion/hero-reveal';

/**
 * Hero — the premium landing hero (HERO-01 / HERO-02 / D-06..D-12).
 *
 * Centered, full-viewport (min-h-[100svh]) stack composed entirely from
 * `identity.js` (D-09 — no hardcoded hero copy):
 *   wordmark (Display role, the 700-weight hero exception, clamp-scaled) →
 *   accent rule → title (Heading) → tagline (Body) → scroll cue.
 *
 * Entrance is the mount-triggered staggered HeroReveal (D-12); the animated
 * aurora/floating-light/particle atmosphere is HeroBackground (D-06/D-07). All
 * motion is transform/opacity only and degrades to static under reduced motion.
 * Styling consumes design tokens only — no hardcoded hex (carries the WR-02
 * mitigation: semantic tokens, no new `dark:` utilities).
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 text-center md:px-6 lg:px-8">
      <HeroBackground />

      <HeroReveal className="flex w-full max-w-content flex-col items-center">
        <HeroRevealItem
          as="h1"
          className="font-sans font-bold uppercase leading-[1.02] tracking-tight text-primary [text-shadow:var(--glow-accent)]"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}
        >
          {identity.name}
        </HeroRevealItem>

        <HeroRevealItem
          as="span"
          className="mt-6 block h-px w-16 bg-primary opacity-60"
        />

        <HeroRevealItem
          as="p"
          className="mt-6 font-sans text-heading font-semibold tracking-wide text-foreground"
        >
          {identity.title}
        </HeroRevealItem>

        <HeroRevealItem
          as="p"
          className="mt-4 max-w-prose text-body text-muted-foreground"
        >
          {identity.tagline}
        </HeroRevealItem>
      </HeroReveal>

      <div className="absolute inset-x-0 bottom-10 flex justify-center">
        <ScrollCue targetId="below-hero" />
      </div>
    </section>
  );
}

export default Hero;
