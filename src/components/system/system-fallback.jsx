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
import { links } from '@/data/links';

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
        html { scroll-padding-top: 64px; }
        @keyframes fb-node-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes fb-edge-flow { to { stroke-dashoffset: -20; } }
        .fb-node { animation: fb-node-pulse 2.4s ease-in-out infinite; }
        .fb-edge { stroke-dasharray: 3 7; animation: fb-edge-flow 1.4s linear infinite; }
        .fb-cta { transition: background .15s, border-color .15s, color .15s, transform .15s; }
        .fb-cta:hover { transform: translateY(-1px); }
        .fb-cta--primary:hover { background: rgba(178,213,229,0.22); border-color: rgba(178,213,229,0.5); }
        .fb-cta--ghost:hover { background: rgba(178,213,229,0.08); border-color: rgba(178,213,229,0.4); color: #eaf6fb; }
        .fb-nav-link { transition: color .15s, background .15s; }
        .fb-nav-link:hover { color: #eaf6fb; background: rgba(178,213,229,0.08); }
        @media (prefers-reduced-motion: reduce) {
          .fb-node, .fb-edge { animation: none; }
          .fb-cta:hover { transform: none; }
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
                className="fb-nav-link block whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ color: 'rgba(178,213,229,0.7)' }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header
        className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-5 py-24"
        style={{ background: 'var(--bg)' }}
      >
        {/* Ambient glow blobs */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            left: '50%', top: '44%', transform: 'translate(-50%,-50%)',
            width: 'min(72vw, 760px)', height: 'min(62vh, 560px)',
            background: 'rgba(178,213,229,0.05)', filter: 'blur(130px)',
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            left: '20%', top: '82%', transform: 'translate(-50%,-50%)',
            width: 'min(46vw, 460px)', height: 'min(34vh, 340px)',
            background: 'rgba(178,213,229,0.035)', filter: 'blur(120px)',
          }}
        />

        {/* Grid overlay — radially faded so edges don't read as a hard box */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(178,213,229,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(178,213,229,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 82%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 82%)',
          }}
        />

        {/* Constellation backdrop — large, framing the content; edges flow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-50">
          <svg
            viewBox="0 0 500 380"
            width="min(1100px, 150vw)"
            height="auto"
            aria-hidden="true"
            fill="none"
            style={{ filter: 'drop-shadow(0 0 12px rgba(178,213,229,0.25))' }}
          >
            {SVG_EDGES.map(([a, b], i) => (
              <line
                key={i}
                x1={SVG_NODES[a].x} y1={SVG_NODES[a].y}
                x2={SVG_NODES[b].x} y2={SVG_NODES[b].y}
                stroke="#B2D5E5"
                strokeWidth="0.7"
                strokeOpacity="0.4"
                className="fb-edge"
              />
            ))}
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
                {n.primary && (
                  <circle cx={n.x} cy={n.y} r={n.r * 0.4} fill="#B2D5E5" fillOpacity="0.5" className="fb-node" />
                )}
                <text
                  x={n.x} y={n.y + n.r + 12}
                  textAnchor="middle"
                  fill="#B2D5E5"
                  fillOpacity={n.primary ? 0.7 : 0.4}
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

        {/* top-left HUD label */}
        <div
          className="absolute left-5 top-4 hidden font-mono text-[11px] tracking-[0.2em] sm:block"
          style={{ color: 'rgba(178,213,229,0.5)', textTransform: 'uppercase' }}
        >
          <span
            className="mr-2 inline-block h-[7px] w-[7px] rounded-full align-middle"
            style={{ background: 'var(--fg)', boxShadow: '0 0 12px var(--fg)' }}
            aria-hidden="true"
          />
          sourabh-jha://system — live topology
        </div>

        {/* Center content */}
        <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-6 text-center">
          {/* availability eyebrow */}
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ background: 'rgba(178,213,229,0.07)', border: '1px solid rgba(178,213,229,0.2)' }}
          >
            <span
              className="status-pulse inline-block h-[7px] w-[7px] rounded-full"
              style={{ background: 'var(--fg)', boxShadow: '0 0 8px var(--fg)' }}
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(178,213,229,0.8)' }}>
              Open to AI · Backend roles
            </span>
          </span>

          {/* name */}
          <h1
            className="font-sans font-bold uppercase leading-[0.95]"
            style={{
              fontSize: 'clamp(40px,8vw,88px)',
              letterSpacing: '0.01em',
              color: 'var(--fg)',
              textShadow: '0 0 40px rgba(178,213,229,0.45), 0 8px 30px rgba(0,0,0,0.8)',
            }}
          >
            {identity.name}
          </h1>

          {/* role */}
          <p className="font-mono text-xs uppercase tracking-[0.22em] sm:text-sm" style={{ color: 'rgba(178,213,229,0.65)' }}>
            {identity.title}
          </p>

          {/* tagline */}
          <p className="max-w-xl font-sans text-base leading-relaxed sm:text-lg" style={{ color: 'rgba(178,213,229,0.78)' }}>
            {identity.tagline}
          </p>

          {/* CTAs */}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#projects"
              className="fb-cta fb-cta--primary rounded-full px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ background: 'rgba(178,213,229,0.14)', border: '1px solid rgba(178,213,229,0.3)', color: '#eaf6fb' }}
            >
              View Projects →
            </a>
            <a
              href={links.resume}
              download
              className="fb-cta fb-cta--ghost rounded-full px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ background: 'transparent', border: '1px solid rgba(178,213,229,0.2)', color: 'rgba(178,213,229,0.82)' }}
            >
              Résumé ↓
            </a>
            <a
              href="#contact"
              className="fb-cta fb-cta--ghost rounded-full px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ background: 'transparent', border: '1px solid rgba(178,213,229,0.2)', color: 'rgba(178,213,229,0.82)' }}
            >
              Get in touch
            </a>
          </div>

          {/* featured stats */}
          <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <div
                key={s.id}
                className="rounded-xl px-3 py-3 text-left"
                style={{ background: 'rgba(10,18,23,0.4)', border: '1px solid rgba(178,213,229,0.12)' }}
              >
                <p className="font-sans text-xl font-bold leading-none sm:text-2xl" style={{ color: 'var(--fg)' }}>
                  {s.value}
                </p>
                <p className="mt-1.5 font-mono text-[9px] uppercase leading-tight tracking-[0.1em]" style={{ color: 'rgba(178,213,229,0.5)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* scroll cue */}
        <a
          href="#about"
          className="fb-nav-link absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: 'rgba(178,213,229,0.5)' }}
        >
          scroll to explore ↓
        </a>
      </header>

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
