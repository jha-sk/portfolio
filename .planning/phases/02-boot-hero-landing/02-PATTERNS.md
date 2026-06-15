# Phase 2: Boot & Hero Landing - Pattern Map

**Mapped:** 2026-06-16
**Files analyzed:** 7 (5 new, 2 modified)
**Analogs found:** 7 / 7 (every new file has at least a role/data-flow analog in the Phase 1 codebase)

> JavaScript (not TypeScript) Next.js App Router project. `@/*` aliases `src/*`. Components consume design **tokens only — no hardcoded hex** (UI-SPEC contract). All motion components are `'use client'`, animate **transform/opacity (+ SVG `pathLength`) only**, and gate on `useReducedMotion()`. Easing family: `[0.22, 1, 0.36, 1]`.

---

## File Classification

| New/Modified File | New/Mod | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|---------|------|-----------|----------------|---------------|
| `src/components/boot/boot-overlay.jsx` | NEW | component (client motion overlay) | event-driven (skip listeners + session + auto-advance) | `src/components/motion/reveal.jsx` (motion contract) + `src/components/layout/theme-toggle.jsx` (client mount-guard + effects) | role-match (no existing overlay/session component) |
| `src/components/hero/hero.jsx` | NEW | component (section) | request-response (renders data) | `src/app/page.js` (section + token + `Reveal` + data-read) | exact |
| `src/components/hero/hero-background.jsx` | NEW | component (ambient motion) | streaming (continuous transform/opacity loops) | `src/components/motion/reveal.jsx` (motion + reduced-motion gate) | role-match |
| `src/components/hero/scroll-cue.jsx` | NEW | component (motion + icon) | event-driven (optional anchor scroll) + loop | `src/components/layout/theme-toggle.jsx` (Lucide glyph + a11y) + `reveal.jsx` (loop gate) | role-match |
| `src/components/boot/brush-stroke.jsx` *(optional split)* | NEW | component (SVG motion primitive) | streaming (`pathLength` draw) | `src/components/motion/reveal.jsx` (motion primitive convention) | role-match |
| `src/app/page.js` | MOD | route (page) | request-response | itself (Phase 1 version) | exact |
| `src/app/layout.js` | MOD (if overlay mounts here) | layout | request-response | itself (Phase 1 version) | exact |

> **Discretion note (D, UI-SPEC):** `brush-stroke.jsx` may be folded into `boot-overlay.jsx`; it is listed separately because the SVG path draw is a clean reusable primitive. The planner may collapse to a single `boot-overlay.jsx`.

---

## Pattern Assignments

### `src/components/boot/boot-overlay.jsx` (client motion overlay, event-driven)

**Analogs:** `src/components/motion/reveal.jsx` (motion + reduced-motion gate) and `src/components/layout/theme-toggle.jsx` (`'use client'` + `useState`/`useEffect` mount guard — the same shape needed for `sessionStorage` reads, which must run client-side only to avoid SSR hydration mismatch).

**Directive + import pattern** (from `reveal.jsx` lines 1-3 and `theme-toggle.jsx` lines 1-5):
```jsx
'use client';

import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
```
- `'use client'` is mandatory (every motion component carries it).
- Framer Motion is the locked engine. Add `AnimatePresence` (new to this phase) for the overlay mount/unmount on completion.

**Mount-guard / client-only state pattern** (copy the shape of `theme-toggle.jsx` lines 17-25):
```jsx
const [mounted, setMounted] = React.useState(false);

React.useEffect(() => {
  setMounted(true);
}, []);
```
Use this exact shape to read `sessionStorage` (key `careeros:boot-played`, per UI-SPEC) only after hydration — the overlay must NOT block first paint of the hero underneath (SSR renders the hero; the overlay decides on the client whether to play). This mirrors how `theme-toggle` defers the resolved-theme read to avoid a mismatch flash.

