'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Node — glowing blueprint dot with optional animated pulse ring.
 *
 * CLIENT component (uses useReducedMotion + Framer Motion).
 * Inner dot: bg-fg + shadow-glow (token shadow).
 * Pulse: absolutely-positioned ring that scales out and fades — GPU-only
 * (scale + opacity). Gated behind useReducedMotion().
 */
export function Node({ pulse = true, className }) {
  const prefersReducedMotion = useReducedMotion();
  const showPulse = pulse && !prefersReducedMotion;

  return (
    <span
      className={cn(
        'relative inline-flex h-2.5 w-2.5 items-center justify-center',
        className,
      )}
    >
      {/* Inner dot */}
      <span className="h-2 w-2 rounded-full bg-fg shadow-glow" />

      {/* Pulse ring — transform + opacity only (GPU-friendly) */}
      {showPulse && (
        <motion.span
          aria-hidden="true"
          className="absolute h-2.5 w-2.5 rounded-full bg-fg"
          animate={{ scale: [1, 2.8], opacity: [0.5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </span>
  );
}

export default Node;
