'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroBackground — the animated atmosphere behind the hero (HERO-02 / D-06 / D-07).
 *
 * Three layers, CSS/SVG + Framer Motion only — NO canvas, NO new dependencies:
 *   1. Aurora       — the inherited `bg-gradient-aurora` token on a slowly
 *                     drifting/scaling layer (the accent-tinted radial wash).
 *   2. Floating light — three large blurred accent blobs drifting on long loops.
 *   3. Particles    — ~28 small accent dots rising + twinkling on slow loops.
 *
 * Contract:
 *   - animate ONLY transform/opacity (GPU-friendly, FND-06)
 *   - element-level opacity carries alpha so we stay token-only (bg-primary =
 *     var(--primary)); no hardcoded hex, no /alpha modifier on a var() color
 *   - pointer-events-none — never intercepts hero/scroll interaction
 *   - reduced motion (D-05): every layer renders STATICALLY (no loops), so the
 *     atmosphere still reads but nothing moves
 *
 * Particle positions are DETERMINISTIC (derived from index, no Math.random) so the
 * server and client render identical markup — no hydration mismatch.
 */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: (i * 37 + 11) % 100, // scattered x %
  top: (i * 61 + 7) % 100, // scattered y %
  size: 1 + (i % 3), // 1–3px
  drift: (i % 2 === 0 ? 1 : -1) * (6 + (i % 4) * 4), // horizontal sway px
  rise: 10 + (i % 5) * 5, // upward travel px
  duration: 10 + (i % 7) * 1.6, // 10–19.6s
  delay: (i % 10) * 0.45,
  opacity: 0.16 + (i % 5) * 0.07, // 0.16–0.44
}));

const BLOBS = [
  { left: '12%', top: '18%', size: 460, dur: 19, x: 40, y: 28, op: 0.14 },
  { left: '64%', top: '8%', size: 380, dur: 23, x: -34, y: 36, op: 0.1 },
  { left: '48%', top: '62%', size: 520, dur: 27, x: 26, y: -30, op: 0.08 },
];

export function HeroBackground() {
  const prefersReducedMotion = useReducedMotion();
  const animate = !prefersReducedMotion;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Aurora wash — inherited token on a slowly breathing layer */}
      <motion.div
        className="absolute inset-[-20%] bg-gradient-aurora"
        initial={{ scale: 1, opacity: 0.9 }}
        animate={
          animate
            ? { scale: [1, 1.12, 1], x: [0, 24, 0], y: [0, -18, 0], opacity: [0.9, 1, 0.9] }
            : undefined
        }
        transition={
          animate
            ? { duration: 18, repeat: Infinity, ease: 'easeInOut' }
            : undefined
        }
      />

      {/* Floating light — large blurred accent blobs */}
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary blur-3xl"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            opacity: b.op,
          }}
          animate={
            animate
              ? { x: [0, b.x, 0], y: [0, b.y, 0], opacity: [b.op, b.op * 1.6, b.op] }
              : undefined
          }
          transition={
            animate
              ? { duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }
              : undefined
          }
        />
      ))}

      {/* Particle field — small accent dots rising + twinkling */}
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={
            animate
              ? {
                  y: [0, -p.rise, 0],
                  x: [0, p.drift, 0],
                  opacity: [p.opacity, p.opacity * 1.9, p.opacity],
                }
              : undefined
          }
          transition={
            animate
              ? {
                  duration: p.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: p.delay,
                }
              : undefined
          }
        />
      ))}

      {/* Top sheen — inherited surface gradient for subtle depth */}
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-surface opacity-60" />
    </div>
  );
}

export default HeroBackground;
