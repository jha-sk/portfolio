'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * MountReveal / MountRevealItem — staggered on-mount entrance animation.
 *
 * Mirrors RevealGroup / RevealItem from reveal.jsx but triggers immediately
 * on mount (animate="visible") instead of on scroll (whileInView).
 *
 * Use for above-the-fold content (hero, boot exit) that should animate in
 * right when the component mounts, not when scrolled into view.
 *
 * Motion contract (mirrors reveal.jsx):
 *   - Fade + 16px upward translate: opacity 0→1, y 16→0
 *   - Duration 0.5s, ease [0.22,1,0.36,1]
 *   - Group stagger: 0.08s children delay, 0.1s delayChildren
 *   - Reduced motion: static (instant opacity, no translate)
 *
 * Both components accept { children, className, as } — `as` defaults to 'div'.
 */

/* ── Animated variants ─────────────────────────────────────────────────── */
const mountGroupVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const mountItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ── Static (reduced-motion) variants ─────────────────────────────────── */
const staticGroupVariants = {
  hidden: {},
  visible: {},
};

const staticItemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

/* ── MountReveal (group) ───────────────────────────────────────────────── */
export function MountReveal({ children, className, as: Tag = 'div' }) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[Tag] ?? motion.div;

  return (
    <MotionTag
      className={className}
      variants={prefersReducedMotion ? staticGroupVariants : mountGroupVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </MotionTag>
  );
}

/* ── MountRevealItem ───────────────────────────────────────────────────── */
export function MountRevealItem({ children, className, as: Tag = 'div' }) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[Tag] ?? motion.div;

  return (
    <MotionTag
      className={className}
      variants={prefersReducedMotion ? staticItemVariants : mountItemVariants}
    >
      {children}
    </MotionTag>
  );
}
