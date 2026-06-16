'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * ScrollCue — the hero's entry affordance (HERO-01 / D-10).
 *
 * An interactive button (44×44 minimum hit area, UI-SPEC § Spacing exception) that
 * scrolls one viewport down to the content below the hero. Carries an explicit
 * aria-label; the mono "SCROLL" glyph-text is decorative.
 *
 * Motion: a subtle ~1.8s vertical bob (transform/opacity only). Reduced motion
 * (D-05): the bob is disabled and the cue renders statically.
 */
export function ScrollCue({ targetId = 'snapshot', className }) {
  const prefersReducedMotion = useReducedMotion();

  function handleScroll() {
    const el = typeof document !== 'undefined' && document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    } else if (typeof window !== 'undefined') {
      window.scrollBy({
        top: window.innerHeight,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleScroll}
      aria-label="Scroll to content"
      className={cn(
        'group flex min-h-[44px] min-w-[44px] flex-col items-center justify-end gap-1.5',
        'rounded-md text-muted-foreground transition-colors duration-200',
        'hover:text-primary focus-visible:text-primary focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'focus-visible:ring-offset-background',
        className
      )}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.28em]" aria-hidden="true">
        Scroll
      </span>
      <motion.span
        aria-hidden="true"
        animate={prefersReducedMotion ? undefined : { y: [0, 8, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <ChevronDown className="h-4 w-4" />
      </motion.span>
    </button>
  );
}

export default ScrollCue;
