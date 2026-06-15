'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroReveal — mount-triggered staggered reveal for above-the-fold content.
 *
 * The shared `Reveal`/`RevealGroup` wrappers are `whileInView`-only, which never
 * fires for content already in the viewport. The hero sits above the fold (and is
 * uncovered by the boot wipe), so it needs a group that animates ON MOUNT instead.
 *
 * Reuses the inherited motion contract verbatim (UI-SPEC § Motion Baseline / D-12):
 *   - fade + 16px upward translate: opacity 0 -> 1, y 16 -> 0
 *   - duration 0.5s, ease [0.22, 1, 0.36, 1]
 *   - transform/opacity only (GPU-friendly, FND-06)
 * Hero stagger is 0.08s (UI-SPEC hero default — a local override of the 0.06s
 * section baseline, never a redefinition of the item timing).
 *
 * Reduced motion (FND-05 / D-05): items render statically (instant opacity, no
 * translate) via the same useReducedMotion() gate every consumer inherits.
 */
const groupVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const staticGroupVariants = { hidden: {}, visible: {} };
const staticItemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

export function HeroReveal({ children, className, as: Tag = 'div' }) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[Tag] ?? motion.div;

  return (
    <MotionTag
      className={className}
      variants={prefersReducedMotion ? staticGroupVariants : groupVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </MotionTag>
  );
}

export function HeroRevealItem({ children, className, as: Tag = 'div' }) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[Tag] ?? motion.div;

  return (
    <MotionTag
      className={className}
      variants={prefersReducedMotion ? staticItemVariants : itemVariants}
    >
      {children}
    </MotionTag>
  );
}

export default HeroReveal;
