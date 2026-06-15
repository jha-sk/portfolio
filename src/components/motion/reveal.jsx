'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Reveal — the single reusable section-reveal wrapper (MOT-01 / D-13).
 *
 * Every later section reuses this so the reveal + reduced-motion gate are
 * inherited for free. Contract (UI-SPEC § Motion Baseline):
 *   - fade + 16px upward translate: opacity 0 -> 1, y 16 -> 0
 *   - duration 0.5s, ease [0.22, 1, 0.36, 1] (easeOutExpo-like)
 *   - trigger in-view once: whileInView, viewport { once: true, amount: 0.2 }
 *   - animate ONLY transform/opacity (GPU-friendly, FND-06)
 *
 * Reduced motion (FND-05): when prefers-reduced-motion is set, content renders
 * statically — no translate, instant opacity — via the useReducedMotion() gate.
 */
export function Reveal({ children, className }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.01 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
