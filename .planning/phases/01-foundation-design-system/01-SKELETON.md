# Walking Skeleton — Career OS (Sourabh Jha Portfolio)

**Phase:** 1
**Generated:** 2026-06-16

## Capability Proven End-to-End

A visitor loads the running Career OS app and sees the "System initialized" placeholder section reveal with a Framer Motion animation, reads content sourced from an in-repo data file (`src/data/identity.js`), and toggles between dark and light themes with the choice persisting across reload and no flash of the wrong theme.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js (latest, App Router), JavaScript only | Locked by CLAUDE.md / D-08 — `.js`/`.jsx`, `jsconfig.json`, no TypeScript anywhere |
| Language config | `jsconfig.json` with `@/*` -> `./src/*` | D-07 — `src/` layout keeps code separate from root config |
| Styling / tokens | Tailwind CSS + CSS custom properties declared once in `src/app/globals.css`, surfaced via `tailwind.config.js` | FND-02 / D-06 / D-12 — single dichromatic token source (`#020202` / `#B2D5E5`), both themes, glass/gradient/glow; shadcn neutrals overridden |
| Component library | ShadCN UI (New York, baseColor neutral, cssVariables, class dark mode); Phase 1 installs `button` only | D-10 / D-11 — minimal foundation; later phases add `command`, `dialog`, `tooltip`, `input`, `form`, `sonner`, `badge` |
| Theme system | `next-themes` (`attribute="class"`, `defaultTheme="dark"`, `enableSystem`) | D-04 / D-05 — no-FOUC pre-paint script + localStorage persistence out of the box |
| Animation engine | Framer Motion, one reusable section-reveal wrapper (`src/components/motion/reveal.jsx`) gated on `useReducedMotion()` | MOT-01 / D-13 — every later section inherits the reveal + reduced-motion gate for free |
| Fonts | Geist Sans (UI) + Geist Mono (OS/terminal accent) via `next/font`, CSS-variable bound | D-09 / UI-SPEC — self-hosted, `display: swap` |
| Data layer | Split per-domain JS files under `src/data/` with one greppable placeholder convention | D-01 / D-02 / D-03 — small diffs, easy placeholder fill in v2 (CNT2-01) |
| Deployment target | Vercel (custom domain later); Phase 1 proves the stack via local `npm run dev` + clean `npm run build` | Per CLAUDE.md; full deploy hardening is Phase 7 |
| Directory layout | `src/app/` (routes), `src/components/{ui,layout,motion}/`, `src/data/`, `src/lib/` | D-07 |

## Stack Touched in Phase 1

- [x] Project scaffold (Next.js App Router, Tailwind, ESLint, `next build`, `node --test` smoke runner)
- [x] Routing — the real home route `src/app/page.js`
- [x] Data — a real read from `src/data/identity.js` (and the full six-file architecture in 01-02); no DB in this static frontend, so the in-repo data file is the read source of truth
- [x] UI — a real interactive element: the dark/light theme toggle wired to `next-themes`, plus the in-view motion reveal
- [x] Deployment — documented local full-stack run: `npm run dev` (http://localhost:3000) and a clean production `npm run build`

> Note: this is a static, public, frontend-only portfolio — there is no database or backend server. The "real read AND write" requirement maps to: read = in-repo data file consumed at render; the only "write" surface in the whole product (the contact form) is deliberately simulated and lives in Phase 6. This is intentional minimalism, not a gap.

## Out of Scope (Deferred to Later Slices)

- Boot brush-stroke animation + animated hero (Phase 2)
- Dashboard stat glass cards + floating glass dock (Phase 3)
- About timeline + skills constellation (Phase 4)
- Project Capsules + Mission Log experience (Phase 5)
- Transmission Center contact form + Ctrl+K command palette + advanced motion layer (Phase 6)
- Full `prefers-reduced-motion` enforcement sweep + verified 90+ Lighthouse (Phase 7) — Phase 1 only sets up the reduced-motion gate in the wrapper
- Filling TODO placeholder data with real values (CNT2-01, v2)
- Real contact-message delivery (TXC2-01, v2)
- Any dynamic OG/icon route via `@vercel/og` (excluded — Node-box crash; static assets only)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: Zen brush-stroke boot reveal -> premium animated hero (name/title/tagline + particle/aurora background)
- Phase 3: Glass dashboard stat cards + floating glass dock navigation
- Phase 4: Interactive About timeline + floating technology constellation
- Phase 5: Project Capsules with immersive panels + Mission Log experience entries
- Phase 6: Transmission Center contact panel + Ctrl+K command palette + advanced motion (parallax, mouse-follow glow, glass reflections)
- Phase 7: Reduced-motion enforcement + 90+ Lighthouse hardening pass