**Reduced-motion gate pattern** (copy from `reveal.jsx` lines 19-33 — the early-return-static idiom):
```jsx
const prefersReducedMotion = useReducedMotion();

if (prefersReducedMotion) {
  // D-05: do NOT animate — reveal hero immediately (overlay never mounts / unmounts at 0.01s).
  return null;
}
```
This is the established gate. Under reduced motion the boot is skipped entirely (D-05).

**Motion timing tokens to reuse** (from `reveal.jsx` line 41 / `itemVariants` line 71):
- Easing: `[0.22, 1, 0.36, 1]` (UI-SPEC Boot motion spec — same family, do not invent a new ease).
- Boot stroke sweep `~2.0s` via Framer `pathLength` (UI-SPEC); wipe-out `~0.4s` opacity.
- Animate **only** `transform` / `opacity` / SVG `pathLength` — never width/height/top/left/box-shadow (FND-06, D-07).

**Token / no-hex pattern** (the void background — from `globals.css` lines 19-23 and `page.js` usage):
- Overlay base: `fixed inset-0 z-50 bg-background` (the `#020202` void token — never the literal hex).
- Stroke ink glow edge: `var(--glow-accent)` / `shadow-glow` (token, lines 50 / tailwind `boxShadow.glow`).
- A11y: overlay `aria-hidden`, no focus trap (UI-SPEC copy contract — hero underneath is the accessible content).

**Event-driven skip pattern** (NEW — no analog; build from `useEffect` + listener cleanup, the same effect-lifecycle idiom as `theme-toggle.jsx` lines 21-23):
```jsx
React.useEffect(() => {
  const skip = () => finishBoot();           // sets sessionStorage flag + unmounts
  window.addEventListener('click', skip);
  window.addEventListener('keydown', skip);
  window.addEventListener('wheel', skip, { passive: true });
  window.addEventListener('touchmove', skip, { passive: true });
  const timer = setTimeout(skip, BOOT_DURATION_MS); // auto-advance (D-04)
  return () => {
    clearTimeout(timer);
    window.removeEventListener('click', skip);
    window.removeEventListener('keydown', skip);
    window.removeEventListener('wheel', skip);
    window.removeEventListener('touchmove', skip);
  };
}, []);
```
> No existing component attaches global listeners or uses `sessionStorage` — this is genuinely new logic. The only borrowed pattern is the `useEffect` setup/cleanup discipline from `theme-toggle.jsx`.

---

### `src/components/hero/hero.jsx` (section component, request-response)

**Analog (exact):** `src/app/page.js` — same role (a section that reads from `src/data/*`, composes tokens, and wraps content in `Reveal`).

**Data-read pattern** (copy from `page.js` lines 1, 4 and `identity.js` lines 12-16):
```jsx
import { identity } from '@/data/identity';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
// ...
{identity.name}    // → render uppercase as wordmark (D-09)
{identity.title}   // "AI Engineer | Backend Engineer"
{identity.tagline} // "Building scalable systems — ..."
```
Read all three strings from `identity.js` — **never hardcode** (D-09). `identity.js` exposes exactly `{ name, title, tagline }`.

**Section + token-class pattern** (extend `page.js` lines 19-31 — note the existing wordmark glow on the `h1` is the exact treatment the hero wordmark reuses):
```jsx
// page.js line 25 — the accent-glow heading treatment to reuse on the hero wordmark:
<h1 className="... font-sans text-display font-semibold text-primary [text-shadow:var(--glow-accent)]">
```
Hero composition per UI-SPEC § Hero Composition:
- Section: `relative overflow-hidden flex flex-col items-center justify-center min-h-[100svh]` + inherited container gutters (`page.js` line 19 gutter pattern: `px-4 md:px-6 lg:px-8`).
- Wordmark: Display role, **700 weight** (the documented hero exception — only place 700 is allowed), `clamp(2.5rem, 8vw, 6rem)`, `text-foreground`, `[text-shadow:var(--glow-accent)]`, `tracking-[-0.02em]`, `leading-[1.1]`, `uppercase`.
- Title: `text-heading font-semibold text-foreground`.
- Tagline: `text-body text-muted-foreground max-w-prose` (the `max-w-prose` + `text-muted-foreground` pairing is exactly the secondary-text pattern on `page.js` line 28).

