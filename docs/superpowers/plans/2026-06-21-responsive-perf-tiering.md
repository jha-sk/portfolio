# Responsive + Multi-Tier Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Career OS portfolio fully responsive across all devices and performant on lower-spec hardware by routing each visitor to one of three tiers (static / lite-3D / full-3D) with auto-detection plus a manual Low/Auto/High override.

**Architecture:** A framework-free pure module (`device-tier.js`) resolves a tier from device signals; a React hook (`use-device-tier.js`) wraps it with signal collection, a WebGL probe, and a `localStorage`-persisted override. `CanvasOrFallback` routes `low → SystemFallback`, `mid → SystemScene quality="mid"`, `high → SystemScene quality="high"`. The scene is parameterized by a single `QUALITY` config (one file, no fork). The static fallback gains cheap CSS/SVG motion and a sticky section nav. A Tailwind `screens` fix restores the dead `sm` breakpoint.

**Tech Stack:** Next.js 15 (App Router, JS), React 19, React Three Fiber / drei / postprocessing, Three.js, Framer Motion, Tailwind 3, Node built-in test runner (`node:test`).

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `src/lib/device-tier.js` | Pure tier logic: `resolveTier(signals)`, `applyOverride(...)`, `TIER` consts. No DOM, no React — unit-testable in Node. | Create |
| `src/lib/use-device-tier.js` | Client hook: collects signals + WebGL probe, persists override in `localStorage`, SSR-safe, returns `{ tier, quality, setQuality }`. | Create |
| `tests/device-tier.test.mjs` | Unit tests for `resolveTier` / `applyOverride`. | Create |
| `tests/responsive.test.mjs` | Asserts Tailwind `screens.sm` exists (guards the dead-class regression). | Create |
| `tailwind.config.js` | Restore `sm` (640) + add `xs` (480) to `screens`. | Modify |
| `src/components/sections/skills.jsx` | Already uses `sm:grid-cols-2` — works once `sm` is restored; verify only. | Verify |
| `src/components/system/system-scene.jsx` | Add `quality` prop + `QUALITY` config gating dpr, antialias, floor, post-FX, ambient density, packets, autorotate. | Modify |
| `src/components/system/system-hero.jsx` | Use `useDeviceTier`, route 3 tiers, pass `quality` to scene, render HUD quality chip, pass `setQuality` to palette. | Modify |
| `src/components/system/command-palette.jsx` | Add a "Quality" command group calling `setQuality`. | Modify |
| `src/components/system/system-fallback.jsx` | Cheap CSS/SVG motion (reduced-motion gated) + sticky scrollable section nav. | Modify |

---

## Task 1: Restore Tailwind `sm`/`xs` breakpoints (fixes dead `sm:` classes)

**Why:** `tailwind.config.js` overrides `theme.screens` to `{ md, lg, xl }`, deleting Tailwind's default `sm` (640). `skills.jsx` uses `sm:grid-cols-2`, a class never generated under this config, so Skills is single-column at every width.

**Files:**
- Create: `tests/responsive.test.mjs`
- Modify: `tailwind.config.js` (the `screens` block, currently lines 9-13)

- [ ] **Step 1: Write the failing test**

Create `tests/responsive.test.mjs`:

```js
// Guards the responsive breakpoint contract. The Tailwind config overrides
// `theme.screens`, which silently drops any default breakpoint not re-declared.
// `skills.jsx` relies on `sm:` — assert it exists so the class is generated.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import cfg from '../tailwind.config.js';

test('tailwind screens declare xs, sm, md, lg, xl', () => {
  const screens = cfg.theme.screens;
  assert.equal(screens.xs, '480px', 'xs breakpoint must be 480px');
  assert.equal(screens.sm, '640px', 'sm breakpoint must be 640px (skills.jsx uses sm:)');
  assert.equal(screens.md, '768px');
  assert.equal(screens.lg, '1024px');
  assert.equal(screens.xl, '1280px');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/responsive.test.mjs`
