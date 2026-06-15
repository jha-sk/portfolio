---
phase: 01-foundation-design-system
plan: 01
subsystem: foundation
tags: [scaffold, design-system, theme, motion, tailwind, shadcn, nextjs]
dependency_graph:
  requires: []
  provides:
    - "Next.js 15 App Router (JavaScript) scaffold with @/* -> ./src/* alias"
    - "Dichromatic token system (globals.css) surfaced as Tailwind utilities"
    - "next-themes ThemeProvider (dark-first, persisted, no-FOUC) + theme toggle"
    - "Reusable Framer Motion section-reveal wrapper gated on useReducedMotion"
    - "src/data/identity.js content surface + greppable TODO_ placeholder convention"
    - "cn() class-merge helper; Geist Sans/Mono via next/font; shadcn button"
    - "tests/smoke.test.mjs end-to-end build smoke test (node:test)"
  affects:
    - "All later phases consume these primitives (tokens, ThemeProvider, Reveal, @/data/*, cn)"
tech_stack:
  added:
    - "next@15.5.19, react@19, react-dom@19"
    - "tailwindcss@3.4, framer-motion@11, lucide-react, next-themes"
    - "clsx, tailwind-merge"
    - "eslint + eslint-config-next, postcss, autoprefixer (dev tooling)"
  patterns:
    - "Single token source: CSS custom properties on :root (dark) + .light, surfaced via tailwind.config var(--…)"
    - "Components consume tokens only — no hard-coded hex (D-12)"
    - "src/ layout: app/, components/{ui,layout,motion}/, data/, lib/"
    - "JavaScript only — .js/.jsx, jsconfig.json, no TypeScript anywhere"
key_files:
  created:
    - package.json
    - jsconfig.json
    - next.config.mjs
    - postcss.config.mjs
    - .eslintrc.json
    - components.json
    - tailwind.config.js
    - .gitignore
    - src/app/globals.css
    - src/app/layout.js
    - src/app/page.js
    - src/lib/utils.js
    - src/lib/fonts.js
    - src/components/theme-provider.jsx
    - src/components/layout/theme-toggle.jsx
    - src/components/motion/reveal.jsx
    - src/components/ui/button.jsx
    - src/data/identity.js
    - tests/smoke.test.mjs
  modified: []
decisions:
  - "Authored shadcn button without @radix-ui/react-slot + class-variance-authority to keep the runtime to exactly the nine audited packages (threat model T-01-SC)"
  - "Used next/font Geist (google loader, self-hosted, display swap) bound to --font-geist-sans/--font-geist-mono"
  - "TODO_ value-prefix + placeholder:true flag chosen as the greppable placeholder convention (D-03)"
metrics:
  duration_min: 6
  completed: "2026-06-15"
  tasks_completed: 3
  files_created: 19
---

# Phase 01 Plan 01: Foundation & Design System (Walking Skeleton) Summary

One-liner: A running Next.js 15 App Router app in JavaScript that proves the full Career OS foundation end-to-end — dichromatic tokens, dark-first next-themes toggle, a reduced-motion-gated Framer Motion reveal, and a data-driven "System initialized" placeholder — with a clean production build and a passing node:test smoke test.

## What Was Built

The Career OS Walking Skeleton scaffold:

- **Scaffold (Task 2):** Next.js 15 App Router, JavaScript only (`jsconfig.json` mapping `@/*` -> `./src/*`, no `.ts`/`.tsx`, no `tsconfig.json`). Exactly the nine audited runtime/styling packages plus ESLint/PostCSS dev tooling. `components.json` (New York, neutral, `cssVariables: true`, `tsx: false`); only the `button` component under `src/components/ui/`.
- **Token system (Task 2):** `src/app/globals.css` declares every UI-SPEC token once as CSS custom properties on `:root` (dark default) and `.light` — colors for both themes (`#020202`/`#B2D5E5` dark, `#F4F7F9`/`#3E7C93` light), plus the full glass/gradient/glow set. shadcn's neutral variables are overridden so installed components inherit the OS look. `tailwind.config.js` surfaces tokens via `var(--…)` as utilities (`bg-background`, `text-primary`, `bg-glass`, `border-glass`, `shadow-glow`, `shadow-soft`), sets `darkMode: 'class'`, binds Geist Sans/Mono, declares the 4 type sizes, md/lg/xl breakpoints, and the 1200px container. An opaque `.glass-surface` fallback covers unsupported `backdrop-filter`.
- **Theme + motion + data wiring (Task 3):** `theme-provider.jsx` (next-themes, `attribute="class"`, `defaultTheme="dark"`, `enableSystem`); `layout.js` (Geist font vars on `<body>`, `suppressHydrationWarning`, metadata title "Sourabh Jha — AI Engineer / Backend Engineer", "Career OS" wordmark + toggle in chrome); `theme-toggle.jsx` (Sun/Moon icon button, `aria-label="Toggle theme"`, 44x44 hit area, tokens only); `reveal.jsx` (fade + 16px y, 0.5s, ease `[0.22,1,0.36,1]`, `whileInView` once, gated on `useReducedMotion()`); `identity.js` (seeded known facts + documented `TODO_` placeholder convention); `page.js` ("System initialized" section reading `identity.name` inside `<Reveal>`).
- **Smoke test (Task 1):** `tests/smoke.test.mjs` (node:test only) asserts `next build` exits zero and the prerendered home output contains "System initialized", the document title, and "Sourabh Jha".

