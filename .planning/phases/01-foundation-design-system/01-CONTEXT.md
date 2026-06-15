# Phase 1: Foundation & Design System - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up a running **Next.js (latest, App Router) app in JavaScript** carrying the foundation every later phase consumes:
- The dichromatic design-token system (palette `#020202`/`#B2D5E5` + glass/gradient/glow tokens) wired through Tailwind, per the approved UI-SPEC.
- Dark + light theme switching (dark-first), persisted, with no flash-of-wrong-theme.
- A responsive layout baseline across mobile / tablet / desktop.
- An in-repo content data architecture seeded with known facts + tagged TODO placeholders.
- A reusable Framer Motion section-reveal wrapper that respects `prefers-reduced-motion`, demonstrated on a placeholder section.

**Covers requirements:** FND-01, FND-02, FND-03, FND-04, FND-07, MOT-01.

**Explicitly NOT in this phase:** the boot animation, hero, dashboard cards, dock, constellation, capsules, mission logs, command palette, Transmission Center (Phases 2–6), and the final reduced-motion enforcement + Lighthouse hardening pass (Phase 7). Phase 1 ships the primitives, not the named sections — it renders only a placeholder section to prove the foundation works.
</domain>

<decisions>
## Implementation Decisions

### Content Data Architecture (FND-07)
- **D-01:** Content lives in **split per-domain files** under `src/data/` — `identity.js`, `stats.js`, `projects.js`, `skills.js`, `experience.js`, `links.js`. Each later phase imports only the file it needs (smaller diffs, easier to locate placeholders). Rejected: a single `site.config.js` mega-object (grows large, every phase touches one file).
- **D-02:** Seed with **known facts** from PROJECT.md and clearly tag everything unknown as a **placeholder**. Known now: identity (name "Sourabh Jha", title "AI Engineer | Backend Engineer", tagline), links (GitHub `github.com/jha-sk`, LinkedIn `linkedin.com/in/sk-jha`, email `codewithsourabhjha@gmail.com`), seed skills (Golang, React, Next.js, Node.js, Docker, Kubernetes, AWS, Linux, AEM, Git, DevOps), seed project names (Git Automation CLI, DevOps Monitoring Dashboard, AEM Automation Toolkit, Cloud Infrastructure Projects). TODO placeholders: stat numbers, repo/demo URLs, project detail (architecture/features/challenges/lessons), achievements, experience timeline, resume PDF (dropped into `/public` later).
- **D-03:** Use a **consistent, greppable placeholder convention** so placeholders are trivial to find and fill in v2 (CNT2-01). Planner picks the exact marker (e.g. a `TODO_` value prefix and/or a `placeholder: true` flag) — discretion noted below.

### Theme Switching (FND-03)
- **D-04:** Use the **`next-themes`** library. It handles the pre-paint no-FOUC script, `localStorage` persistence, and system-preference detection out of the box, exposing a clean `useTheme()` hook. Rejected: hand-rolled inline-script + localStorage (more code to maintain, easy to get no-FOUC edge cases wrong).
- **D-05:** `ThemeProvider` config: `attribute="class"`, `defaultTheme="dark"` (dark-first per brand), `enableSystem` on. Theme class (`.dark` / light) toggles on `<html>`. The toggle is a Lucide `Sun`/`Moon` icon button with `aria-label="Toggle theme"` (per UI-SPEC copy contract).
- **D-06:** Token system must define values for **both** themes (UI-SPEC already declares the full light palette, incl. accent darkened to `#3E7C93` for AA). Tokens are CSS custom properties on `:root` (dark) and the light selector, surfaced to Tailwind.

### Project Structure & Conventions (greenfield — sets the project-wide pattern)
- **D-07:** Use a **`src/` directory** with a **`@/*` path alias → `./src/*`** in `jsconfig.json`. Layout: `src/app/` (routes, `layout.js`, `page.js`, `globals.css`), `src/components/` split into `ui/` (shadcn), `layout/`, and `motion/`, `src/data/` (content), `src/lib/` (utils incl. the `cn` helper). Rejected: root-level (no `src/`) — mixes code with root config files.
- **D-08:** **JavaScript only** — `.js`/`.jsx`, `jsconfig.json` (not `tsconfig`), no `.ts`/`.tsx` anywhere (hard project constraint).
- **D-09:** Fonts loaded via **`next/font`** (self-hosted Geist Sans + Geist Mono, `display: swap`, CSS-variable bound `--font-geist-sans` / `--font-geist-mono`), per UI-SPEC.

### ShadCN Setup
- **D-10:** Initialize ShadCN with **New York style**, `baseColor: neutral`, `cssVariables: true`, class-based dark mode. New York's tighter spacing/rounding fits the premium Apple-Vision-Pro aesthetic.
- **D-11:** **Minimal install in Phase 1** — only the foundation needs `button` (+ the theme/setup primitives). Components used by later phases (`command`, `dialog`, `tooltip`, `input`, `form`, `sonner`/`toast`, `badge`) are installed in the phase that uses them, not now.
- **D-12:** ShadCN's generated CSS variables are **overridden by the UI-SPEC token system** in `globals.css`, so every installed component automatically inherits the `#020202`/`#B2D5E5` OS look rather than shadcn's default neutrals. Components consume tokens — **no hard-coded hex in components** (contract violation otherwise).

