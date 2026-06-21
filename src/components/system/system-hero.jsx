'use client';

/**
 * SystemHero — full-viewport landing section.
 *
 * Layout zones (no overlap):
 *   • top-left    — status pill (glass)
 *   • top-right   — live telemetry (glass)
 *   • upper-center— identity block (eyebrow / wordmark / role / hint)
 *   • bottom-center — frosted-glass nav dock
 *   • right drawer — glass SectionPanel (on select)
 *
 * Progressive enhancement: SSR/reduced-motion render <SystemFallback> (content inline).
 */

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion, motion, AnimatePresence } from 'framer-motion';
import { identity } from '@/data/identity';
import { links } from '@/data/links';
import { SystemFallback } from './system-fallback';
import { SystemLoader } from './system-loader';
import { SectionPanel } from './section-panel';
import { LiveTelemetry } from './live-telemetry';
import { CommandPalette } from './command-palette';
import { CommandTerminal } from './command-terminal';
import { useDeviceTier } from '@/lib/use-device-tier';
import { TIER } from '@/lib/device-tier';

const SystemScene = dynamic(() => import('./system-scene'), {
  ssr: false,
  loading: () => <SystemLoader />,
});

const NAV_SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

/* Heavy frosted-glass surface (shared) */
const GLASS = {
  background: 'rgba(10,18,23,0.45)',
  backdropFilter: 'blur(22px) saturate(140%)',
  WebkitBackdropFilter: 'blur(22px) saturate(140%)',
  border: '1px solid rgba(178,213,229,0.18)',
  boxShadow:
    '0 10px 44px rgba(0,0,0,0.5), inset 0 1px 0 rgba(178,213,229,0.10)',
};

/* ── Top-left identity block (glass pill) ────────────────────────────────── */
function HudIdentity() {
  return (
    <div
      className="max-w-[min(72vw,380px)] shrink-0 text-left"
      style={{ ...GLASS, borderRadius: '16px', padding: '14px 18px', pointerEvents: 'none' }}
    >
      {/* SEO-critical: name + title in real DOM */}
      <h1
        className="font-sans uppercase leading-[0.95]"
        style={{
          fontSize: 'clamp(18px,2.4vw,26px)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: '#eaf6fb',
          textShadow: '0 0 18px rgba(178,213,229,0.35)',
        }}
      >
        {identity.name}
      </h1>

      <p className="mt-1.5 font-mono text-[11px] tracking-[0.06em]" style={{ color: 'rgba(178,213,229,0.6)' }}>
        {identity.title}
      </p>

      {/* Availability badge — recruiter signal */}
      <div
        className="mt-2.5 inline-flex items-center gap-2 rounded-full"
        style={{
          padding: '4px 10px',
          background: 'rgba(178,213,229,0.08)',
          border: '1px solid rgba(178,213,229,0.2)',
        }}
      >
        <span
          aria-hidden="true"
          className="status-pulse"
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--fg)',
            boxShadow: '0 0 8px var(--fg)',
          }}
        />
        <span
          className="font-mono uppercase"
          style={{ fontSize: '9.5px', letterSpacing: '0.16em', color: 'rgba(178,213,229,0.78)' }}
        >
          open to AI · Backend roles
        </span>
      </div>
    </div>
  );
}

/* ── Top control cluster (frosted glass) — guided tour + command palette ─── */
const PILL_BTN = {
  display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
  background: 'transparent', border: '1px solid transparent',
  borderRadius: '9999px', padding: '6px 12px', color: 'rgba(178,213,229,0.78)',
  fontFamily: 'var(--font-jetbrains-mono, monospace)', fontSize: 10, fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase', transition: 'background .15s, color .15s',
};

/* ── Quality chip (Low / Auto / High) ────────────────────────────────────── */
const QUALITY_OPTIONS = [
  { id: 'low',  label: 'Low'  },
  { id: 'auto', label: 'Auto' },
  { id: 'high', label: 'High' },
];

