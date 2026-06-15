'use client';

import { motion } from 'framer-motion';

/**
 * BrushStroke — a single zen calligraphic ink stroke (BOOT-01 / D-01 / D-02).
 *
 * One confident SVG path drawn via Framer's `pathLength` (0 -> 1) — restraint over
 * spectacle. Ink is the accent token (`var(--primary)`, theme-aware) with the
 * inherited `--glow-accent` as a drop-shadow halo. Round caps give the stroke its
 * brushed terminals. Animates `pathLength`/`opacity` only (GPU-friendly, FND-06).
 *
 * `onDrawComplete` fires when the stroke finishes so the overlay can hold, then
 * wipe away to reveal the hero (D-01).
 */
const STROKE_PATH = 'M 92 236 C 332 96, 560 312, 802 168 S 1064 150, 1132 208';

export function BrushStroke({ duration = 1.3, onDrawComplete, className }) {
  return (
    <svg
      viewBox="0 0 1224 404"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={className}
    >
      <motion.path
        d={STROKE_PATH}
        stroke="var(--primary)"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(var(--glow-accent))' }}
        initial={{ pathLength: 0, opacity: 0.7 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={onDrawComplete}
      />
    </svg>
  );
}

export default BrushStroke;
