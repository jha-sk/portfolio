'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { identity } from '@/data/identity';
import { stats } from '@/data/stats';
import { skills } from '@/data/skills';
import { ConsolePanel } from '@/components/ui/console-panel';
import { Node } from '@/components/blueprint/node';
import { Coordinate } from '@/components/blueprint/coordinate';
import { Chip } from '@/components/blueprint/chip';
import { ScrollCue } from './scroll-cue';

/**
 * Hero — self-query terminal treatment.
 *
 * Behavior: on mount, a GET request line types out character-by-character, then
 * the response resolves: status badge + staggered identity result block.
 *
 * SSR: all result content is present in the initial DOM (opacity:0 initial state
 * is set in Framer animate props, not conditional mount), so the server renders
 * the full identity for SEO/prerendering.
 *
 * Reduced motion: the fully-resolved state is rendered immediately — no typewriter,
 * no stagger, everything visible and static.
 *
 * Token contract: dichromatic #020202 / #B2D5E5 via CSS vars only.
 * Raw rgba allowed ONLY for the wordmark 3D shadow and the ambient glow blob.
 */

/* ── Constants ─────────────────────────────────────────────────────────── */

const QUERY_STRING = 'GET /api/engineer?id=sourabh-jha --resolve';
const MS_PER_CHAR = 28;

const HERO_SKILL_IDS = ['Go', 'Kubernetes', 'Terraform', 'AWS', 'Linux', 'Prometheus'];

/* ── Helpers ────────────────────────────────────────────────────────────── */

function pickHeroSkills(skillData) {
  const all = skillData.flatMap((cat) => cat.items);
  return HERO_SKILL_IDS.map((id) => all.find((s) => s === id) ?? id);
}

function buildTelemetry(statData) {
  return statData
    .slice(0, 4)
    .map((s) => `${s.id} ${s.value}`)
    .join(' · ');
}

/* ── useTypewriter hook ─────────────────────────────────────────────────── */

/**
 * Reveals `text` one character at a time with `msPerChar` delay.
 * Returns { displayed: string, done: boolean }.
 * When `enabled` is false — returns the full text immediately (reduced-motion path).
 */
function useTypewriter(text, msPerChar, enabled) {
  const [displayed, setDisplayed] = useState(enabled ? '' : text);
  const [done, setDone] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, msPerChar);
    return () => clearInterval(id);
  }, [text, msPerChar, enabled]);

  return { displayed, done };
}

/* ── Framer variants ────────────────────────────────────────────────────── */

const FADE_UP = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const STAGGER_CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