Expected: FAIL — `screens.xs`/`screens.sm` are `undefined`.

- [ ] **Step 3: Make the change**

In `tailwind.config.js`, replace the `screens` block (currently):

```js
    screens: {
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
```

with:

```js
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/responsive.test.mjs`
Expected: PASS.

- [ ] **Step 5: Verify Skills now goes 2-col**

Run: `npm run dev`, open `http://localhost:3000`, force the fallback (DevTools → narrow to ~700px or set `prefers-reduced-motion`), confirm the Skills `// system_spec` panel shows **two** columns at ≥640px and **one** below. No code change expected — `skills.jsx` line 44 already has `sm:grid-cols-2`.

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.js tests/responsive.test.mjs
git commit -m "fix(responsive): restore sm/xs breakpoints so sm: classes generate"
```

---

## Task 2: Pure tier-resolution module + unit tests

**Files:**
- Create: `src/lib/device-tier.js`
- Create: `tests/device-tier.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/device-tier.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TIER, resolveTier, applyOverride } from '../src/lib/device-tier.js';

const base = {
  width: 1440, deviceMemory: 8, cores: 8,
  coarsePointer: false, saveData: false, reducedMotion: false, webgl: 'ok',
};

test('healthy desktop resolves to high', () => {
  assert.equal(resolveTier(base), TIER.HIGH);
});

test('phone width resolves to low', () => {
  assert.equal(resolveTier({ ...base, width: 390 }), TIER.LOW);
});

test('tablet width (768-1023) resolves to mid', () => {
  assert.equal(resolveTier({ ...base, width: 900, coarsePointer: true }), TIER.MID);
});

test('software webgl forces low even on a wide screen', () => {
  assert.equal(resolveTier({ ...base, webgl: 'software' }), TIER.LOW);
});

test('no webgl forces low', () => {
  assert.equal(resolveTier({ ...base, webgl: 'none' }), TIER.LOW);
});

test('reduced motion forces low', () => {
  assert.equal(resolveTier({ ...base, reducedMotion: true }), TIER.LOW);
});

test('save-data forces low', () => {
  assert.equal(resolveTier({ ...base, saveData: true }), TIER.LOW);
});

test('<=2GB memory forces low', () => {
  assert.equal(resolveTier({ ...base, deviceMemory: 2 }), TIER.LOW);
});

test('weak laptop (4 cores, wide) demotes high to mid', () => {
  assert.equal(resolveTier({ ...base, cores: 4 }), TIER.MID);
});

test('missing deviceMemory/cores (Safari/FF) still allows high on wide screens', () => {
  assert.equal(
    resolveTier({ ...base, deviceMemory: null, cores: null }),
    TIER.HIGH
  );
});

test('applyOverride: high forces high', () => {
  assert.equal(applyOverride(TIER.LOW, 'high', false), TIER.HIGH);
});

test('applyOverride: low forces low', () => {
  assert.equal(applyOverride(TIER.HIGH, 'low', false), TIER.LOW);
});

test('applyOverride: auto passes the resolved tier through', () => {
  assert.equal(applyOverride(TIER.MID, 'auto', false), TIER.MID);
});