## How It Works

`layout.js` wraps the app in `ThemeProvider`; next-themes injects a pre-paint script that sets the theme class on `<html>` before first paint (no FOUC) and persists the choice to localStorage. Tailwind utilities resolve to `var(--token)` values that flip between the `:root` (dark) and `.light` blocks when the theme class changes, so a single token source drives both themes. `page.js` imports the `identity` object from the in-repo data file and renders it inside the shared `Reveal` wrapper, which animates transform/opacity only and degrades to static content under `prefers-reduced-motion`.

## Verification Evidence

- `npm run lint` exits zero (no ESLint warnings or errors).
- `rm -rf .next && npm run build` exits zero — production build, 4 static pages generated, no truncated next-swc issue on this Node 26 box.
- `node --test tests/smoke.test.mjs` PASSES (GREEN): build succeeds and the rendered output contains all three required strings.
- Token check: globals.css contains `--glass-bg`, `#020202`, `#B2D5E5`, `--glow-accent`, `.light`, `--gradient-aurora`; tailwind.config.js wires `var(--…)`.
- Wiring check: toggle `aria-label="Toggle theme"`, reveal `useReducedMotion`, page reads `@/data/identity` — all present.
- No `.ts`/`.tsx`/`tsconfig.json`; only `button.jsx` under `src/components/ui/`.

## TDD Gate Compliance

- RED: `test(01-01)` commit `6fc314a` — smoke test failed before scaffold existed.
- GREEN: `feat(01-01)` commits `957fdc7` (scaffold) and `68ef637` (wiring) — smoke test passes.
- No REFACTOR commit needed (implementation was minimal and clean).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] shadcn button authored without two transitive packages**
- **Found during:** Task 2
- **Issue:** The canonical shadcn `button` imports `@radix-ui/react-slot` and `class-variance-authority`. Installing them would have exceeded the threat-model-audited nine-package runtime set (T-01-SC), which the plan explicitly forbids ("install no others without re-auditing").
- **Fix:** Authored `src/components/ui/button.jsx` in the New York visual style using a plain variant/size map + the `cn` helper (clsx + tailwind-merge), preserving the shadcn API surface (`Button`, `buttonVariants`, `variant`/`size`/`asChild`-free props) without the two extra packages. No `asChild`/`Slot` is used in Phase 1; later phases can re-audit and add those packages if needed.
- **Files modified:** src/components/ui/button.jsx
- **Commit:** 957fdc7

No other deviations — plan executed as written.

## Authentication Gates

None — static frontend scaffold, no auth surface this phase.

## Known Stubs

The "System initialized" placeholder section is an intentional Phase-1 deliverable (per CONTEXT/SKELETON/UI-SPEC), not a stub — it exists to prove tokens + theme + motion on screen. The named sections arrive in Phases 2-6. `src/data/identity.js` holds only known facts (no TODO_ markers); the broader data architecture (stats, projects, skills, experience, links with TODO_ placeholders) is owned by plan 01-02.

## Notes for Next Plan (01-02)

- The `@/data/*` directory and `TODO_` placeholder convention are established; 01-02 adds `stats.js`, `projects.js`, `skills.js`, `experience.js`, `links.js`.
- The `Reveal` wrapper, token utilities, and `ThemeProvider` are the integration surface — extend, do not redefine.
- `package-lock.json` is committed; keep the runtime to the audited set unless re-auditing.

## Self-Check: PASSED

All 18 listed source files and all three task commits (6fc314a, 957fdc7, 68ef637) verified present on disk and in git history.
