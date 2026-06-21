/**
 * SystemFallback — server-renderable, no-WebGL static experience.
 *
 * Used in three cases:
 *   1. While the Canvas is loading (SSR + lazy hydration gap)
 *   2. When prefers-reduced-motion is set (motion disabled path)
 *   3. When WebGL is unavailable / low-tier device
 *
 * Design: refined minimal "boot screen" hero — the identity framed by a
 * target-lock reticle (echoing the site's custom cursor) over a single calm
 * ambient layer, with a staggered load reveal. Strictly dichromatic
 * (#020202 / #B2D5E5). Server component — no JS handlers; motion is CSS only
 * and fully gated by prefers-reduced-motion. All content sections render
 * below for SEO / no-JS / reduced-motion visitors.
 */

import { identity } from '@/data/identity';
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

/* ── Target-lock reticle corner (echoes CustomCursor's corner brackets) ──── */
const CORNER = 26;
function cornerStyle(pos) {
  const edge = '1px solid rgba(178,213,229,0.45)';
  const base = {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    filter: 'drop-shadow(0 0 6px rgba(178,213,229,0.35))',
  };
  if (pos === 'tl') return { ...base, top: -1, left: -1, borderTop: edge, borderLeft: edge };
  if (pos === 'tr') return { ...base, top: -1, right: -1, borderTop: edge, borderRight: edge };
  if (pos === 'bl') return { ...base, bottom: -1, left: -1, borderBottom: edge, borderLeft: edge };
  return { ...base, bottom: -1, right: -1, borderBottom: edge, borderRight: edge };
}

export function SystemFallback() {
  return (
    <>
      {/* Cheap, GPU-light motion — fully disabled under reduced-motion. */}
      <style>{`
        html { scroll-padding-top: 64px; }
        @keyframes fb-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes fb-spin { to { transform: rotate(360deg); } }
        .fb-rise { opacity: 0; animation: fb-rise .8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fb-ring { transform-origin: center; animation: fb-spin 60s linear infinite; }
        .fb-cta { transition: background .15s, border-color .15s, color .15s, transform .15s; }
        .fb-cta:hover { transform: translateY(-1px); }
        .fb-cta--primary:hover { background: rgba(178,213,229,0.2); border-color: rgba(178,213,229,0.5); }
        .fb-cta--ghost:hover { color: #eaf6fb; }
        .fb-nav-link { transition: color .15s, background .15s; }
        .fb-nav-link:hover { color: #eaf6fb; background: rgba(178,213,229,0.08); }
        @media (prefers-reduced-motion: reduce) {
          .fb-rise { opacity: 1; animation: none; }
          .fb-ring { animation: none; }
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
        className="relative flex min-h-[calc(100svh-49px)] w-full flex-col items-center justify-center overflow-hidden px-6 py-20"
        style={{ background: 'var(--bg)' }}
      >
        {/* Single soft ambient glow */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
            width: 'min(58vw, 620px)', height: 'min(58vw, 620px)',
            background: 'rgba(178,213,229,0.045)', filter: 'blur(130px)',
          }}
        />

        {/* One calm ambient layer — slow concentric rings (radar/core echo) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <svg
            className="fb-ring"
            width="min(760px, 116vw)"
            height="min(760px, 116vw)"
            viewBox="0 0 760 760"
            aria-hidden="true"
            fill="none"
          >
            <circle cx="380" cy="380" r="200" stroke="#B2D5E5" strokeOpacity="0.05" strokeWidth="1" />
            <circle cx="380" cy="380" r="300" stroke="#B2D5E5" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="2 10" />
            <circle cx="380" cy="380" r="378" stroke="#B2D5E5" strokeOpacity="0.04" strokeWidth="1" />
          </svg>
        </div>

        {/* Identity column — plain block (not flex), so text children take full
            width and wrap instead of shrink-to-fitting and overflowing. */}
        <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
          {/* availability */}
          <span
            className="fb-rise inline-flex items-center gap-2"
            style={{ animationDelay: '0ms' }}
          >
            <span
              className="status-pulse inline-block h-[6px] w-[6px] rounded-full"
              style={{ background: 'var(--fg)', boxShadow: '0 0 8px var(--fg)' }}
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: 'rgba(178,213,229,0.55)' }}>
              Open to AI · Backend roles
            </span>
          </span>

          {/* name in a target-lock reticle */}
          <div
            className="fb-rise relative mt-8 inline-block max-w-full"
            style={{ animationDelay: '90ms', padding: 'clamp(14px,3vw,40px) clamp(16px,4vw,60px)' }}
          >
            <span aria-hidden="true" style={cornerStyle('tl')} />
            <span aria-hidden="true" style={cornerStyle('tr')} />
            <span aria-hidden="true" style={cornerStyle('bl')} />
            <span aria-hidden="true" style={cornerStyle('br')} />
            <h1
              className="font-sans font-bold uppercase leading-[0.95]"
              style={{
                fontSize: 'clamp(30px,8vw,80px)',
                letterSpacing: '0.01em',
                color: 'var(--fg)',
                textShadow: '0 0 44px rgba(178,213,229,0.4), 0 8px 30px rgba(0,0,0,0.85)',
              }}
            >
              {identity.name}
            </h1>
          </div>

          {/* role */}
          <p
            className="fb-rise mt-7 w-full font-mono text-[9px] uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.3em]"
            style={{ animationDelay: '170ms', color: 'rgba(178,213,229,0.6)' }}
          >
            {identity.title}
          </p>

          {/* tagline */}
          <p
            className="fb-rise mx-auto mt-4 font-sans text-[14px] leading-relaxed sm:text-base"
            style={{ animationDelay: '250ms', color: 'rgba(178,213,229,0.72)', maxWidth: 'min(24rem, calc(100vw - 56px))' }}
          >
            {identity.tagline}
          </p>

          {/* CTAs — two, restrained */}
          <div className="fb-rise mt-9 flex items-center justify-center gap-5" style={{ animationDelay: '330ms' }}>
            <a
              href="#projects"
              className="fb-cta fb-cta--primary rounded-full px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ background: 'rgba(178,213,229,0.12)', border: '1px solid rgba(178,213,229,0.28)', color: '#eaf6fb' }}
            >
              View work →
            </a>
            <a
              href={links.resume}
              download
              className="fb-cta fb-cta--ghost font-mono text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ color: 'rgba(178,213,229,0.6)' }}
            >
              Résumé ↓
            </a>
          </div>
        </div>

        {/* scroll cue */}
        <a
          href="#about"
          className="fb-rise fb-nav-link absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em]"
          style={{ animationDelay: '480ms', color: 'rgba(178,213,229,0.4)' }}
        >
          scroll ↓
        </a>
      </header>

      {/* ── Full content sections (SEO + no-JS + reduced-motion) ─────────── */}
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
