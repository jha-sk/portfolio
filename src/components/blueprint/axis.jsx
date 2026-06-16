'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Axis — a horizontal drawn line that optionally animates in via scaleX.
 *
 * CLIENT component (uses useReducedMotion + Framer Motion).
 * The gradient uses CSS vars (var(--fg)) — no hex.
 * When `draw` is false (or reduced motion), the line appears statically.
 */
export function Axis({ draw = false, className }) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = draw && !prefersReducedMotion;

  return (
    <motion.span
      className={cn('block h-px origin-left', className)}
      style={{ background: 'linear-gradient(90deg, var(--fg), transparent)' }}
      initial={shouldAnimate ? { scaleX: 0 } : false}
      animate={shouldAnimate ? { scaleX: 1 } : undefined}
      transition={
        shouldAnimate
          ? { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }
          : undefined
      }
    />
  );
}

export default Axis;
