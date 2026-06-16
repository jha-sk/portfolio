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

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import { identity } from '@/data/identity';
import { stats } from '@/data/stats';
import { links } from '@/data/links';
import { SystemFallback } from './system-fallback';
import { SectionPanel } from './section-panel';

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

function HudTopRight() {
  return (
    <div
      className="absolute right-5 top-5 z-10 flex flex-wrap justify-end gap-2"
      style={{ maxWidth: '62vw', pointerEvents: 'none' }}
      aria-label="System telemetry"
    >
      {stats.map((s) => (
        <span
          key={s.id}
          className="rounded-full border px-3 py-1 font-mono text-[10px]"
          style={{ borderColor: 'rgba(178,213,229,0.2)', color: 'rgba(178,213,229,0.6)' }}
        >
          {s.id} <b style={{ color: 'var(--fg)' }}>{s.value}</b>
        </span>
      ))}
    </div>
  );
}

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

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] overflow-hidden"
      style={{ background: 'var(--bg)' }}
      aria-label="Career OS system topology — interactive 3D landing"
    >
      {/* Canvas (lazy, client-only, replaced by fallback during load/reduced-motion) */}
      <CanvasOrFallback active={active} onSelect={setActive} />

      {/* HUD overlay — pointer-events-none DOM layer (SSR'd for SEO) */}
      <HudTopLeft />
      <HudTopRight />
      <HudCenter />
      <HudNav active={active} onSelect={setActive} />
      <HudHint />

      {/* Glass section panel — slides in from right when a section is active */}
      <SectionPanel active={active} onClose={() => setActive(null)} />
    </section>
  );
}

export default SystemHero;
