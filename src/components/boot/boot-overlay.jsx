'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { BrushStroke } from './brush-stroke';

/**
 * BootOverlay — the zen brush-stroke boot reveal (BOOT-01 / BOOT-02 / D-01..D-05).
 *
 * Behaviour:
 *   - Plays ONCE PER TAB SESSION (sessionStorage, D-03). Returning visitors in the
 *     same session — and reduced-motion users (D-05) — skip straight to the hero.
 *   - Mounted app-wide in the root layout; it does NOT replay on client-side route
 *     changes because it never unmounts during in-session navigation (BOOT-02).
 *   - Auto-advances after the stroke draws + a short hold; ANY deliberate input
 *     (pointer / key / wheel / touch) skips it immediately (D-04).
 *   - The void overlay (theme-aware `bg-background`) sits above everything on first
 *     paint so the hero is never glimpsed before the stroke; it then lifts away
 *     with a transform-only "curtain" wipe (FND-06) to reveal the hero (D-01).
 *
 * SSR-safety: the overlay renders during the undecided `pending` phase so the hero
 * (server-rendered beneath) is never flashed. The sessionStorage / reduced-motion
 * decision happens in an effect; returning / reduced-motion users get an instant,
 * motion-free removal (no curtain), so there is no perceptible replay.
 */
const BOOT_KEY = 'careeros:boot-shown';
const HOLD_MS = 600; // zen pause after the stroke lands, before the wipe
const FAILSAFE_MS = 4500; // hard cap — the overlay can never get stuck

export function BootOverlay() {
  const prefersReducedMotion = useReducedMotion();
  // 'pending' (undecided — show void, no stroke) -> 'play' (draw stroke) -> 'done'.
  const [phase, setPhase] = useState('pending');
  const [instant, setInstant] = useState(false); // skip the curtain (returning / reduced motion)
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase('done');
  }, []);

  // Decide once, on mount, whether the boot plays this session.
  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(BOOT_KEY) === '1';
    } catch {
      alreadyShown = false; // storage blocked -> treat as a first visit
    }

    if (alreadyShown || prefersReducedMotion) {
      setInstant(true); // remove with no curtain motion
      finishedRef.current = true;
      setPhase('done');
      return undefined;
    }

    try {
      sessionStorage.setItem(BOOT_KEY, '1');
    } catch {
      /* storage blocked — boot still plays, just not remembered */
    }
    setPhase('play');

    const failsafe = setTimeout(finish, FAILSAFE_MS);
    return () => clearTimeout(failsafe);
  }, [prefersReducedMotion, finish]);

  // Skip on any deliberate input while the boot is on screen (D-04).
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const skip = () => finish();
    window.addEventListener('pointerdown', skip, { passive: true });
    window.addEventListener('keydown', skip);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchmove', skip, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchmove', skip);
    };
  }, [phase, finish]);

  const handleDrawComplete = useCallback(() => {
    const hold = setTimeout(finish, HOLD_MS);
    return () => clearTimeout(hold);
  }, [finish]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="boot-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={instant ? { opacity: 0 } : { y: '-100%' }}
          transition={{
            duration: instant ? 0 : 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {phase === 'play' && (
            <BrushStroke
              duration={1.3}
              onDrawComplete={handleDrawComplete}
              className="w-[80%] max-w-[820px]"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BootOverlay;
