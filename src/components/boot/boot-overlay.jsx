'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { GridPlane } from '@/components/blueprint/grid-plane';
import { identity } from '@/data/identity';

/**
 * BootOverlay — Career OS power-on boot reveal.
 *
 * Behaviour (PRESERVED from previous design):
 *   - Plays ONCE PER TAB SESSION (sessionStorage, D-03). Returning visitors in the
 *     same session — and reduced-motion users (D-05) — skip straight to the hero.
 *   - Mounted app-wide in the root layout; it does NOT replay on client-side route
 *     changes because it never unmounts during in-session navigation (BOOT-02).
 *   - Auto-advances after the power-on sequence + a short hold; ANY deliberate input
 *     (pointer / key / wheel / touch) skips it immediately (D-04).
 *   - The void overlay (theme-aware `bg-background`) sits above everything on first
 *     paint so the hero is never glimpsed before the sequence; it then lifts away
 *     with a transform-only "curtain" wipe (FND-06) to reveal the hero (D-01).
 *
 * SSR-safety: the overlay renders during the undecided `pending` phase so the hero
 * (server-rendered beneath) is never flashed. The sessionStorage / reduced-motion
 * decision happens in an effect; returning / reduced-motion users get an instant,
 * motion-free removal (no curtain), so there is no perceptible replay.
 *
 * Power-on visual (~1.6 s total):
 *   1. GridPlane fades up (opacity 0 → faint).
 *   2. Wordmark "SOURABH JHA" ignites: opacity 0→1, glow ramps in, scale settles.
 *   3. Thin axis line draws under the wordmark (scaleX 0→1).
 *   4. Hold 400 ms → curtain wipe lifts.
 */
const BOOT_KEY = 'careeros:boot-shown';
const HOLD_MS = 400;     // pause after the sequence, before the wipe
const FAILSAFE_MS = 4500; // hard cap — the overlay can never get stuck
// Total animation budget: grid 0.5s + wordmark 0.6s + line 0.4s ≈ 1.5s + HOLD_MS

const WORDMARK = identity.name.toUpperCase();

export function BootOverlay() {
  const prefersReducedMotion = useReducedMotion();
  // 'pending' (undecided — show void, no content) -> 'play' -> 'done'
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

  // Called when the wordmark animation completes — start the hold timer.
  const handleSequenceComplete = useCallback(() => {
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
            <PowerOnSequence onComplete={handleSequenceComplete} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * PowerOnSequence — the dichromatic terminal power-on animation.
 * Grid fades up → wordmark ignites → axis line draws.
 */
function PowerOnSequence({ onComplete }) {
  return (
    <div className="relative flex w-full h-full items-center justify-center">
      {/* 1. Grid plane fades in as the OS "display" powers on */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <GridPlane className="absolute inset-0 w-full h-full" />
      </motion.div>

      {/* 2 & 3. Wordmark + axis line, centered */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        {/* Wordmark: ignites via opacity + glow + subtle scale settle */}
        <motion.span
          className="font-sans font-bold text-fg select-none"
          style={{
            fontSize: 'clamp(40px, 8vw, 72px)',
            letterSpacing: '0.12em',
            color: 'var(--fg)',
          }}
          initial={{ opacity: 0, scale: 1.04, textShadow: 'none' }}
          animate={{
            opacity: 1,
            scale: 1,
            textShadow: 'var(--glow)',
          }}
          transition={{
            duration: 0.6,
            delay: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          onAnimationComplete={onComplete}
        >
          {WORDMARK}
        </motion.span>

        {/* 3. Axis line draws under the wordmark (scaleX 0 → 1) */}
        <motion.div
          className="w-full"
          style={{
            height: '1px',
            background: 'var(--line-strong)',
            boxShadow: '0 0 6px rgba(178, 213, 229, 0.35)',
            transformOrigin: 'left center',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{
            duration: 0.4,
            delay: 0.85,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>
    </div>
  );
}

export default BootOverlay;
