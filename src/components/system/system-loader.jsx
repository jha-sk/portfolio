'use client';

/**
 * SystemLoader — "COLD START" boot sequence shown while the 3D scene chunk
 * downloads. Concept: the loader drafts the system topology itself — a core
 * wires itself to satellite nodes (edges draw in via stroke-dashoffset),
 * packets begin to flow, scan rings sweep, and a terminal boot-log compiles —
 * a live preview of the OS assembling before the WebGL world takes over.
 *
 * Engineering/aviation cold-start aesthetic. Strictly dichromatic
 * (#020202 + #B2D5E5 tiers + near-white). Motion is CSS-only except a single
 * asymptotic progress counter. HUD corner brackets frame the viewport.
 *
 * SEO: identity stays in the DOM (visually hidden) for crawlers on SSR.
 */

import { useEffect, useState } from 'react';
import { identity } from '@/data/identity';

const SR_ONLY = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
};

// 6 satellite nodes evenly around the core (center 100,100, radius 66).
const NODES = Array.from({ length: 6 }, (_, i) => {
  const a = (-90 + i * 60) * (Math.PI / 180);
  const x = 100 + 66 * Math.cos(a);
  const y = 100 + 66 * Math.sin(a);
  return { x: +x.toFixed(2), y: +y.toFixed(2), tx: +(x - 100).toFixed(2), ty: +(y - 100).toFixed(2), d: i * 0.16 };
});

const BOOT_LOG = [
  '> cold start',
  '> init core ............ ok',
  '> linking services [6/6]',
  '> mounting datastore',
  '> compiling shaders',
  '> system online',
];