test('applyOverride: reduced motion beats a high override (a11y wins)', () => {
  assert.equal(applyOverride(TIER.HIGH, 'high', true), TIER.LOW);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/device-tier.test.mjs`
Expected: FAIL — cannot resolve `../src/lib/device-tier.js`.

- [ ] **Step 3: Write the module**

Create `src/lib/device-tier.js`:

```js
/**
 * device-tier — pure, framework-free tier resolution for the Career OS hero.
 *
 * Three tiers gate how heavy an experience the visitor receives:
 *   low  → static fallback (no WebGL)
 *   mid  → stripped-down live 3D
 *   high → full 3D scene
 *
 * resolveTier() is a pure function of a `signals` object so it is unit-testable
 * in Node with no DOM. The React hook (use-device-tier.js) supplies real signals.
 */

export const TIER = { LOW: 'low', MID: 'mid', HIGH: 'high' };
export const QUALITY_PREF = { LOW: 'low', AUTO: 'auto', HIGH: 'high' };
export const QUALITY_STORAGE_KEY = 'careeros:quality';

/**
 * @param {object} s
 * @param {number|null} s.width           viewport width in px
 * @param {number|null} s.deviceMemory    navigator.deviceMemory (GB) or null
 * @param {number|null} s.cores           navigator.hardwareConcurrency or null
 * @param {boolean}     s.coarsePointer   (pointer: coarse) matches
 * @param {boolean}     s.saveData        navigator.connection.saveData
 * @param {boolean}     s.reducedMotion   prefers-reduced-motion: reduce
 * @param {'ok'|'software'|'none'} s.webgl WebGL probe result
 * @returns {'low'|'mid'|'high'}
 */
export function resolveTier(s) {
  const lowMem = s.deviceMemory != null && s.deviceMemory <= 2;
  const reducedMem = s.deviceMemory != null && s.deviceMemory <= 4;
  const lowCores = s.cores != null && s.cores <= 4;
  const narrow = s.width != null && s.width <= 768;
  const wide = s.width != null && s.width >= 1024;

  if (
    s.reducedMotion ||
    s.saveData ||
    s.webgl === 'none' ||
    s.webgl === 'software' ||
    narrow ||
    lowMem
  ) {
    return TIER.LOW;
  }

  if (wide && !s.coarsePointer && !reducedMem && !lowCores) {
    return TIER.HIGH;
  }

  return TIER.MID;
}

/**
 * Clamp a resolved tier by the user's manual preference. Reduced motion always
 * wins (accessibility) — even a 'high' override falls back to low.
 * @param {'low'|'mid'|'high'} tier
 * @param {'low'|'auto'|'high'} quality
 * @param {boolean} reducedMotion
 */
export function applyOverride(tier, quality, reducedMotion) {
  if (reducedMotion) return TIER.LOW;
  if (quality === QUALITY_PREF.HIGH) return TIER.HIGH;
  if (quality === QUALITY_PREF.LOW) return TIER.LOW;
  return tier;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/device-tier.test.mjs`
Expected: PASS (14 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/device-tier.js tests/device-tier.test.mjs
git commit -m "feat(perf): pure device-tier resolution module + tests"
```

---

## Task 3: `useDeviceTier` React hook (signals + WebGL probe + persisted override)

**Files:**
- Create: `src/lib/use-device-tier.js`

> No unit test: this hook reads browser APIs (`matchMedia`, `navigator`, WebGL, `localStorage`) that the Node test runner can't supply. Its pure core (`resolveTier`/`applyOverride`) is already covered by Task 2. Verification is the production build + manual matrix in Task 8.

- [ ] **Step 1: Write the hook**

Create `src/lib/use-device-tier.js`:

```js
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TIER, QUALITY_PREF, QUALITY_STORAGE_KEY, resolveTier, applyOverride,
} from './device-tier';

/** One-time WebGL capability probe: 'ok' | 'software' | 'none'. */
function probeWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (!gl) return 'none';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    if (/swiftshader|llvmpipe|software|microsoft basic/i.test(renderer)) return 'software';
    return 'ok';
  } catch {
    return 'none';
  }
}

function collectSignals() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    width: window.innerWidth,
    deviceMemory: typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null,
    cores: typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    saveData: Boolean(navigator.connection && navigator.connection.saveData),
    reducedMotion,
    webgl: probeWebGL(),
  };
}

function readStoredQuality() {
  try {
    const v = localStorage.getItem(QUALITY_STORAGE_KEY);
    if (v === QUALITY_PREF.LOW || v === QUALITY_PREF.HIGH || v === QUALITY_PREF.AUTO) return v;
  } catch {
    /* ignore */
  }
  return QUALITY_PREF.AUTO;
}

/**
 * Resolve the active rendering tier with a persisted Low/Auto/High override.
 * SSR-safe: returns a deterministic { tier: 'low' } until mounted, then upgrades
 * on the client (prevents hydration mismatch; crawlers/no-JS keep full content).
 *
 * @returns {{ tier: 'low'|'mid'|'high', quality: 'low'|'auto'|'high', mounted: boolean, setQuality: (q:string)=>void }}
 */
export function useDeviceTier() {
  const [mounted, setMounted] = useState(false);
  const [resolved, setResolved] = useState(TIER.LOW);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [quality, setQualityState] = useState(QUALITY_PREF.AUTO);

  useEffect(() => {
    setMounted(true);
    setQualityState(readStoredQuality());

    const recompute = () => {
      const signals = collectSignals();
      setReducedMotion(signals.reducedMotion);
      setResolved(resolveTier(signals));
    };
    recompute();

    // Recompute on width / pointer / motion changes (debounced for resize thrash).
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recompute);
    };
    window.addEventListener('resize', onResize);
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    mqMotion.addEventListener('change', recompute);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      mqMotion.removeEventListener('change', recompute);
    };
  }, []);

  const setQuality = useCallback((q) => {
    setQualityState(q);
    try {
      localStorage.setItem(QUALITY_STORAGE_KEY, q);
    } catch {
      /* ignore */
    }
  }, []);

  const tier = mounted ? applyOverride(resolved, quality, reducedMotion) : TIER.LOW;
  return { tier, quality, mounted, setQuality };
}

export default useDeviceTier;
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: build succeeds (exit 0). The hook isn't wired in yet, so no behavior change — this only proves the module parses and type-checks under Next's compiler.

- [ ] **Step 3: Commit**

```bash
git add src/lib/use-device-tier.js
git commit -m "feat(perf): useDeviceTier hook with WebGL probe + persisted override"
```

---

## Task 4: Parameterize `SystemScene` by `quality`

**Files:**
- Modify: `src/components/system/system-scene.jsx`

Add a `quality` prop threaded through `SystemScene → SceneGraph` and a single `QUALITY` config. Default `'high'` keeps current behavior byte-for-byte.

- [ ] **Step 1: Add the QUALITY config**

In `system-scene.jsx`, directly after the palette constants block (after the `LED_ICE` line, ~line 52), add:

```js
/* ── Quality tiers ─────────────────────────────────────────────────────────
   One source of truth for how heavy the scene is. `high` is the full scene;
   `mid` strips the most expensive GPU work (reflective floor, DoF, noise) and
   thins object/packet counts for weak GPUs and tablets. */
const QUALITY = {
  high: {
    dpr: [1, 2], antialias: true, reflectiveFloor: true,
    postFx: 'full', ambientRacks: Infinity, coolingTowers: true,
    packets: 'full', autoRotate: 0.5,
  },
  mid: {
    dpr: [1, 1.5], antialias: false, reflectiveFloor: false,
    postFx: 'lite', ambientRacks: 8, coolingTowers: false,
    packets: 'core', autoRotate: 0.3,
  },
};
```

- [ ] **Step 2: Thread `quality` into `EdgesAndPackets`**

Replace the `EdgesAndPackets` function (currently lines 652-670) with a version that can drop non-core packets:

```js
function EdgesAndPackets({ packets = 'full' }) {
  const livePackets = ALL_EDGES.filter(
    (e) => e.packet && (packets === 'full' || e.bright)
  );
  return (
    <>
      {ALL_EDGES.map((e, i) => (
        <Edge key={`e-${i}`} start={e.start} end={e.end} bright={e.bright} />
      ))}
      {livePackets.map((e, i) => (
        <Packet
          key={`p-${i}`}
          start={e.start}
          end={e.end}
          bright={e.bright}
          endKey={e.endKey}
          speed={(e.bright ? 0.07 : 0.05) + Math.random() * 0.03}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 3: Make `SceneGraph` consume the tier**

Change the `SceneGraph` signature (currently line 898) from:

```js
function SceneGraph({ onSelect, active, trace }) {
```

to:

```js
function SceneGraph({ onSelect, active, trace, q }) {
```

Inside `SceneGraph`, replace the floor render (currently lines 917-918):

```js
      <ReflectiveFloor />
      <GridFloor />
```

with:

```js
      {q.reflectiveFloor && <ReflectiveFloor />}
      <GridFloor />
```

Replace the ambient density block (currently lines 930-936):

```js
      {/* decorative server-room density */}
      {AMBIENT_RACKS.map((pos, i) => (
        <AmbientRack key={`ar-${i}`} position={pos} />
      ))}
      {COOLING_TOWERS.map((pos, i) => (
        <CoolingTower key={`ct-${i}`} position={pos} index={i} />
      ))}
```

with:

```js
      {/* decorative server-room density (thinned on lower tiers) */}
      {AMBIENT_RACKS.slice(0, q.ambientRacks).map((pos, i) => (
        <AmbientRack key={`ar-${i}`} position={pos} />
      ))}
      {q.coolingTowers && COOLING_TOWERS.map((pos, i) => (
        <CoolingTower key={`ct-${i}`} position={pos} index={i} />
      ))}
```

Replace the `EdgesAndPackets` usage (currently line 939):

```js
      <EdgesAndPackets />
```

with:

```js
      <EdgesAndPackets packets={q.packets} />
```

Replace the `DofDriver` line (currently line 944):

```js
      <DofDriver dofRef={dofRef} focus={focus} />
```

with:

```js
      {q.postFx === 'full' && <DofDriver dofRef={dofRef} focus={focus} />}
```

Update the `OrbitControls` `autoRotateSpeed` (currently line 951) from:

```js
        autoRotateSpeed={0.5}
```

to:

```js
        autoRotateSpeed={q.autoRotate}
```

Replace the entire `EffectComposer` block (currently lines 959-976) with a tiered version:

```js
      <EffectComposer>
        {q.postFx === 'full' ? (
          <>
            <DepthOfField
              ref={dofRef}
              target={[0, 1.8, 0]}
              focalLength={0.015}
              focusRange={0.012}
              bokehScale={0}
            />
            <Bloom
              luminanceThreshold={0.34}
              luminanceSmoothing={0.85}
              mipmapBlur
              intensity={0.42}
              radius={0.55}
            />
            <Vignette offset={0.3} darkness={0.65} />
            <Noise opacity={0.025} premultiply blendFunction={BlendFunction.SOFT_LIGHT} />
          </>
        ) : (
          <>
            <Bloom
              luminanceThreshold={0.4}
              luminanceSmoothing={0.8}
              mipmapBlur
              intensity={0.3}
              radius={0.5}
            />
            <Vignette offset={0.3} darkness={0.6} />
          </>
        )}
      </EffectComposer>
```

> Note: `EffectComposer` requires at least one child. Both branches render ≥1 effect, so this is safe.

- [ ] **Step 4: Make the `SystemScene` export accept `quality`**

Replace the export signature (currently line 982):

```js
export default function SystemScene({ onSelect, active, trace }) {
```

with:

```js
export default function SystemScene({ onSelect, active, trace, quality = 'high' }) {
  const q = QUALITY[quality] ?? QUALITY.high;
```

Update the `<Canvas>` props (currently lines 1007-1011). Change:

```js
        gl={{ antialias: true, alpha: false, toneMapping: THREE.NoToneMapping }}
        dpr={[1, 2]}
```

to:

```js
        gl={{ antialias: q.antialias, alpha: false, toneMapping: THREE.NoToneMapping }}
        dpr={q.dpr}
```

And update the `SceneGraph` usage (currently line 1016):

```js
        <SceneGraph onSelect={onSelect} active={active} trace={trace} />
```

to:

```js
        <SceneGraph onSelect={onSelect} active={active} trace={trace} q={q} />
```

- [ ] **Step 5: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds (exit 0).

- [ ] **Step 6: Commit**

```bash
git add src/components/system/system-scene.jsx
git commit -m "feat(perf): parameterize SystemScene by quality tier (mid/high)"
```

---

## Task 5: Route the three tiers in `SystemHero` / `CanvasOrFallback`

**Files:**
- Modify: `src/components/system/system-hero.jsx`

Replace the ad-hoc `prefersReducedMotion || isMobile` gate with the tier hook, and pass `quality` to the scene.

- [ ] **Step 1: Import the hook**

In `system-hero.jsx`, after the existing imports (after line 26, the `CommandTerminal` import), add:

```js
import { useDeviceTier } from '@/lib/use-device-tier';
import { TIER } from '@/lib/device-tier';
```

- [ ] **Step 2: Replace `CanvasOrFallback` with tier routing**

Replace the entire `CanvasOrFallback` component (currently lines 351-377) with:

```js
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
```

> This removes the now-dead `useReducedMotion`/`isMobile`/`matchMedia` logic from `CanvasOrFallback` — that responsibility now lives in `useDeviceTier`.

- [ ] **Step 3: Call the hook in `SystemHero` and pass `tier` down**

In `SystemHero` (the exported component), add the hook near the other state (after `const prefersReducedMotion = useReducedMotion();`, ~line 390):

```js
  const { tier, quality, setQuality } = useDeviceTier();
```

Then change the `CanvasOrFallback` usage (currently line 472) from:

```js
      <CanvasOrFallback active={active} onSelect={selectSection} trace={trace} />
```

to:

```js
      <CanvasOrFallback active={active} onSelect={selectSection} trace={trace} tier={tier} />
```

- [ ] **Step 4: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds (exit 0).

- [ ] **Step 5: Manual smoke**

Run: `npm run dev`. On a desktop browser confirm the full scene still loads. In DevTools, emulate a mobile device (or set `prefers-reduced-motion: reduce` via Rendering panel) and confirm the static fallback renders instead.

- [ ] **Step 6: Commit**

```bash
git add src/components/system/system-hero.jsx
git commit -m "feat(perf): route low/mid/high tiers via useDeviceTier in SystemHero"
```

---

## Task 6: Manual quality control — palette commands + HUD chip

**Files:**
- Modify: `src/components/system/command-palette.jsx`
- Modify: `src/components/system/system-hero.jsx`

- [ ] **Step 1: Accept `onSetQuality` in the palette and add commands**

In `command-palette.jsx`, change the component signature (line 30) from:

```js
export function CommandPalette({ open, onClose, onSelect, onTrace, onTour, onTerminal }) {
```

to:

```js
export function CommandPalette({ open, onClose, onSelect, onTrace, onTour, onTerminal, onSetQuality }) {
```

Add `Gauge` to the lucide import (line 16-19 block) — append `Gauge` to the named imports:

```js
import {
  Compass, Boxes, FolderGit2, Briefcase, Send,
  Activity, Download, Copy, Github, Linkedin, Check, Play, TerminalSquare, Gauge,
} from 'lucide-react';
```

In the `actions` array (inside the `useMemo`, after the `terminal`/`tour`/`trace` System entries, ~line 49), add three quality commands:

```js
    { id: 'q-auto', group: 'Quality', label: 'Quality: Auto (detect)', Icon: Gauge, run: () => onSetQuality?.('auto') },
    { id: 'q-high', group: 'Quality', label: 'Quality: High (full 3D)', Icon: Gauge, run: () => onSetQuality?.('high') },
    { id: 'q-low',  group: 'Quality', label: 'Quality: Low (static)',   Icon: Gauge, run: () => onSetQuality?.('low') },
```

Add `onSetQuality` to the `useMemo` dependency array (currently `[onSelect, onTrace, onTour, onTerminal]`, line 54):

```js
  ], [onSelect, onTrace, onTour, onTerminal, onSetQuality]);
```

- [ ] **Step 2: Pass `onSetQuality` from `SystemHero`**

In `system-hero.jsx`, update the `<CommandPalette>` usage (currently lines 494-501). Add the `onSetQuality` prop:

```js
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelect={handlePaletteSelect}
        onTrace={fireTrace}
        onTour={startTour}
        onTerminal={() => { setPaletteOpen(false); setTerminalOpen(true); }}
        onSetQuality={setQuality}
      />
```

- [ ] **Step 3: Add the HUD quality chip**

In `system-hero.jsx`, add a small chip component just before `HudControls` (after the `PILL_BTN` const, ~line 114):

```js
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
```

Render it inside the top HUD bar. In the HUD `<div>` (currently lines 477-487), add `<HudQuality>` after `<HudControls>` and before `<LiveTelemetry>`:

```js
        <HudControls
          onOpenPalette={() => setPaletteOpen(true)}
          onToggleTour={toggleTour}
          tourActive={tourActive}
          tourStep={tourActive ? tourStep : 0}
          tourTotal={TOUR_SEQUENCE.length}
        />
        <HudQuality quality={quality} onSetQuality={setQuality} />
        <LiveTelemetry />
```

- [ ] **Step 4: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds (exit 0).

- [ ] **Step 5: Manual verification**

Run: `npm run dev` on desktop. Confirm: (a) the `gfx [Low][Auto][High]` chip appears top-HUD and wraps gracefully on narrow widths; (b) clicking **Low** swaps to the static fallback and **High** restores the full scene; (c) the choice survives a page reload (localStorage); (d) ⌘K → "Quality: …" commands do the same.

- [ ] **Step 6: Commit**

```bash
git add src/components/system/command-palette.jsx src/components/system/system-hero.jsx
git commit -m "feat(perf): manual Low/Auto/High quality control in palette + HUD"
```

---

## Task 7: Upgrade the static fallback — cheap motion + section nav

**Files:**
- Modify: `src/components/system/system-fallback.jsx`

The low tier currently has no navigation (phone users can only scroll) and a fully static graph. Add a sticky, horizontally-scrollable section nav and cheap CSS/SVG motion (reduced-motion gated).

- [ ] **Step 1: Add the section-nav + animation styles**

In `system-fallback.jsx`, add a `FALLBACK_SECTIONS` constant and a sticky nav. First, after the imports (after line 24), add:

```js
const FALLBACK_SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'certs', label: 'Certs' },
  { id: 'contact', label: 'Contact' },
];
```

- [ ] **Step 2: Render a sticky scrollable nav + scoped keyframes**

Inside the returned fragment, as the very first child (immediately after the opening `<>` on line 41-42), insert the sticky nav and a scoped style block. Place this BEFORE the hero `<div>`:

```jsx
      {/* Cheap, GPU-light motion — disabled under reduced-motion via media query. */}
      <style>{`
        @keyframes fb-node-pulse {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }
        @keyframes fb-packet {
          0%   { offset-distance: 0%;   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
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
```

- [ ] **Step 3: Animate the static SVG nodes**

In the existing SVG node map (currently the `SVG_NODES.map` block, lines 94-115), add the `fb-node` class and a per-node animation delay to the `<circle>`. Replace the `<circle ... />` (lines 96-102) with:

```jsx
                <circle
                  cx={n.x} cy={n.y} r={n.r}
                  stroke="#B2D5E5"
                  strokeWidth="1"
                  strokeOpacity={n.primary ? 0.9 : 0.55}
                  fill="none"
                  className="fb-node"
                  style={{ animationDelay: `${n.x * 4}ms` }}
                />
```

- [ ] **Step 4: Ensure the Certs section has a matching anchor id**

The nav links to `#certs`. Open `src/components/sections/certs-education.jsx` and confirm its root `<section>` has `id="certs"`. If the id differs, update the nav entry in Step 1 to match the real id (do not invent one). Run:

```bash
grep -n 'id=' src/components/sections/certs-education.jsx
```

Use whatever section id already exists; only adjust `FALLBACK_SECTIONS` if needed. (About/Skills/Projects/Experience/Contact ids are confirmed: `about`, `skills`, `projects`, `experience`, `contact`.)

- [ ] **Step 5: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds (exit 0).

- [ ] **Step 6: Manual verification on a phone viewport**

Run: `npm run dev`, DevTools → iPhone SE (375px). Confirm: (a) the sticky nav stays pinned and scrolls horizontally; (b) tapping a pill jumps to that section; (c) nodes gently pulse; (d) toggling `prefers-reduced-motion: reduce` stops the pulse; (e) no horizontal page overflow.

- [ ] **Step 7: Commit**

```bash
git add src/components/system/system-fallback.jsx
git commit -m "feat(responsive): static fallback gets sticky section nav + cheap motion"
```

---

## Task 8: Full-matrix verification + responsive polish sweep

**Files:**
- Modify (only if a defect is found): any section/panel file
- Verify: all surfaces

> This task is verification-first. Make edits ONLY where the matrix surfaces a real defect; do not refactor already-responsive code.

- [ ] **Step 1: Run the full test suite**

Run: `node --test tests/device-tier.test.mjs tests/responsive.test.mjs`
Expected: all PASS.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: exit 0, no errors.

- [ ] **Step 3: Tier × viewport matrix (manual, `npm run dev`)**

For each combination confirm the listed expectation; file a defect note only if it fails:

| Viewport | Quality=Auto | Quality=High | Quality=Low |
|---|---|---|---|
| 375px (phone) | static + nav | full scene* | static + nav |
| 834px (tablet) | mid scene | full scene | static + nav |
| 1440px (desktop) | full scene | full scene | static + nav |

\*High override on a phone is allowed (user opt-in); confirm it doesn't crash, just runs heavier.

- [ ] **Step 4: Small-width polish checks**

At 360px and 768px confirm no horizontal overflow / overlap on these surfaces. Fix only if broken, following the existing pattern (`px-4 md:px-6 lg:px-8`, `flex-wrap`, `grid-cols-1 sm:grid-cols-2`):
- Top HUD cluster (identity / controls / gfx chip / telemetry) — already `flex-wrap`
- Nav dock (bottom) — already `flex-wrap` + `maxWidth: 94vw`
- `SectionPanel` open at 360px — card is `width:100%` `maxWidth:720px` inside `padding:16px`; confirm header + content readable
- Command palette / terminal — `width: min(92vw, 560px)` clamps; confirm
- Skills panel — 2-col at ≥640px, 1-col below (the Task 1 fix)

- [ ] **Step 5: Lighthouse on the low path**

In DevTools → Lighthouse, run a **mobile** audit (which triggers the static tier). Confirm Performance ≥ 90. Note the score in the commit body.

- [ ] **Step 6: Commit (verification record + any fixes)**

```bash
git add -A
git commit -m "test(perf): verify tier matrix + responsive polish

Lighthouse mobile (static tier): <score>. Tiers confirmed across
375/834/1440px × Low/Auto/High."
```

---

## Self-Review notes (author)

- **Spec coverage:** §3.1 hook → Tasks 2-3; §3.2 scene tiers → Task 4; §3.3 fallback upgrade → Task 7; §3.4 quality control → Task 6; §4 responsive + `sm` fix → Tasks 1, 8; §6 SSR/probe/override edge cases → Tasks 2-3 (covered by `applyOverride` + SSR-safe `mounted`); §7 testing → Tasks 1, 2, 8.
- **Override vs reduced-motion** consistency: `applyOverride(tier, quality, reducedMotion)` is used with the same 3-arg signature in Task 2 (tests), Task 3 (hook). Consistent.
- **`quality` value vocabulary:** preference is `low|auto|high` (UI + storage); scene prop is `mid|high` (derived in Task 5 `CanvasOrFallback`). The two vocabularies are intentionally distinct and never mixed.
- **No unit test for hook/scene/fallback** is a deliberate, stated choice — the project has no React/DOM test harness; the pure core is tested and the rest is build + manual matrix.