function HudQuality({ quality, onSetQuality }) {
  return (
    <div
      className="flex shrink-0 items-center gap-0.5 self-start"
      style={{ ...GLASS, borderRadius: '9999px', padding: '4px 5px', pointerEvents: 'auto' }}
      role="group"
      aria-label="Render quality"
      title="Render quality — lower this if the scene feels slow"
    >
      <span
        aria-hidden="true"
        className="px-1.5 font-mono uppercase"
        style={{ fontSize: 9, letterSpacing: '0.14em', color: 'rgba(178,213,229,0.5)' }}
      >
        gfx
      </span>
      {QUALITY_OPTIONS.map(({ id, label }) => {
        const isActive = quality === id;
        return (
          <button
            key={id}
            onClick={() => onSetQuality(id)}
            aria-pressed={isActive}
            style={{
              ...PILL_BTN,
              padding: '4px 9px',
              background: isActive ? 'rgba(178,213,229,0.16)' : 'transparent',
              color: isActive ? '#eaf6fb' : PILL_BTN.color,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function HudControls({ onOpenPalette, onToggleTour, tourActive, tourStep, tourTotal }) {
  return (
    <div
      className="flex shrink-0 items-center gap-1 self-start"
      style={{ ...GLASS, borderRadius: '9999px', padding: '5px 6px', pointerEvents: 'auto' }}
    >
      <button
        onClick={onToggleTour}
        aria-label={tourActive ? 'Stop guided tour' : 'Play guided tour'}
        style={{
          ...PILL_BTN,
          background: tourActive ? 'rgba(178,213,229,0.16)' : 'transparent',
          color: tourActive ? '#eaf6fb' : PILL_BTN.color,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(178,213,229,0.16)'; e.currentTarget.style.color = '#eaf6fb'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = tourActive ? 'rgba(178,213,229,0.16)' : 'transparent'; e.currentTarget.style.color = tourActive ? '#eaf6fb' : 'rgba(178,213,229,0.78)'; }}
      >
        {tourActive ? `■ stop ${tourStep + 1}/${tourTotal}` : '▶ tour'}
      </button>
      <span aria-hidden="true" style={{ width: 1, height: 14, background: 'rgba(178,213,229,0.2)' }} />
      <button
        onClick={onOpenPalette}
        aria-label="Open command palette"
        style={PILL_BTN}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(178,213,229,0.16)'; e.currentTarget.style.color = '#eaf6fb'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(178,213,229,0.78)'; }}
      >
        ⌘K commands
      </button>
    </div>
  );
}

/* ── Bottom interaction hint (above the dock) ────────────────────────────── */
function HudHint() {
  return (
    <p
      className="absolute bottom-[4.75rem] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
      style={{ color: 'rgba(178,213,229,0.6)', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      drag or click to explore
    </p>
  );
}

/* ── Bottom-center frosted-glass nav dock ────────────────────────────────── */
function HudDock({ active, onSelect }) {
  const btnBase = {
    fontFamily: 'var(--font-jetbrains-mono, monospace)',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    padding: '7px 13px',
    borderRadius: '9999px',
    border: '1px solid transparent',
    background: 'transparent',
    color: 'rgba(178,213,229,0.6)',
    cursor: 'pointer',
    transition: 'color .15s, background .15s',
    outline: 'none',
  };

  return (
    <nav
      aria-label="Sourabh Jha — navigation"
      className="absolute bottom-7 left-1/2 z-20 -translate-x-1/2"
      style={{ pointerEvents: 'auto', maxWidth: '94vw' }}
    >
      <ul
        className="flex flex-wrap items-center justify-center gap-1"
        style={{ listStyle: 'none', margin: 0, padding: '7px 8px', borderRadius: '9999px', ...GLASS }}
      >
        {NAV_SECTIONS.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                onClick={() => onSelect(id)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  ...btnBase,
                  background: isActive ? 'rgba(178,213,229,0.16)' : 'transparent',
                  color: isActive ? '#eaf6fb' : 'rgba(178,213,229,0.6)',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#eaf6fb'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(178,213,229,0.6)'; }}
                onFocus={(e) => { e.currentTarget.style.outline = '2px solid rgba(178,213,229,0.6)'; e.currentTarget.style.outlineOffset = '2px'; }}
                onBlur={(e) => { e.currentTarget.style.outline = 'none'; }}
              >
                {label}
              </button>
            </li>
          );
        })}
        <li aria-hidden="true" style={{ width: 1, height: 16, background: 'rgba(178,213,229,0.18)', margin: '0 2px' }} />
        <li>
          <a
            href={links.resume}
            download
            style={{
              ...btnBase,
              color: '#bfe6f5',
              background: 'rgba(178,213,229,0.1)',
              textDecoration: 'none',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#eaf6fb'; e.currentTarget.style.background = 'rgba(178,213,229,0.18)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#bfe6f5'; e.currentTarget.style.background = 'rgba(178,213,229,0.1)'; }}
            onFocus={(e) => { e.currentTarget.style.outline = '2px solid rgba(178,213,229,0.6)'; e.currentTarget.style.outlineOffset = '2px'; }}
            onBlur={(e) => { e.currentTarget.style.outline = 'none'; }}
          >
            Résumé ↓
          </a>
        </li>
      </ul>
    </nav>
  );
}

/* ── Boot sequence ───────────────────────────────────────────────────────── */
const BOOT_LINES = [
  '> initializing core…',
  '> linking services [6/6]',
  '> mounting database',
  '> system online',
];
const LINE_DELAY_MS = 380;
const FADE_DELAY_MS = 200;
const FADE_DURATION = 0.35;

function BootSequence() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);
  const skip = useCallback(() => setDone(true), []);

  useEffect(() => {
    const timers = [];
    BOOT_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setVisibleCount(i + 1);
        if (i === BOOT_LINES.length - 1) {
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
            position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'flex-start', padding: '0 8vw',
          }}
        >
          <div style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)', fontSize: 'clamp(11px,1.4vw,14px)', lineHeight: 1.9, letterSpacing: '0.06em' }}>
            {BOOT_LINES.slice(0, visibleCount).map((line, i) => {
              const isLast = i === BOOT_LINES.length - 1;
              return (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{ color: isLast ? '#eaf6fb' : 'rgba(178,213,229,0.65)', textShadow: isLast ? '0 0 18px rgba(178,213,229,0.7)' : 'none' }}
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

/* ── Tour caption (top-center, while autopilot runs) ─────────────────────── */
const TOUR_COPY = {
  about:      'The core — who Sourabh is',
  skills:     'Service mesh — the tech stack',
  projects:   'Server racks — shipped work',
  experience: 'Datastore — the track record',
  contact:    'Uplink — get in touch',
};

function TourCaption({ active, section }) {
  return (
    <AnimatePresence>
      {active && section && (
        <motion.div
          key={section}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="absolute left-1/2 top-[7.5rem] z-20 -translate-x-1/2 text-center md:top-32"
          style={{ pointerEvents: 'none' }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: 'rgba(178,213,229,0.5)' }}>
            guided tour
          </p>
          <p className="mt-1 font-mono text-sm" style={{ color: '#eaf6fb', textShadow: '0 0 18px rgba(178,213,229,0.4)' }}>
            {TOUR_COPY[section] ?? section}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Canvas guard ────────────────────────────────────────────────────────── */
/* Minimum time the boot loader stays up so the cold-start sequence always
   plays — even when the scene chunk loads instantly (e.g. localhost). */
const MIN_LOADER_MS = 3200;

function CanvasOrFallback({ active, onSelect, trace, tier }) {
  const [bootDone, setBootDone] = useState(false);

  // Hold the loader for a minimum duration before mounting the scene.
  useEffect(() => {
    const t = setTimeout(() => setBootDone(true), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, []);

  // Low tier (phones, weak GPU, reduced-motion, save-data) → static experience.
  if (tier === TIER.LOW) return <SystemFallback />;

  const quality = tier === TIER.HIGH ? 'high' : 'mid';
  return (
    <div className="absolute inset-0">
      {bootDone
        ? <SystemScene active={active} onSelect={onSelect} trace={trace} quality={quality} />
        : <SystemLoader />}
    </div>
  );
}

/* ── Export ──────────────────────────────────────────────────────────────── */
const TOUR_SEQUENCE = ['about', 'skills', 'projects', 'experience', 'contact'];
const TOUR_DWELL_MS = 4600;
const SECTION_IDS = ['about', 'skills', 'projects', 'experience', 'contact'];

export function SystemHero() {
  const [active, setActive] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [trace, setTrace] = useState(0);
  const [tourStep, setTourStep] = useState(-1); // -1 = tour off
  const prefersReducedMotion = useReducedMotion();
  const { tier, quality, setQuality } = useDeviceTier();

  const tourActive = tourStep >= 0;
  const fireTrace = useCallback(() => setTrace((n) => n + 1), []);

  const stopTour = useCallback(() => setTourStep(-1), []);
  const startTour = useCallback(() => setTourStep(0), []);
  const toggleTour = useCallback(() => setTourStep((s) => (s >= 0 ? -1 : 0)), []);

  // Tour engine: drive `active` through the sequence, auto-advancing.
  useEffect(() => {
    if (tourStep < 0) return undefined;
    if (tourStep >= TOUR_SEQUENCE.length) {
      setTourStep(-1);
      setActive(null);
      return undefined;
    }
    setActive(TOUR_SEQUENCE[tourStep]);
    const id = setTimeout(() => setTourStep((s) => s + 1), TOUR_DWELL_MS);
    return () => clearTimeout(id);
  }, [tourStep]);

  // Global keys: ⌘K / Ctrl+K → palette; backtick (`) → terminal.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      // backtick toggles the terminal — but not while typing in a field
      if (e.key === '`' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        setTerminalOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Deep-linking: open the section named in the URL hash on load + on back/fwd.
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace('#', '');
      setActive(SECTION_IDS.includes(h) ? h : null);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  // Keep the URL hash in sync with the active section (no scroll jump).
  useEffect(() => {
    const target = active ? `#${active}` : ' ';
    if (window.location.hash.replace('#', '') !== (active ?? '')) {
      window.history.replaceState(null, '', target);
    }
  }, [active]);

  // Any manual section change (click / dock / palette) cancels the tour.
  const selectSection = useCallback((id) => {
    setTourStep(-1);
    setActive(id);
  }, []);

  const handlePaletteSelect = useCallback((id) => {
    setTourStep(-1);
    setActive(id);
    setPaletteOpen(false);
  }, []);

  const tourSection = tourActive ? TOUR_SEQUENCE[tourStep] : null;

  // Low tier: render a clean static document. SystemFallback is self-sufficient
  // (its own sticky section nav + inline content), so we suppress every 3D-only
  // overlay (boot, HUD bar, tour caption, hint, dock, section panel) and the
  // `overflow-hidden` wrapper — that wrapper would establish a non-scrolling
  // container and trap the fallback's `position: sticky` nav. A single floating
  // quality pill remains so a misdetected visitor can opt back into the 3D scene.
  if (tier === TIER.LOW) {
    return (
      <section
        id="hero"
        className="relative"
        style={{ background: 'var(--bg)' }}
        aria-label="Sourabh Jha — portfolio"
      >
        <SystemFallback />
        <div className="fixed bottom-3 right-3 z-40">
          <HudQuality quality={quality} onSetQuality={setQuality} />
        </div>
      </section>
    );
  }

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] overflow-hidden"
      style={{ background: 'var(--bg)' }}
      aria-label="Sourabh Jha — interactive 3D system topology"
    >
      <CanvasOrFallback active={active} onSelect={selectSection} trace={trace} tier={tier} />
      {!prefersReducedMotion && <BootSequence />}

      {/* Top HUD bar — identity · controls · telemetry. Wraps gracefully:
          telemetry stays one line and drops to its own row before anything overlaps. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-start gap-3 p-4 md:p-6">
        <HudIdentity />
        <HudControls
          onOpenPalette={() => setPaletteOpen(true)}
          onToggleTour={toggleTour}
          tourActive={tourActive}
          tourStep={tourActive ? tourStep : 0}
          tourTotal={TOUR_SEQUENCE.length}
        />
        <HudQuality quality={quality} onSetQuality={setQuality} />
        <LiveTelemetry />
      </div>
      <TourCaption active={tourActive} section={tourSection} />
      <HudHint />
      <HudDock active={active} onSelect={selectSection} />

      <SectionPanel active={active} onClose={() => { stopTour(); setActive(null); }} />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelect={handlePaletteSelect}
        onTrace={fireTrace}
        onTour={startTour}
        onTerminal={() => { setPaletteOpen(false); setTerminalOpen(true); }}
        onSetQuality={setQuality}
      />

      <CommandTerminal
        open={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        onSelect={(id) => { setTerminalOpen(false); selectSection(id); }}
      />
    </section>
  );
}

export default SystemHero;
