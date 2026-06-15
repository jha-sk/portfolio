'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroGrid — the blueprint plane behind the hero (HERO-02 / D-06 / D-07).
 *
 * A schematic engineering grid built CSS-only (no canvas, no deps): a fine + a
 * coarse grid in the `--border` token, a soft accent depth-glow near the plot
 * origin, the inherited aurora token wash, and corner registration marks. A radial
 * mask fades the grid out toward the edges so it reads as an instrument plane, not
 * a hard table. Animates opacity only and fades in once on mount; static under
 * reduced motion (D-05). Mask gradients use the `black`/`transparent` keywords
 * (alpha only) — no brand hex, token-only styling preserved.
 */
const GRID_LINES =
  'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)';
const GRID_MASK =
  'radial-gradient(ellipse 90% 80% at 34% 50%, black 42%, transparent 100%)';

const CORNERS = [
  'left-5 top-5 border-l border-t md:left-7 md:top-7',
  'right-5 top-5 border-r border-t md:right-7 md:top-7',
  'left-5 bottom-5 border-l border-b md:left-7 md:bottom-7',
  'right-5 bottom-5 border-r border-b md:right-7 md:bottom-7',
];

export function HeroGrid() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 1.1, ease: 'easeOut' }}
    >
      {/* fine grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRID_LINES,
          backgroundSize: '44px 44px',
          WebkitMaskImage: GRID_MASK,
          maskImage: GRID_MASK,
          opacity: 0.55,
        }}
      />
      {/* coarse grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRID_LINES,
          backgroundSize: '220px 220px',
          WebkitMaskImage: GRID_MASK,
          maskImage: GRID_MASK,
          opacity: 0.9,
        }}
      />
      {/* accent depth-glow near the plot origin (left-of-center) */}
      <div
        className="absolute left-[22%] top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary blur-[140px]"
        style={{ opacity: 0.1 }}
      />
      {/* inherited aurora token wash */}
      <div className="absolute inset-0 bg-gradient-aurora" style={{ opacity: 0.6 }} />

      {/* corner registration marks */}
      {CORNERS.map((pos, i) => (
        <span
          key={i}
          className={`absolute h-4 w-4 border-primary opacity-30 ${pos}`}
        />
      ))}
    </motion.div>
  );
}

export default HeroGrid;
