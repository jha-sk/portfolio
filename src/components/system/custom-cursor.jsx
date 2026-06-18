'use client';

/**
 * CustomCursor — "target-lock" selection reticle, bespoke to the Sourabh Jha portfolio.
 *
 * THE concept: the pointer is the OS's selection tool. Four ice corner-brackets
 * behave as one adaptive frame backed by spring physics:
 *   • boot       → on first appearance the brackets converge inward (assemble).
 *   • free       → an 18px reticle hugging the pointer, leaning into motion.
 *   • DOM hover  → the frame springs out and LOCKS onto the element's corners
 *                  (slight overshoot), a soft fill blooms, and a mono HUD label
 *                  prints the action verb ("open" / "type" / "select").
 *   • 3D node    → a larger reticle + "inspect" label (canvas has no DOM rect).
 *   • click      → the frame snaps inward.
 * A precise near-white core dot tracks the mouse exactly and fades while locked.
 *
 * Craft: per-axis springs (stiffness/damping) for organic motion + overshoot,
 * composited transforms, single rAF, no per-frame React state. Strictly
 * dichromatic (#B2D5E5 tiers + near-white dot). Fine-pointer only; reduced
 * motion → instant, no springs. Native cursor hidden via `.cursor-none`.
 */

import { useEffect, useRef } from 'react';

const INTERACTIVE =
  'a,button,[role="button"],input,textarea,select,label,summary,.cursor-pointer';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function verbFor(el) {
  if (!el) return 'select';
  if (el.dataset && el.dataset.cursor) return el.dataset.cursor;
  const tag = el.tagName ? el.tagName.toLowerCase() : '';
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return 'type';
  if (tag === 'a') return 'open';
  return 'select';
}

