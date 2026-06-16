'use client';

/**
 * LiveTelemetry — animated HUD top-right telemetry chips.
 *
 * Replaces the static HudTopRight mapping with:
 *   • A live req/s chip that jitters every ~1.2 s around a base value.
 *   • An inline SVG sparkline that scrolls alongside req/s.
 *   • All other stats count-up from 0 (or dash) to their final value over ~0.8 s on mount.
 *
 * SSR safety: initial render always shows static final values so there is no
 * hydration mismatch. Jitter + count-up start in useEffect (client-only).
 *
 * Reduced-motion: no jitter, no count-up, static sparkline (flat line).
 * Token contract: ice-blue rgba / hex inline — no CSS vars in this layer.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { stats } from '@/data/stats';

/* ── Constants ───────────────────────────────────────────────────────────── */
const ICE        = 'rgba(178,213,229,0.6)';
const ICE_BORDER = 'rgba(178,213,229,0.2)';
const FG         = '#eaf6fb';
const SPARKLINE_ICE = '#7ab8d0';

const REQ_BASE   = 1240;   // requests/s baseline
const REQ_JITTER = 0.04;   // ±4%
const TICK_MS    = 1200;   // jitter interval

const SPARKLINE_W = 60;
const SPARKLINE_H = 16;
const SPARK_POINTS = 20;   // keep last N points

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatReq(v) {
  return (v / 1000).toFixed(2) + 'k';
}

/** Extract the leading numeric part from a stat value string for count-up. */
function parseStatValue(value) {
  // e.g. "99.9%" → 99.9, "−30%" → -30, "+20%" → 20, "50+" → 50, "−15–20%" → null (skip)
  const m = value.match(/^([+−-]?\d+(?:\.\d+)?)/);
  if (!m) return null;
  const sign = m[0].startsWith('−') ? -1 : 1;
  return sign * parseFloat(m[0].replace('−', ''));
}

/** Re-attach sign/suffix from a stat value template, replacing just the leading number. */
function rehydrateValue(template, num) {
  // replace leading numeric run (with optional leading sign) with animated num
  const prefix = template.startsWith('−') ? '−' : template.startsWith('+') ? '+' : '';
  const absNum = Math.abs(num);
  // format to same decimal places as original
  const decimals = (template.match(/\.(\d+)/) || ['', ''])[1].length;
  const numStr = absNum.toFixed(decimals);
  // suffix = everything after the leading number block
  const suffix = template.replace(/^[+−-]?\d+(?:\.\d+)?/, '');
  return prefix + numStr + suffix;
}

/* ── Sparkline SVG ────────────────────────────────────────────────────────── */
function Sparkline({ points, isReduced }) {
  if (!points || points.length < 2) {
    // flat line placeholder
    return (
      <svg
        width={SPARKLINE_W}
        height={SPARKLINE_H}
        aria-hidden="true"
        style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }}
      >
        <line
          x1={0}
          y1={SPARKLINE_H / 2}
          x2={SPARKLINE_W}
          y2={SPARKLINE_H / 2}
          stroke={SPARKLINE_ICE}
          strokeWidth={1}
          opacity={0.4}
        />
      </svg>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * SPARKLINE_W;
    const y = SPARKLINE_H - ((v - min) / range) * (SPARKLINE_H - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg
      width={SPARKLINE_W}
      height={SPARKLINE_H}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }}
    >
      <polyline
        points={pts}
        fill="none"
        stroke={SPARKLINE_ICE}
        strokeWidth={1}
        opacity={0.7}
      />
    </svg>
  );
}

/* ── Chip ─────────────────────────────────────────────────────────────────── */
function Chip({ label, value, extra }) {
  return (
    <span
      className="rounded-full border px-3 py-1 font-mono text-[10px]"
      style={{ borderColor: ICE_BORDER, color: ICE, whiteSpace: 'nowrap' }}
    >
      {label}{' '}
      <b style={{ color: FG }}>{value}</b>
      {extra}
    </span>
  );
}

/* ── LiveTelemetry ────────────────────────────────────────────────────────── */
export function LiveTelemetry() {
  const prefersReduced = useReducedMotion();

  // req/s — SSR initial = static display string
  const [reqVal, setReqVal] = useState(formatReq(REQ_BASE));

  // Sparkline points — start with flat line of REQ_BASE values (avoids SSR mismatch)
  const [sparkPoints, setSparkPoints] = useState(() =>
    Array.from({ length: SPARK_POINTS }, () => REQ_BASE)
  );

  // Stat count-up progress [0..1] per stat (index into stats array)
  const [countProgress, setCountProgress] = useState(() =>
    stats.map(() => 1) // start at 1 (final value) for SSR
  );

  // Track mounted to avoid setState after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /* ── Count-up on mount ───────────────────────────────────────────────── */
  useEffect(() => {
    if (prefersReduced) return; // skip animation

    // Reset to 0 immediately after mount (client-only)
    setCountProgress(stats.map(() => 0));

    const start = performance.now();
    const DURATION = 800; // ms

    let raf;
    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / DURATION, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);

      if (mountedRef.current) {
        setCountProgress(stats.map(() => eased));
      }

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReduced]);

  /* ── req/s jitter + sparkline ────────────────────────────────────────── */
  useEffect(() => {
    if (prefersReduced) return;

    const id = setInterval(() => {
      if (!mountedRef.current) return;
      const jitter = 1 + (Math.random() * 2 - 1) * REQ_JITTER;
      const next = Math.round(REQ_BASE * jitter);
      setReqVal(formatReq(next));
      setSparkPoints(prev => {
        const updated = [...prev.slice(-(SPARK_POINTS - 1)), next];
        return updated;
      });
    }, TICK_MS);

    return () => clearInterval(id);
  }, [prefersReduced]);

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div
      className="absolute right-5 top-5 z-10 flex flex-wrap justify-end gap-2"
      style={{ maxWidth: '62vw', pointerEvents: 'none' }}
      aria-label="System telemetry"
    >
      {/* Live req/s chip — first */}
      <Chip
        label="req/s"
        value={reqVal}
        extra={
          prefersReduced ? null : (
            <Sparkline points={sparkPoints} isReduced={prefersReduced} />
          )
        }
      />

      {/* Static stats with count-up */}
      {stats.map((s, i) => {
        const parsed = parseStatValue(s.value);
        let display;
        if (parsed === null || prefersReduced) {
          display = s.value; // can't animate, or reduced motion — show final
        } else {
          const progress = countProgress[i] ?? 1;
          const animated = parsed * progress;
          display = rehydrateValue(s.value, animated);
        }
        return (
          <Chip key={s.id} label={s.id} value={display} />
        );
      })}
    </div>
  );
}

export default LiveTelemetry;
