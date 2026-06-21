/**
 * SystemFallback — server-renderable, no-WebGL static experience.
 *
 * Used in three cases:
 *   1. While the Canvas is loading (SSR + lazy hydration gap)
 *   2. When prefers-reduced-motion is set (motion disabled path)
 *   3. When WebGL is unavailable
 *
 * Contains identity.name + role + telemetry in initial HTML for SEO.
 * Also renders all real content sections AFTER the graph for crawlers,
 * no-JS visitors, and the reduced-motion path (progressive enhancement).
 * Dichromatic only — no raw colors, CSS vars throughout.
 */

import { identity } from '@/data/identity';
import { stats } from '@/data/stats';

import { Snapshot } from '@/components/sections/snapshot';
import { About } from '@/components/sections/about';
import { Skills } from '@/components/sections/skills';
import { Experience } from '@/components/sections/experience';
import { Projects } from '@/components/sections/projects';
import { CertsEducation } from '@/components/sections/certs-education';
import { Contact } from '@/components/sections/contact';

const FALLBACK_SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'credentials', label: 'Certs' },
  { id: 'contact', label: 'Contact' },
];

/* ── Static node positions for the SVG node graph ─────────────────────── */
const SVG_NODES = [
  { x: 250, y: 150, label: 'core',        r: 18, primary: true  },
  { x: 130, y: 230, label: 'gateway',     r: 10 },
  { x: 370, y: 230, label: 'api · Go',    r: 10 },
  { x: 140, y: 100, label: 'cloud · k8s', r: 10 },
  { x: 360, y: 100, label: 'worker · tf', r: 10 },
  { x: 250, y: 290, label: 'postgres',    r: 10 },
];

const SVG_EDGES = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 5], [2, 5],
];

export function SystemFallback() {
  return (
    <>
      {/* Cheap, GPU-light motion — disabled under reduced-motion via media query. */}
      <style>{`
        @keyframes fb-node-pulse {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }
        .fb-node { animation: fb-node-pulse 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .fb-node { animation: none; }
        }
      `}</style>

      {/* Sticky section nav — the low-tier replacement for 3D click-to-navigate. */}
      <nav
        aria-label="Sections"
        className="sticky top-0 z-30 w-full overflow-x-auto"
        style={{
          background: 'rgba(2,2,2,0.72)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(178,213,229,0.14)',
        }}
      >
        <ul className="mx-auto flex w-max max-w-content items-center gap-1 px-3 py-2.5">
          {FALLBACK_SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="block whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ color: 'rgba(178,213,229,0.7)' }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Hero / graph section ─────────────────────────────────────────── */}
      <div
        className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        {/* Ambient glow blob */}
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

        {/* Grid overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(178,213,229,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(178,213,229,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '34px 34px',
          }}
        />

        {/* Static SVG node graph */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
          <svg
            viewBox="0 0 500 380"
            width="min(500px, 90vw)"
            height="auto"
            aria-hidden="true"
            fill="none"
          >
            {/* edges */}
            {SVG_EDGES.map(([a, b], i) => (
              <line
                key={i}
                x1={SVG_NODES[a].x} y1={SVG_NODES[a].y}
                x2={SVG_NODES[b].x} y2={SVG_NODES[b].y}
                stroke="#B2D5E5"
                strokeWidth="0.8"
                strokeOpacity="0.5"
              />
            ))}
            {/* nodes */}
            {SVG_NODES.map((n) => (
              <g key={n.label}>
                <circle
                  cx={n.x} cy={n.y} r={n.r}
                  stroke="#B2D5E5"
                  strokeWidth="1"
                  strokeOpacity={n.primary ? 0.9 : 0.55}
                  fill="none"
                  className="fb-node"
                  style={{ animationDelay: `${n.x * 4}ms` }}
                />
                <text
                  x={n.x} y={n.y + n.r + 12}
                  textAnchor="middle"
                  fill="#B2D5E5"
                  fillOpacity={n.primary ? 0.8 : 0.45}
                  fontSize="8"
                  fontFamily="'JetBrains Mono', monospace"
                  letterSpacing="1"
                >
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* HUD — top-left */}
        <div
          className="absolute left-5 top-5 font-mono text-xs tracking-widest"
          style={{ color: 'rgba(178,213,229,0.55)', textTransform: 'uppercase' }}
        >
          <span
            className="mr-2 inline-block h-[7px] w-[7px] rounded-full align-middle"
            style={{ background: 'var(--fg)', boxShadow: '0 0 12px var(--fg)' }}
            aria-hidden="true"
          />
          sourabh-jha://system — live topology
        </div>

        {/* HUD — top-right telemetry */}
        <div className="absolute right-5 top-5 flex flex-wrap justify-end gap-2" style={{ maxWidth: '62vw' }}>
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

        {/* Center — identity wordmark */}
        <div className="relative z-10 flex flex-col items-center gap-2 text-center">
          <h1
            className="font-sans font-bold uppercase leading-none"
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
            className="font-mono text-xs"
            style={{ color: 'rgba(178,213,229,0.6)', marginTop: '6px' }}
          >
            {identity.title}
          </p>
        </div>

        {/* Hint */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center font-mono text-[11px] tracking-[0.1em]"
          style={{ color: 'rgba(178,213,229,0.4)' }}
        >
          drag to orbit · scroll to zoom · hover a node
        </div>
      </div>

      {/* ── Full content sections (SEO + no-JS + reduced-motion) ─────────── */}
      {/*
        These sections are always in the SSR HTML, giving crawlers and
        no-JS / reduced-motion visitors the full portfolio content.
        When JS + WebGL loads, users navigate via 3D click + glass panels instead.
      */}
      <Snapshot />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <CertsEducation />
      <Contact />
    </>
  );
}

export default SystemFallback;
