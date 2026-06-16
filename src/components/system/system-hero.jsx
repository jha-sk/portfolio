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
 * Dichromatic contract: CSS vars only in DOM layer; ICE hex only in Three.js layer (in system-scene).
 */

import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import { identity } from '@/data/identity';
import { stats } from '@/data/stats';
import { SystemFallback } from './system-fallback';

/* Lazy-load the Canvas — never SSR'd (WebGL requires browser) */
const SystemScene = dynamic(() => import('./system-scene'), {
  ssr: false,
  loading: () => <SystemFallback />,
});

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
        className="mt-2 font-sans font-bold uppercase leading-none"
        style={{
          fontSize: 'clamp(28px,5vw,52px)',
          letterSpacing: '0.02em',
          color: 'var(--fg)',
          textShadow: '0 0 30px rgba(178,213,229,0.6), 0 8px 22px rgba(0,0,0,0.7)',
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
      aria-label="Interaction hint: drag to orbit, scroll to zoom, hover a node"
    >
      drag to orbit · scroll to zoom · hover a node
    </p>
  );
}

/* ── Client canvas guard ──────────────────────────────────────────────────── */

function CanvasOrFallback() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <SystemFallback />;
  }

  return (
    <div className="absolute inset-0">
      <SystemScene />
    </div>
  );
}

/* ── SystemHero export ───────────────────────────────────────────────────── */

export function SystemHero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100svh] overflow-hidden"
      style={{ background: 'var(--bg)' }}
      aria-label="Career OS system topology — interactive 3D landing"
    >
      {/* Canvas (lazy, client-only, replaced by fallback during load/reduced-motion) */}
      <CanvasOrFallback />

      {/* HUD overlay — pointer-events-none DOM layer (SSR'd for SEO) */}
      <HudTopLeft />
      <HudTopRight />
      <HudCenter />
      <HudHint />
    </section>
  );
}

export default SystemHero;