### Motion Baseline (MOT-01)
- **D-13:** Ship **one reusable Framer Motion section-reveal wrapper** (in `src/components/motion/`) that every later section reuses: fade + 16px upward translate, `0.5s`, ease `[0.22, 1, 0.36, 1]`, `whileInView` once. It gates on `useReducedMotion()` so reduced-motion users get static content — every consumer inherits this for free (sets up FND-05 in Phase 7). Animate only `transform`/`opacity` (GPU-friendly). Full motion contract in UI-SPEC § Motion Baseline.

### Claude's Discretion
- Exact placeholder marker syntax (D-03) — pick a single greppable convention and document it at the top of `src/data/`.
- Precise data-object shapes/field names for each `src/data/*.js` file (must cover what the requirements describe; later phases consume them).
- Internal file/component naming, the `cn` util implementation, ESLint/Prettier config, and the exact `next/font` wiring.
- What the Phase-1 placeholder section renders, as long as it proves tokens + theme toggle + the motion wrapper on screen (UI-SPEC suggests a "System initialized" placeholder).
- Next.js project-creation specifics (e.g. `create-next-app` flags) — must respect the env gotchas in Canonical References.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Contract (READ FIRST)
- `.planning/phases/01-foundation-design-system/01-UI-SPEC.md` — **The approved visual & interaction contract for this phase and the whole project.** Locks design system (shadcn New York / Geist), spacing scale, typography (4 sizes / 2 weights), full dark + light color contract, glass/gradient/glow CSS-var tokens, copywriting voice, motion baseline, and responsive breakpoints. Every token/value here is binding — extend it, never redefine it.

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — FND-01, FND-02, FND-03, FND-04, FND-07, MOT-01 (this phase's requirements) plus v2 deferrals CNT2-01 (fill placeholders) that this phase's data architecture must make easy.
- `.planning/ROADMAP.md` § "Phase 1: Foundation & Design System" — goal + 5 success criteria (what must be TRUE).

### Project Constraints & Context
- `./CLAUDE.md` — locked tech stack and design constraints; GSD workflow rules.
- `.planning/PROJECT.md` § Context, § Constraints, § Key Decisions — seed identity/links/skills/project data, locked stack/design directives, and the **environment gotchas** below.

### Environment Gotchas (Windows / Node 26 box — MUST heed during execution)
- `.planning/PROJECT.md` § Context + `.planning/STATE.md` § Blockers/Concerns:
  - npm can produce a **truncated `next-swc` binary** → `next build` fails with "not a valid Win32 application"; fix = `npm cache clean --force` + reinstall.
  - **Avoid `@vercel/og` dynamic OG/icon routes** (crash on this Node 26 box) — use static OG/icon assets.
  - Lingering `next start` jobs corrupt `.next` under concurrent builds — kill the port owner + remove `.next` before re-testing.
- Memory note: `swc-corrupt-cache-gotcha` — the "not a valid Win32 application" error was a truncated npm download, not a Node-version issue.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **None — greenfield.** Repo contains only `.git`, `.planning/`, and `CLAUDE.md`. No `package.json`, no source. Phase 1 creates the entire scaffold from scratch.

### Established Patterns
- No code patterns exist yet — Phase 1's decisions (D-07 src/ layout, D-08 JS-only, D-12 token-override) **establish** the conventions every later phase follows.

### Integration Points
- This phase produces the integration surface for all later phases: the `@/data/*` content files, the `@/components/motion` reveal wrapper, the Tailwind token utilities, and the `ThemeProvider` in the root layout. Phases 2–6 consume these; they must not redefine them.

</code_context>

<specifics>
## Specific Ideas

- Aesthetic anchor: **Apple Vision Pro–like** premium dark glassmorphism; dichromatic minimalism (two hues only); no neon/cyberpunk, no generic cards/navbars/hero.
- "Career OS" framing — the foundation should already feel like an OS shell (brand wordmark `Career OS`, document title `Sourabh Jha — AI Engineer / Backend Engineer`).
- Phase-1 on-screen proof: a placeholder "System initialized" section confirming tokens + theme + motion are live (per UI-SPEC) — deliberately minimal; the real sections come in Phases 2–6.

</specifics>

<deferred>
## Deferred Ideas

- **CNT2-01 (v2):** Replacing TODO placeholder data (stat numbers, repo/demo URLs, project specifics, achievements, resume PDF) with real values. Phase 1 only makes this *easy* via the greppable placeholder convention (D-03); it does not fill them.
- **TXC2-01 (v2):** Real contact-message delivery — out of scope entirely for v1.
- Boot animation, hero, and all named sections — owned by Phases 2–6, not Phase 1.
- Final `prefers-reduced-motion` enforcement sweep + verified 90+ Lighthouse — owned by Phase 7. Phase 1 sets up the reduced-motion gate in the motion wrapper but does not run the full audit.

None of the above are scope creep into Phase 1 — they are correctly owned elsewhere and noted so they aren't lost.

</deferred>

---

*Phase: 1-foundation-design-system*
*Context gathered: 2026-06-16*