**Entrance choreography pattern** (reuse `RevealGroup`/`RevealItem` from `reveal.jsx` lines 85-114, as `page.js` does on lines 39-66):
```jsx
<RevealGroup>
  <RevealItem>{/* wordmark */}</RevealItem>
  <RevealItem>{/* title */}</RevealItem>
  <RevealItem>{/* tagline */}</RevealItem>
</RevealGroup>
```
> UI-SPEC asks for a **0.08s** stagger (vs the inherited 0.06s in `groupVariants` line 62). To honor this without redefining the baseline, the planner should pass a stagger override into the hero group (e.g. a `staggerChildren` prop) or compose a hero-local variant that imports the inherited `itemVariants` timing — **do not** edit `reveal.jsx`'s 0.06s default (it is the shared baseline other phases inherit). Note `Reveal` is `whileInView`-triggered; for an above-the-fold hero entering after the boot wipe, the planner may need an `animate`-on-mount variant rather than `whileInView` — flag for planning.

---

### `src/components/hero/hero-background.jsx` (ambient motion, streaming loops)

**Analog:** `src/components/motion/reveal.jsx` — for the `'use client'` + `useReducedMotion()` gate and the transform/opacity-only contract. No existing ambient/loop component, so the loop bodies are new.

**Directive + gate** (from `reveal.jsx` lines 1-3, 19-33):
```jsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';

const prefersReducedMotion = useReducedMotion();
// D-07: render all 3 layers STATIC under reduced motion (no drift/twinkle),
// must still look like an intentional calm aurora-lit void.
```

**Token-driven layer pattern** (from `globals.css` lines 40-50 + `tailwind.config.js` lines 76-83 + `page.js` line 20 usage):
```jsx
// Layer (a) Aurora — reuse the inherited token, do not author a new gradient:
<motion.div className="bg-gradient-aurora ..." animate={{ /* translate/scale + opacity */ }} />
// Layer (b) Floating light blobs — accent hue is baked into --gradient-aurora / use shadow-glow tint:
<motion.div className="blur-3xl ..." />   // set blur ONCE; animate transform only
// Layer (c) ~28 particle dots — foreground/accent at low opacity, transform + opacity loop
```
- Use `bg-gradient-aurora` (token, `tailwind.config.js` line 77 → `--gradient-aurora` line 40) — already accent-tinted at the correct low opacity (0.18 dark / 0.12 light). **No new gradient, no hex.**
- Container: `absolute inset-0 -z-10 pointer-events-none` (UI-SPEC — must never intercept boot-skip/scroll-cue clicks).
- Loops: aurora ~18s, blobs ~14–20s, particles ~10–20s; `transform`/`opacity` only; `will-change: transform` sparingly on blobs/aurora (not on all 28 dots).

**Loop transition shape** (extend the `transition` object idiom from `reveal.jsx` line 41 — same `ease` family, add `repeat`):
```jsx
transition={{ duration: 18, ease: [0.22, 1, 0.36, 1], repeat: Infinity, repeatType: 'mirror' }}
```

---

### `src/components/hero/scroll-cue.jsx` (motion + Lucide icon, event-driven)

**Analogs:** `src/components/layout/theme-toggle.jsx` (Lucide glyph import + a11y `aria-label` + token color) and `reveal.jsx` (reduced-motion gate for the bob loop).

**Lucide icon + token-color pattern** (from `theme-toggle.jsx` lines 4, 34-38):
```jsx
import { ChevronDown } from 'lucide-react';
// ...
<ChevronDown className="h-5 w-5 text-muted-foreground" aria-label="Scroll to content" />
```
- Glyph: `ChevronDown` (UI-SPEC default). Color `text-muted-foreground` at rest; accent glow on hover/focus via `drop-shadow`/`--glow-accent` (token).
- The `text-primary`/token color usage and `aria-label` follow `theme-toggle.jsx` exactly.