/* ── Component ──────────────────────────────────────────────────────────── */

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  // When reduced-motion, animate === false means fully resolved immediately.
  const animate = !prefersReducedMotion;

  const heroSkills = pickHeroSkills(skills);
  const telemetry = buildTelemetry(stats);

  /* Typewriter */
  const { displayed, done: typingDone } = useTypewriter(QUERY_STRING, MS_PER_CHAR, animate);

  /* Phase: 'typing' → 'resolved' */
  const [phase, setPhase] = useState(animate ? 'typing' : 'resolved');

  useEffect(() => {
    if (typingDone && phase === 'typing') {
      // Small pause before response appears
      const t = setTimeout(() => setPhase('resolved'), 180);
      return () => clearTimeout(t);
    }
  }, [typingDone, phase]);

  /* Breathing glow animation ref — runs only when not reduced-motion */
  const breathingVariants = animate
    ? {
        rest: { textShadow: WORDMARK_SHADOW },
        breathe: {
          textShadow: WORDMARK_SHADOW_GLOW,
          transition: { duration: 3.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
        },
      }
    : null;

  const resolved = phase === 'resolved';

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 py-16 md:px-8">
      {/* Ambient glow blob — alpha-only, authorized raw value */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 'min(60vw, 600px)',
          height: 'min(60vh, 480px)',
          background: 'rgba(178,213,229,0.04)',
          filter: 'blur(120px)',
        }}
      />

      {/* Terminal window */}
      <ConsolePanel
        title="~/career-os — query"
        dots
        className="relative w-full max-w-[820px]"
        bodyClassName="p-8 md:p-10"
      >
        {/* Coordinate — top-right of body */}
        <Coordinate className="absolute right-4 top-3 md:right-6">
          {'[ node_01 · 200 OK ]'}
        </Coordinate>

        <div className="flex flex-col gap-5">

          {/* ── 1. Query line ──────────────────────────────────────────── */}
          <div className="font-mono text-sm leading-relaxed text-fg2" aria-label={`Query: ${QUERY_STRING}`}>
            <span className="text-fg3 select-none">$ </span>
            <span>{animate ? displayed : QUERY_STRING}</span>
            {/* Blinking caret — shown while typing */}
            {animate && !typingDone && (
              <motion.span
                aria-hidden="true"
                className="ml-px inline-block border border-fg2"
                style={{ width: '0.55ch', height: '1em', verticalAlign: 'text-bottom' }}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
              />
            )}
          </div>

          {/* ── 2. Status badge ────────────────────────────────────────── */}
          <motion.div
            initial={animate ? { opacity: 0, y: 4 } : false}
            animate={resolved ? { opacity: 1, y: 0 } : animate ? { opacity: 0, y: 4 } : false}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <span
              className="inline-flex items-center gap-2 rounded-md border border-line px-2.5 py-1 font-mono text-xs text-fg shadow-glow"
            >
              <span className="text-fg2">200 OK</span>
              <span className="text-fg3">·</span>
              <span className="text-fg3">41ms</span>
            </span>
          </motion.div>

          {/* ── 3. Result block — staggered reveal ─────────────────────── */}
          {/*
            The content is ALWAYS in the DOM (for SSR + SEO).
            Animation is controlled via Framer animate prop, not conditional mount.
          */}
          <motion.div
            className="flex flex-col gap-5"
            variants={animate ? STAGGER_CONTAINER : undefined}
            initial={animate ? 'hidden' : false}
            animate={resolved ? 'visible' : animate ? 'hidden' : false}
          >

            {/* Wordmark */}
            <motion.div variants={animate ? FADE_UP : undefined}>
              <motion.h1
                className="font-sans font-bold uppercase text-fg"
                style={{
                  fontSize: 'clamp(40px,7vw,72px)',
                  lineHeight: 0.92,
                  letterSpacing: '.005em',
                  textShadow: WORDMARK_SHADOW,
                }}
                variants={breathingVariants ?? undefined}
                initial={animate ? 'rest' : false}
                animate={animate && resolved ? 'breathe' : animate ? 'rest' : false}
              >
                {identity.name.toUpperCase()}
              </motion.h1>
            </motion.div>

            {/* Role comment line */}
            <motion.p
              className="font-mono text-sm text-fg2"
              variants={animate ? FADE_UP : undefined}
            >
              {'// '}
              {identity.title.toLowerCase()}
            </motion.p>

            {/* JSON-ish field block */}
            <motion.div
              className="flex flex-col gap-2 font-mono text-sm"
              variants={animate ? FADE_UP : undefined}
            >
              {/* role: */}
              <div>
                <span className="text-fg3">role: </span>
                <span className="text-fg">&quot;{identity.title}&quot;</span>
              </div>

              {/* stack: chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-fg3">stack: </span>
                {heroSkills.map((skill) => (
                  <Chip key={skill}>{skill.toLowerCase()}</Chip>
                ))}
              </div>

              {/* status: online */}
              <div className="flex items-center gap-2">
                <span className="text-fg3">status: </span>
                <span className="text-fg">online</span>
                <Node pulse />
              </div>
            </motion.div>

            {/* Telemetry footer */}
            <motion.p
              className="font-mono text-xs text-fg3"
              variants={animate ? FADE_UP : undefined}
            >
              {telemetry}
            </motion.p>

          </motion.div>
        </div>
      </ConsolePanel>

      {/* Scroll cue — absolute bottom-center → #snapshot */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <ScrollCue targetId="snapshot" />
      </div>
    </section>
  );
}

export default Hero;

/* ── Wordmark shadow constants (authorized raw values per design spec §2) ── */

const WORDMARK_SHADOW =
  '0 1px 0 rgba(133,174,191,.9), 0 2px 0 rgba(110,148,164,.85), 0 3px 0 rgba(88,120,135,.8), 0 4px 0 rgba(66,92,105,.74), 0 5px 0 rgba(48,68,78,.68), 0 6px 2px rgba(0,0,0,.5), 0 0 34px rgba(178,213,229,.5), 0 12px 28px rgba(0,0,0,.65)';

const WORDMARK_SHADOW_GLOW =
  '0 1px 0 rgba(133,174,191,.9), 0 2px 0 rgba(110,148,164,.85), 0 3px 0 rgba(88,120,135,.8), 0 4px 0 rgba(66,92,105,.74), 0 5px 0 rgba(48,68,78,.68), 0 6px 2px rgba(0,0,0,.5), 0 0 48px rgba(178,213,229,.7), 0 12px 28px rgba(0,0,0,.65)';
