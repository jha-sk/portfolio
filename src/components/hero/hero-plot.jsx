'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { HeroReveal, HeroRevealItem } from '@/components/motion/hero-reveal';

/**
 * HeroPlot — the plotted hero (HERO-01 / D-08 overridden for the "engineering
 * blueprint" direction / D-09 / D-12).
 *
 * The name is plotted at a live accent NODE and drawn AXIS line — left-anchored,
 * oversized, asymmetric (not a centered stack). Geist Sans carries the masthead;
 * Geist Mono carries the schematic annotations (its reserved OS/terminal purpose):
 * a `// identity` kicker, an abstract coordinate readout, and the tagline rendered
 * as a code comment. All copy that MEANS something (name/title/tagline) is read
 * from identity.js (D-09) — the coordinate/telemetry tokens are decorative.
 *
 * Motion (D-12): mount-triggered staggered entrance (HeroReveal), an axis line that
 * draws from the node (scaleX), and a node that pulses (scale/opacity loop) — all
 * transform/opacity only. Reduced motion (D-05): static, no draw, no pulse.
 */
const EASE = [0.22, 1, 0.36, 1];

function PlotNode({ reduced }) {
  return (
    <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
      {!reduced && (
        <motion.span
          aria-hidden="true"
          className="absolute h-3 w-3 rounded-full bg-primary"
          animate={{ scale: [1, 2.8], opacity: [0.5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <span className="h-2 w-2 rounded-full bg-primary shadow-glow" />
    </span>
  );
}

export function HeroPlot({ name, title, tagline }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <HeroReveal className="relative flex max-w-content flex-col items-start text-left">
      {/* schematic kicker */}
      <HeroRevealItem
        as="p"
        className="mb-6 font-mono text-label uppercase tracking-[0.3em] text-primary"
      >
        {'// identity · node_01'}
      </HeroRevealItem>

      {/* name — the dominant plotted element */}
      <HeroRevealItem
        as="h1"
        className="font-sans font-bold uppercase leading-[0.9] tracking-tight text-foreground"
        style={{ fontSize: 'clamp(2.75rem, 9vw, 7rem)' }}
      >
        {name}
      </HeroRevealItem>

      {/* axis: live node + drawn connector line */}
      <HeroRevealItem as="div" className="mt-8 flex w-full items-center gap-3">
        <PlotNode reduced={prefersReducedMotion} />
        <motion.span
          aria-hidden="true"
          className="h-px flex-1 origin-left"
          style={{
            background: 'linear-gradient(to right, var(--primary), transparent)',
            opacity: 0.5,
          }}
          initial={prefersReducedMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={
            prefersReducedMotion ? undefined : { duration: 0.9, ease: EASE, delay: 0.25 }
          }
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          [ 042 · 117 ]
        </span>
      </HeroRevealItem>

      {/* data row: title + telemetry */}
      <HeroRevealItem
        as="div"
        className="mt-6 flex w-full flex-col gap-3 md:flex-row md:items-end md:justify-between"
      >
        <p className="font-sans text-heading font-semibold tracking-wide text-foreground">
          {title}
        </p>
        <p className="font-mono text-label uppercase tracking-[0.22em] text-muted-foreground">
          career_os · v1
        </p>
      </HeroRevealItem>

      {/* tagline as a code comment */}
      <HeroRevealItem
        as="p"
        className="mt-6 max-w-prose font-mono text-body leading-relaxed text-muted-foreground"
      >
        <span className="text-primary">{'// '}</span>
        {tagline}
      </HeroRevealItem>
    </HeroReveal>
  );
}

export default HeroPlot;
