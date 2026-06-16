'use client';

/**
 * SystemHero — full-viewport landing section.
 *
 * Architecture:
 *   • SSR: renders <SystemFallback> immediately — identity/telemetry in initial HTML for SEO.
 *   • Client: if motion allowed + WebGL available → lazy-load <SystemScene> (Canvas).
 *   • Reduced motion: stays on <SystemFallback> indefinitely (static, no animation).
 *   • HUD overlay (pointer-events-none) is real DOM so name/role are in the page for crawlers.
 *
 * Click-to-navigate:
 *   • `active` state (section id | null) is lifted here.
 *   • Passed to SystemScene (camera fly-to) and SectionPanel (glass drawer).
 *   • HUD nav buttons provide keyboard/mouse access to all sections incl. Contact.
 *
 * Dichromatic contract: CSS vars only in DOM layer; ICE hex only in Three.js layer (in system-scene).
 */

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion, motion, AnimatePresence } from 'framer-motion';
import { identity } from '@/data/identity';
import { links } from '@/data/links';
import { SystemFallback } from './system-fallback';
import { SectionPanel } from './section-panel';
import { LiveTelemetry } from './live-telemetry';

/* Lazy-load the Canvas — never SSR'd (WebGL requires browser) */
const SystemScene = dynamic(() => import('./system-scene'), {
  ssr: false,
  loading: () => <SystemFallback />,
});

/* ── HUD nav sections ────────────────────────────────────────────────────── */
const NAV_SECTIONS = [
  { id: 'about',      label: 'About'      },
  { id: 'skills',     label: 'Skills'     },
  { id: 'projects',   label: 'Projects'   },
  { id: 'experience', label: 'Experience' },
  { id: 'contact',    label: 'Contact'    },
];

/* ── HUD Overlay ─────────────────────────────────────────────────────────── */