**Bob loop + reduced-motion gate** (from `reveal.jsx` lines 19-33, 41):
```jsx
const prefersReducedMotion = useReducedMotion();
// static chevron under reduced motion (still visible as an affordance, no bob)
<motion.div
  animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
  transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity }}
>
```

**A11y / hit-area** (UI-SPEC § Scroll Cue + INHERITED 44×44px): if interactive (anchor to next section), wrap in a focusable element with ≥44×44px hit area and `aria-label="Scroll to content"` — same minimum the `size="icon"` Button enforces in `theme-toggle.jsx`.

- Position: `absolute bottom-12` (48px) horizontally centered, inside the hero section.

---

### `src/app/page.js` (route — MODIFIED)

**Analog (exact):** itself (Phase 1 version, lines 17-69).

**Pattern to apply:** Replace the placeholder section (the `System initialized` Reveal + stat-card `RevealGroup`, lines 20-66) with `<Hero />`. **DEFAULT per UI-SPEC: remove the Phase-1 placeholder + stat cards entirely** — the home route leads cleanly with boot → hero (stat cards are Phase 3 / DASH). Keep the established import + section-shell conventions:
```jsx
import { identity } from '@/data/identity';   // (lines 1-4 import style)
import { Hero } from '@/components/hero/hero'; // NEW
```
Decide here whether the boot overlay mounts in `page.js` (route-scoped) or `layout.js` (see below).

### `src/app/layout.js` (layout — MODIFIED, only if overlay mounts here)

**Analog (exact):** itself (Phase 1 version, lines 14-36).

**Mount pattern** (from `layout.js` lines 24-32 — note `ThemeProvider` is the existing client-component-inside-server-layout precedent):
```jsx
<ThemeProvider>
  {/* BootOverlay is a 'use client' component; mounting it here mirrors how
      ThemeProvider (also a client component) sits inside this server layout
      without making layout.js itself 'use client'. */}
  <BootOverlay />
  <header>...</header>
  <main>{children}</main>
</ThemeProvider>
```
> **Decision for planner (D, discretion):** mounting in `layout.js` makes the boot truly app-wide and lets it sit above `<main>` so it overlays the hero; the existing `ThemeProvider` (a client component already nested in this server layout, lines 5/24) is the precedent that this composes cleanly without converting `layout.js` to a client component. Alternatively scope it to `page.js`. Either way, the overlay is `fixed inset-0 z-50` so its DOM position is flexible. **Note (UI-SPEC WR-02 carry-over):** consume tokens (`bg-background`, etc.) — do NOT introduce `dark:` utilities or hex while WR-02 (dark palette on `:root` vs `darkMode:'class'`) is unresolved.

---

## Shared Patterns

### Client-component directive
**Source:** `src/components/motion/reveal.jsx` line 1, `theme-toggle.jsx` line 1, `theme-provider.jsx` line 1
**Apply to:** ALL new Phase 2 components (boot-overlay, brush-stroke, hero-background, scroll-cue). `hero.jsx` itself can stay a server component (it only reads data + composes `Reveal`, which is already `'use client'`).
```jsx
'use client';
```

### Reduced-motion gate (the universal motion contract)
**Source:** `src/components/motion/reveal.jsx` lines 19-33 (early-return-static) and 102-114 (variant-swap)
**Apply to:** boot-overlay (skip entirely), hero-background (render static), scroll-cue (stop bob). The hero entrance via `Reveal`/`RevealGroup` inherits the gate for free.
```jsx
const prefersReducedMotion = useReducedMotion();
// either early-return a static/`null` branch, or swap to static variants
```