export function CustomCursor() {
  const frameRef = useRef(null);
  const fillRef = useRef(null);
  const dotRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('cursor-none');

    const mouse = { x: -200, y: -200 };
    const prev = { x: -200, y: -200 };
    // spring state — start large + offscreen for the boot assemble
    const f = { x: -240, y: -240, w: 80, h: 80, vx: 0, vy: 0, vw: 0, vh: 0, rot: 0 };
    let hoverEl = null;
    let verb = 'select';
    let visible = false;
    let down = false;
    let spin = 0; // idle scanning rotation (free state)

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      visible = true;
      const el = e.target;
      hoverEl = (el && el.closest && el.closest(INTERACTIVE)) || null;
      verb = verbFor(hoverEl);
    };
    const onDown = () => { down = true; };
    const onUp = () => { down = false; };
    const onLeave = () => { visible = false; };
    const onEnter = () => { visible = true; };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    // critically-ish damped spring step (k stiffness, d damping)
    const spring = (cur, vel, target, k, d) => {
      const v = (vel + (target - cur) * k) * d;
      return [cur + v, v];
    };

    let raf;
    const tick = () => {
      const t = performance.now();
      const sceneHover = !hoverEl && document.body.style.cursor === 'pointer';
      const docked = !reduce && !!hoverEl;

      let tx; let ty; let tw; let th;
      if (docked) {
        let rect = null;
        try { rect = hoverEl.getBoundingClientRect(); } catch (_) { rect = null; }
        if (rect && rect.width && rect.height) {
          const pad = 7;
          tx = rect.left - pad; ty = rect.top - pad;
          tw = rect.width + pad * 2; th = rect.height + pad * 2;
        } else { hoverEl = null; tw = 18; th = 18; tx = mouse.x - 9; ty = mouse.y - 9; }
      } else {
        const size = sceneHover ? 40 : 26;
        tw = size; th = size; tx = mouse.x - size / 2; ty = mouse.y - size / 2;
      }
      if (down) { tx += 3; ty += 3; tw -= 6; th -= 6; }

      if (reduce) {
        f.x = tx; f.y = ty; f.w = tw; f.h = th; f.rot = 0;
      } else {
        // snappier + slight overshoot when docking, softer when free
        const k = docked ? 0.22 : 0.2;
        const d = docked ? 0.68 : 0.74;
        [f.x, f.vx] = spring(f.x, f.vx, tx, k, d);
        [f.y, f.vy] = spring(f.y, f.vy, ty, k, d);
        [f.w, f.vw] = spring(f.w, f.vw, tw, 0.2, 0.7);
        [f.h, f.vh] = spring(f.h, f.vh, th, 0.2, 0.7);
        // free state slowly scans (rotates) + leans into motion; locks square on hover
        spin += 0.5;
        const free = !docked && !sceneHover;
        const rotTarget = free ? spin + clamp((mouse.x - prev.x) * 0.3, -10, 10) : 0;
        f.rot += (rotTarget - f.rot) * 0.18;
      }
      prev.x = mouse.x; prev.y = mouse.y;

      const frameEl = frameRef.current;
      const fillEl = fillRef.current;
      const dotEl = dotRef.current;
      const labelEl = labelRef.current;

      if (frameEl) {
        frameEl.style.transformOrigin = `${f.w / 2}px ${f.h / 2}px`;
        frameEl.style.transform = `translate(${f.x}px, ${f.y}px) rotate(${f.rot}deg)`;
        frameEl.style.width = `${f.w}px`;
        frameEl.style.height = `${f.h}px`;
        frameEl.style.opacity = visible ? '1' : '0';
      }
      if (fillEl) {
        fillEl.style.transform = `translate(${f.x}px, ${f.y}px)`;
        fillEl.style.width = `${f.w}px`;
        fillEl.style.height = `${f.h}px`;
        fillEl.style.opacity = visible && (docked || sceneHover) ? '1' : '0';
        fillEl.style.borderRadius = docked ? '10px' : '50%';
      }
      if (dotEl) {
        const pulse = 0.7 + 0.3 * Math.sin(t / 380);
        dotEl.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`;
        dotEl.style.opacity = visible ? '1' : '0';
        dotEl.style.boxShadow = `0 0 ${12 + pulse * 14}px rgba(178,213,229,1), 0 0 6px rgba(234,246,251,1)`;
      }
      if (labelEl) {
        const showLabel = visible && (docked || sceneHover);
        labelEl.style.transform = `translate(${f.x}px, ${f.y + f.h + 8}px)`;
        labelEl.style.opacity = showLabel ? '1' : '0';
        if (showLabel) labelEl.textContent = `▸ ${sceneHover ? 'inspect' : verb}`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.documentElement.classList.remove('cursor-none');
    };
  }, []);

  const layer = {
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 9999,
    opacity: 0,
    willChange: 'transform, width, height, opacity',
  };

  const corner = (pos) => {
    const len = 13;
    const edge = '2px solid #eaf6fb';
    const s = {
      position: 'absolute',
      width: len,
      height: len,
      // bright ice double-glow for presence on dark + a thin dark halo for contrast on glass
      filter:
        'drop-shadow(0 0 8px rgba(178,213,229,0.95)) drop-shadow(0 0 14px rgba(178,213,229,0.5)) drop-shadow(0 0 1px rgba(2,6,10,0.7))',
    };
    if (pos === 'tl') return { ...s, top: -1, left: -1, borderTop: edge, borderLeft: edge };
    if (pos === 'tr') return { ...s, top: -1, right: -1, borderTop: edge, borderRight: edge };
    if (pos === 'bl') return { ...s, bottom: -1, left: -1, borderBottom: edge, borderLeft: edge };
    return { ...s, bottom: -1, right: -1, borderBottom: edge, borderRight: edge };
  };

  return (
    <>
      {/* Soft fill — blooms while locked */}
      <div
        ref={fillRef}
        aria-hidden="true"
        style={{
          ...layer,
          background: 'rgba(178,213,229,0.1)',
          boxShadow: '0 0 24px rgba(178,213,229,0.28)',
          transition: 'opacity .2s ease, border-radius .2s ease',
        }}
      />
      {/* Corner-bracket frame */}
      <div ref={frameRef} aria-hidden="true" style={{ ...layer, transition: 'opacity .2s ease' }}>
        <span style={corner('tl')} />
        <span style={corner('tr')} />
        <span style={corner('bl')} />
        <span style={corner('br')} />
      </div>
      {/* HUD action label */}
      <div
        ref={labelRef}
        aria-hidden="true"
        style={{
          ...layer,
          fontFamily: 'var(--font-jetbrains-mono, monospace)',
          fontSize: '9px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#eaf6fb',
          textShadow: '0 0 8px rgba(178,213,229,0.7)',
          whiteSpace: 'nowrap',
          transition: 'opacity .18s ease',
        }}
      />
      {/* Precise core dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          ...layer,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#eaf6fb',
          boxShadow: '0 0 12px rgba(178,213,229,1)',
          transition: 'opacity .2s ease',
        }}
      />
    </>
  );
}

export default CustomCursor;