function HudTopLeft() {
  return (
    <div
      className="absolute left-5 top-5 z-10 font-mono text-[11px] tracking-[0.18em] uppercase"
      style={{ color: 'rgba(178,213,229,0.55)', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* blinking dot */}
      <style>{`
        @keyframes sys-blink { 50% { opacity: 0.35; } }
        .sys-dot { animation: sys-blink 1.6s ease-in-out infinite; }
      `}</style>
      <span
        className="sys-dot mr-2 inline-block h-[7px] w-[7px] rounded-full align-middle"
        style={{ background: 'var(--fg)', boxShadow: '0 0 12px var(--fg)' }}
      />
      career-os://system — live topology
    </div>
  );
}

/* HudTopRight is now replaced by LiveTelemetry (see bottom of file). */

function HudCenter() {
  return (
    <div
      className="absolute bottom-16 left-1/2 z-10 -translate-x-1/2 text-center"
      style={{ pointerEvents: 'none' }}
    >
      <p
        className="font-mono text-[10px] tracking-[0.26em] uppercase"
        style={{ color: 'rgba(178,213,229,0.5)' }}
        aria-hidden="true"
      >
        {'// core · online'}
      </p>

      {/* SEO-critical: name + title in real DOM, always rendered */}
      <h1
        className="mt-2 font-sans uppercase leading-none"
        style={{
          fontSize: 'clamp(30px,5.4vw,56px)',
          fontWeight: 700,
          letterSpacing: '0.03em',
          color: '#eaf6fb',
          textShadow: '0 0 22px rgba(178,213,229,0.4), 0 8px 22px rgba(0,0,0,0.7)',
        }}
      >
        {identity.name}
      </h1>

      <p
        className="mt-2 font-mono text-xs"
        style={{ color: 'rgba(178,213,229,0.6)' }}
      >
        {identity.title}
      </p>
    </div>
  );
}

function HudHint() {
  return (
    <p
      className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center font-mono text-[11px] tracking-[0.1em]"
      style={{ color: 'rgba(178,213,229,0.4)', pointerEvents: 'none' }}
      aria-label="Interaction hint: drag to orbit, scroll to zoom, click a node to explore"
    >
      drag to orbit · scroll to zoom · click a node
    </p>
  );
}

/* ── HUD Nav (bottom-center) ─────────────────────────────────────────────── */
function HudNav({ active, onSelect }) {
  return (
    <nav
      aria-label="Career OS navigation"
      className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2"
      style={{ pointerEvents: 'auto' }}
    >
      <ul
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '6px',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {NAV_SECTIONS.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                onClick={() => onSelect(id)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  fontFamily: 'var(--font-jetbrains-mono, monospace)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${isActive ? 'rgba(178,213,229,0.55)' : 'rgba(178,213,229,0.18)'}`,
                  background: isActive ? 'rgba(178,213,229,0.1)' : 'transparent',
                  color: isActive ? '#eaf6fb' : 'rgba(178,213,229,0.55)',
                  cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s, background 0.15s',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#eaf6fb';
                    e.currentTarget.style.borderColor = 'rgba(178,213,229,0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(178,213,229,0.55)';
                    e.currentTarget.style.borderColor = 'rgba(178,213,229,0.18)';
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid rgba(178,213,229,0.6)';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                {label}
              </button>
            </li>
          );
        })}

        {/* Résumé download link */}
        <li>
          <a
            href={links.resume}
            download
            style={{
              fontFamily: 'var(--font-jetbrains-mono, monospace)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              padding: '5px 12px',
              borderRadius: '4px',
              border: '1px solid rgba(178,213,229,0.35)',
              background: 'rgba(178,213,229,0.06)',
              color: '#B2D5E5',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'color 0.15s, border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#eaf6fb';
              e.currentTarget.style.borderColor = 'rgba(178,213,229,0.7)';
              e.currentTarget.style.background = 'rgba(178,213,229,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#B2D5E5';
              e.currentTarget.style.borderColor = 'rgba(178,213,229,0.35)';
              e.currentTarget.style.background = 'rgba(178,213,229,0.06)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid rgba(178,213,229,0.6)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            Résumé ↓
          </a>
        </li>
      </ul>
    </nav>
  );
}

/* ── Boot sequence log lines ─────────────────────────────────────────────── */
const BOOT_LINES = [
  '> initializing core…',
  '> linking services [6/6]',
  '> mounting database',
  '> system online',
];

// Total duration budget: ~2 s. Each line gets ~400 ms; overlay fades after last line.
const LINE_DELAY_MS  = 380;  // gap between each revealed line
const FADE_DELAY_MS  = 200;  // pause after last line before fade starts
const FADE_DURATION  = 0.35; // seconds for overlay exit fade

/**
 * BootSequence — a brief "connect" log overlay shown once on first mount.
 * Only rendered when motion is allowed (client-side check handled by caller).
 * pointer-events-none; unmounted after fade so it never blocks interaction.
 */
function BootSequence() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);

  // Skip via any pointer/key event
  const skip = useCallback(() => setDone(true), []);

  useEffect(() => {
    const timers = [];

    BOOT_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setVisibleCount(i + 1);
        if (i === BOOT_LINES.length - 1) {
          // Pause then mark done (triggers AnimatePresence exit)
          timers.push(setTimeout(() => setDone(true), FADE_DELAY_MS));
        }
      }, (i + 1) * LINE_DELAY_MS));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
    };
  }, [skip]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_DURATION, ease: 'easeOut' }}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '0 8vw',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-jetbrains-mono, monospace)',
              fontSize: 'clamp(11px, 1.4vw, 14px)',
              lineHeight: 1.9,
              letterSpacing: '0.06em',
            }}
          >
            {BOOT_LINES.slice(0, visibleCount).map((line, i) => {
              const isLast = i === BOOT_LINES.length - 1;
              return (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{
                    color: isLast ? '#eaf6fb' : 'rgba(178,213,229,0.65)',
                    textShadow: isLast
                      ? '0 0 18px rgba(178,213,229,0.7)'
                      : 'none',
                  }}
                >
                  {line}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Client canvas guard ──────────────────────────────────────────────────── */

function CanvasOrFallback({ active, onSelect }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <SystemFallback />;
  }

  return (
    <div className="absolute inset-0">
      <SystemScene active={active} onSelect={onSelect} />
    </div>
  );
}

/* ── SystemHero export ───────────────────────────────────────────────────── */

export function SystemHero() {
  const [active, setActive] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] overflow-hidden"
      style={{ background: 'var(--bg)' }}
      aria-label="Career OS system topology — interactive 3D landing"
    >
      {/* Canvas (lazy, client-only, replaced by fallback during load/reduced-motion) */}
      <CanvasOrFallback active={active} onSelect={setActive} />

      {/* Boot sequence overlay — motion-allowed path only, unmounts after ~2 s */}
      {!prefersReducedMotion && <BootSequence />}

      {/* HUD overlay — pointer-events-none DOM layer (SSR'd for SEO) */}
      <HudTopLeft />
      {/* Live animated telemetry replaces static HudTopRight */}
      <LiveTelemetry />
      <HudCenter />
      <HudNav active={active} onSelect={setActive} />
      <HudHint />

      {/* Glass section panel — slides in from right when a section is active */}
      <SectionPanel active={active} onClose={() => setActive(null)} />
    </section>
  );
}

export default SystemHero;