### Token-only styling — NO hardcoded hex
**Source:** `src/app/globals.css` lines 19-65 (token definitions), `tailwind.config.js` lines 27-83 (token → utility mapping), `page.js` line 25 (`text-primary [text-shadow:var(--glow-accent)]`)
**Apply to:** every new file. Reserved Phase 2 tokens:
| Need | Token / utility |
|------|-----------------|
| Void background | `bg-background` (`--background` `#020202`) |
| Ink / primary text | `text-foreground` / `text-primary` |
| Secondary text (tagline) | `text-muted-foreground` |
| Aurora layer | `bg-gradient-aurora` (`--gradient-aurora`) |
| Accent glow (wordmark, stroke edge, cue hover) | `[text-shadow:var(--glow-accent)]` / `shadow-glow` / `var(--glow-accent)` |
| Soft shadow | `shadow-soft` (`--glow-soft`) |
| Glass (not heavily used this phase) | `glass-surface` / `bg-glass` / `border-glass` |

### Motion timing / easing baseline
**Source:** `src/components/motion/reveal.jsx` lines 41, 62, 71
**Apply to:** all new motion. Easing `[0.22, 1, 0.36, 1]`; reveal entrance 0.5s; group stagger 0.06s baseline (hero overrides to 0.08s **locally**, not in `reveal.jsx`). Boot sweep ~2.0s, wipe ~0.4s, particle/blob/aurora loops 10–20s, scroll-cue bob ~1.8s. **Animate transform / opacity / SVG `pathLength` only.**

### Lucide icon + a11y
**Source:** `src/components/layout/theme-toggle.jsx` lines 4, 31, 34-38
**Apply to:** scroll-cue (`ChevronDown`, `aria-label="Scroll to content"`, token color, ≥44×44px if focusable).

### Client-mount guard for browser-only reads
**Source:** `src/components/layout/theme-toggle.jsx` lines 18-25
**Apply to:** boot-overlay's `sessionStorage` read (defer to post-hydration to avoid SSR mismatch and to keep the hero rendering server-side from first paint).

---

## No Analog Found

These specific behaviors have **no** existing implementation to copy — the planner should compose them from the borrowed idioms above plus RESEARCH/UI-SPEC guidance:

| Behavior / File | Role | Data Flow | Reason |
|-----------------|------|-----------|--------|
| Global skip listeners (click/key/scroll) in `boot-overlay.jsx` | event-driven | event-driven | No existing component attaches window-level event listeners. Build on the `useEffect` setup/cleanup discipline from `theme-toggle.jsx`. |
| `sessionStorage` once-per-tab gating | persistence | — | No existing `sessionStorage`/`localStorage` direct use (next-themes handles its own persistence internally). New logic; key `careeros:boot-played`. |
| SVG `pathLength` brush-stroke draw + mask/wipe reveal | SVG motion | streaming | No SVG-path animation exists yet. Framer Motion's `pathLength` (0→1) is the sanctioned GPU-safe technique per UI-SPEC. |
| Ambient infinite transform/opacity loops (aurora/blobs/particles) | streaming | streaming | `reveal.jsx` only does one-shot in-view reveals; no `repeat: Infinity` loop exists. New, but reuses the same `ease` + transform/opacity-only rules. |
| Above-the-fold mount-entrance (vs `whileInView`) for the hero stack | motion | — | `Reveal`/`RevealGroup` trigger on `whileInView`; the hero enters after the boot wipe (above the fold). Planner may need an `animate`-on-mount variant reusing the inherited `itemVariants` timing. |

---

## Metadata

**Analog search scope:** `src/components/**` (motion, layout, ui, theme-provider), `src/app/**` (page, layout, globals.css), `src/data/**` (identity), `tailwind.config.js`, `src/lib/**`.
**Files scanned:** 9 read in full (all ≤ 142 lines — single-pass each), full `src/**` tree globbed (15 source files; component tree has only 4 pre-existing components).
**Pattern extraction date:** 2026-06-16