export function SystemLoader() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    // Asymptotic fake-progress — approaches but never reaches 100 until unmount.
    const id = setInterval(() => {
      setPct((p) => (p >= 99 ? 99 : p + (99 - p) * 0.09 + 0.4));
    }, 90);
    return () => clearInterval(id);
  }, []);

  const shown = Math.min(99, Math.round(pct));

  return (
    <div
      role="status"
      aria-label="Loading interactive system"
      style={{
        position: 'absolute', inset: 0, zIndex: 45, background: '#020202',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', fontFamily: 'var(--font-mono, var(--font-jetbrains-mono, monospace))',
      }}
    >
      <style>{`
        @keyframes sl-grid   { to { background-position: 0 40px; } }
        @keyframes sl-draw   { from { stroke-dashoffset: 66; } 60%,100% { stroke-dashoffset: 0; } }
        @keyframes sl-pop    { 0%,40% { transform: scale(0); } 70% { transform: scale(1.35); } 100% { transform: scale(1); } }
        @keyframes sl-packet { 0% { transform: translate(0,0); opacity: 0; }
                               12% { opacity: 1; } 88% { opacity: 1; }
                               100% { transform: translate(var(--tx), var(--ty)); opacity: 0; } }
        @keyframes sl-scan   { 0% { transform: scale(1); opacity: .55; } 100% { transform: scale(11); opacity: 0; } }
        @keyframes sl-spin   { to { transform: rotate(360deg); } }
        @keyframes sl-corepulse { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
        @keyframes sl-blink  { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        @keyframes sl-logwrite { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes sl-wordmark { from { opacity: 0; letter-spacing: .5em; } to { opacity: 1; letter-spacing: .14em; } }
        @media (prefers-reduced-motion: reduce) {
          .sl-anim, .sl-anim * { animation-duration: .001ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      {/* drifting grid */}
      <div
        aria-hidden="true"
        className="sl-anim"
        style={{
          position: 'absolute', inset: 0, opacity: 0.1,
          backgroundImage:
            'linear-gradient(rgba(178,213,229,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(178,213,229,.5) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
          animation: 'sl-grid 3s linear infinite',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 45%, black 18%, transparent 80%)',
          maskImage: 'radial-gradient(ellipse 70% 65% at 50% 45%, black 18%, transparent 80%)',
        }}
      />
      {/* vignette */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.65) 100%)' }} />

      {/* HUD corner brackets */}
      {['tl', 'tr', 'bl', 'br'].map((c) => {
        const e = '1px solid rgba(178,213,229,0.35)';
        const s = { position: 'absolute', width: 22, height: 22 };
        const pos =
          c === 'tl' ? { top: 22, left: 22, borderTop: e, borderLeft: e } :
          c === 'tr' ? { top: 22, right: 22, borderTop: e, borderRight: e } :
          c === 'bl' ? { bottom: 22, left: 22, borderBottom: e, borderLeft: e } :
                       { bottom: 22, right: 22, borderBottom: e, borderRight: e };
        return <span key={c} aria-hidden="true" style={{ ...s, ...pos }} />;
      })}

      {/* top status line */}
      <div style={{ position: 'absolute', top: 26, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(178,213,229,0.55)' }}>
        <span className="sl-anim" style={{ width: 6, height: 6, borderRadius: '50%', background: '#B2D5E5', boxShadow: '0 0 8px #B2D5E5', animation: 'sl-blink 1.1s steps(2,end) infinite' }} />
        {identity.name} {'// cold start'}
      </div>

      {/* percentage — top-right HUD */}
      <div style={{ position: 'absolute', top: 50, right: 28, textAlign: 'right' }}>
        <div style={{ fontSize: 30, fontWeight: 300, color: '#eaf6fb', letterSpacing: '0.04em', lineHeight: 1 }}>
          {String(shown).padStart(2, '0')}<span style={{ fontSize: 13, color: 'rgba(178,213,229,0.5)' }}>%</span>
        </div>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(178,213,229,0.4)', marginTop: 2 }}>booting</div>
      </div>

      {/* ── Topology draft ─────────────────────────────────────────────── */}
      <svg width="240" height="240" viewBox="0 0 200 200" className="sl-anim" aria-hidden="true" style={{ overflow: 'visible' }}>
        {/* scan rings */}
        <circle cx="100" cy="100" r="8" fill="none" stroke="#B2D5E5" strokeWidth="0.8" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'sl-scan 2.4s ease-out infinite' }} />
        <circle cx="100" cy="100" r="8" fill="none" stroke="#B2D5E5" strokeWidth="0.8" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'sl-scan 2.4s ease-out infinite', animationDelay: '1.2s' }} />

        {/* edges (draw in) */}
        {NODES.map((n, i) => (
          <line
            key={`e${i}`}
            x1="100" y1="100" x2={n.x} y2={n.y}
            stroke="rgba(178,213,229,0.5)" strokeWidth="1"
            strokeDasharray="66" strokeDashoffset="66"
            style={{ animation: 'sl-draw 1.1s ease forwards', animationDelay: `${n.d}s` }}
          />
        ))}

        {/* packets (flow after wiring) */}
        {NODES.map((n, i) => (
          <circle
            key={`p${i}`}
            cx="100" cy="100" r="2.2" fill="#eaf6fb"
            style={{
              '--tx': `${n.tx}px`, '--ty': `${n.ty}px`,
              animation: 'sl-packet 1.8s linear infinite',
              animationDelay: `${1 + n.d}s`,
              filter: 'drop-shadow(0 0 4px rgba(178,213,229,0.9))',
            }}
          />
        ))}

        {/* satellite nodes (pop in) */}
        {NODES.map((n, i) => (
          <g key={`n${i}`} style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'sl-pop .7s cubic-bezier(.16,1,.3,1) forwards', animationDelay: `${0.5 + n.d}s`, transform: 'scale(0)' }}>
            <circle cx={n.x} cy={n.y} r="4.5" fill="#0a141a" stroke="#B2D5E5" strokeWidth="1.2" />
            <circle cx={n.x} cy={n.y} r="1.6" fill="#B2D5E5" />
          </g>
        ))}

        {/* rotating reticle around core */}
        <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'sl-spin 8s linear infinite' }}>
          <circle cx="100" cy="100" r="15" fill="none" stroke="rgba(178,213,229,0.3)" strokeWidth="1" strokeDasharray="10 8" />
        </g>

        {/* core */}
        <g className="sl-anim" style={{ animation: 'sl-corepulse 1.8s ease-in-out infinite' }}>
          <circle cx="100" cy="100" r="9" fill="#0a141a" stroke="#B2D5E5" strokeWidth="1.4" />
          <circle cx="100" cy="100" r="4" fill="#eaf6fb" style={{ filter: 'drop-shadow(0 0 6px rgba(178,213,229,1))' }} />
        </g>
      </svg>

      {/* wordmark */}
      <div
        className="sl-anim"
        style={{
          marginTop: 18, fontFamily: 'var(--font-sans, sans-serif)',
          fontSize: 'clamp(22px,4vw,34px)', fontWeight: 700, textTransform: 'uppercase',
          color: '#eaf6fb', letterSpacing: '0.14em',
          textShadow: '0 0 24px rgba(178,213,229,0.35)',
          animation: 'sl-wordmark 1s ease forwards',
        }}
      >
        {identity.name}
      </div>

      {/* progress rail */}
      <div style={{ position: 'relative', width: 240, height: 1.5, marginTop: 16, background: 'rgba(178,213,229,0.14)', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', inset: 0, width: `${shown}%`, background: 'linear-gradient(90deg, rgba(178,213,229,0.4), #eaf6fb)', boxShadow: '0 0 10px rgba(178,213,229,0.6)', transition: 'width .2s ease' }} />
      </div>

      {/* boot log */}
      <div style={{ marginTop: 22, width: 240, fontSize: 10.5, lineHeight: 1.85, color: 'rgba(178,213,229,0.5)' }}>
        {BOOT_LOG.map((line, i) => {
          const last = i === BOOT_LOG.length - 1;
          return (
            <div
              key={i}
              className="sl-anim"
              style={{
                opacity: 0,
                color: last ? '#eaf6fb' : 'rgba(178,213,229,0.5)',
                textShadow: last ? '0 0 12px rgba(178,213,229,0.6)' : 'none',
                animation: 'sl-logwrite .45s ease forwards',
                animationDelay: `${0.25 + i * 0.42}s`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>

      {/* SEO: identity in the DOM (visually hidden) */}
      <div style={SR_ONLY}>
        <h1>{identity.name}</h1>
        <p>{identity.title}</p>
        <p>{identity.tagline}</p>
      </div>
    </div>
  );
}

export default SystemLoader;
