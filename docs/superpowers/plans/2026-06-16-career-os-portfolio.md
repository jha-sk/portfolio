# Career OS Portfolio Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Sourabh Jha portfolio's visual layer + content as the dichromatic "Career OS" terminal/blueprint design, populated with real résumé data.

**Architecture:** Keep the existing Next.js (App Router, JavaScript) engine, Tailwind, Framer Motion, ShadCN primitives, `src/` layout, and per-domain `src/data/*` files. Replace the design tokens (dichromatic `#020202`/`#B2D5E5`, two-font system), all visual components, and the placeholder data. Dark-only. All motion transform/opacity with `useReducedMotion` gates.

**Tech Stack:** Next.js 15 App Router (JS), Tailwind CSS, Framer Motion, Lucide, `next/font` (IBM Plex Sans + JetBrains Mono), ShadCN primitives.

**Reference:** `docs/superpowers/specs/2026-06-16-career-os-portfolio-design.md` (the design contract — read it before building).

**Verification model:** each task ends with `npx next lint` (clean) and, where it changes rendered output, `rm -rf .next && npx next build` (clean) + an SSR/data smoke check. Commit per task. Heed the Windows `next-swc` gotcha (`npm cache clean --force` + reinstall if `next build` errors "not a valid Win32 application").

---

## File Structure

```
src/
  app/
    layout.js          (MODIFY: dark-only, Plex fonts, dock + boot mount, metadata)
    page.js            (REWRITE: assemble all sections)
    globals.css        (REWRITE: dichromatic tokens, scanline/grid/glow utilities)
  lib/
    fonts.js           (REWRITE: IBM Plex Sans + JetBrains Mono)
    utils.js           (KEEP: cn helper)
  data/
    identity.js stats.js skills.js experience.js projects.js
    certifications.js education.js links.js   (REWRITE/ADD: real résumé data)
    placeholders.js README.md                 (KEEP/trim)
  components/
    ui/console-panel.jsx                       (NEW: the window-frame primitive)
    blueprint/{node,axis,coordinate,grid-plane,chip}.jsx  (NEW: accent primitives)
    motion/{reveal.jsx, mount-reveal.jsx}      (KEEP reveal; ADD mount-reveal)
    boot/boot-overlay.jsx                       (REWRITE: power-on reskin)
    hero/hero.jsx                               (REWRITE: approved hybrid)
    sections/{snapshot,about,skills,experience,projects,certs-education,contact}.jsx (NEW)
    projects/project-window.jsx                 (NEW: expandable repo window)
    nav/dock.jsx                                (NEW: floating dock)
tailwind.config.js     (MODIFY: token mapping, fonts, screens)
public/Sourabh-Jha-Resume.pdf                  (ASSET: drop in)
```

Remove after rebuild: `src/components/hero/{hero-grid,hero-plot,scroll-cue}.jsx`, `src/components/boot/brush-stroke.jsx`, `src/components/layout/theme-toggle.jsx` (dark-only), `src/components/theme-provider.jsx` (if next-themes dropped).

---

## Task 1: Fonts + dichromatic design tokens

**Files:** Modify `src/lib/fonts.js`, `src/app/globals.css`, `tailwind.config.js`.

- [ ] **Step 1: Swap fonts** — `fonts.js`: export `ibmPlexSans` (`IBM_Plex_Sans`, weights 400/600/700, var `--font-sans`) and `jetBrainsMono` (`JetBrains_Mono`, weights 400/500/700, var `--font-mono`) from `next/font/google`, `display: 'swap'`.
- [ ] **Step 2: Rewrite tokens** — `globals.css`: `:root` only (dark). Define `--bg:#020202`; ice-blue tiers `--fg:#B2D5E5`, `--fg-2:rgba(178,213,229,.62)`, `--fg-3:rgba(178,213,229,.42)`, `--line:rgba(178,213,229,.18)`, `--line-strong:rgba(178,213,229,.3)`; `--glow:0 0 28px rgba(178,213,229,.4)`; `--panel-shadow:0 24px 70px rgba(0,0,0,.6)`. Add `@layer utilities`: `.scanlines` (repeating-linear-gradient 0deg rgba ice .035), `.grid-plane` (two linear-gradients, 34px), `.text-glow` (text-shadow var(--glow)). Map shadcn vars onto these.
- [ ] **Step 3: Map Tailwind** — `tailwind.config.js`: remove `darkMode` dependence on toggle (keep class harmless); colors `background:var(--bg)`, `fg/fg2/fg3/line` → vars; `boxShadow.glow/panel`; `fontFamily.sans:[var(--font-sans)…]`, `mono:[var(--font-mono)…]`; keep `maxWidth.content:1200px`, screens.
- [ ] **Step 4: Verify** — `npx next lint` clean. (Build verified after Task 2 wires a page.)
- [ ] **Step 5: Commit** — `git commit -m "feat: dichromatic Career OS tokens + IBM Plex/JetBrains fonts"`

---

## Task 2: Real résumé data

**Files:** Rewrite `src/data/{identity,stats,skills,experience,projects}.js`; create `certifications.js`, `education.js`; update `links.js`; add `tests/data.test.mjs` assertions.

- [ ] **Step 1: identity.js** — `{ name:'Sourabh Jha', title:'AI Engineer · Backend Engineer', tagline:'Building scalable systems — backend foundations, AI on top.' }`.
- [ ] **Step 2: links.js** — email `codewithsourabhjha@gmail.com`, phone `+91 76939 03439`, github `https://github.com/jha-sk`, linkedin `https://www.linkedin.com/in/sk-jha`, resume `/Sourabh-Jha-Resume.pdf`.
- [ ] **Step 3: stats.js** — featured telemetry: uptime `99.9%`, prodIssues `50+`, mttr `−30%`, perf `+20%`, deploy `−15–20%` (label + value, known facts, no placeholder marker).
- [ ] **Step 4: skills.js** — array of `{category, items[]}` per spec §5 (Languages, Backend & APIs, Cloud & DevOps, Databases, Tools/Observability, Security, AI-Augmented, Practices).
- [ ] **Step 5: experience.js** — one entry: Accenture, Associate Software Engineer, `Nov 2024 – Present`, `bullets:[…8 from spec…]`, `tech:[Java,REST,Docker,GitHub Actions,…]`.
- [ ] **Step 6: projects.js** — Ash OS / Website Nativefier / Git Automation CLI, each `{name, stack[], summary, highlight (metric), bullets[], github, demo|null}`.
- [ ] **Step 7: certifications.js / education.js** — MS Security Ops Analyst Associate + Udemy Golang; B.Tech CSE, SRM Sonepat, CGPA 7.72.
- [ ] **Step 8: data smoke test** — `tests/data.test.mjs`: assert identity fields present, skills has ≥7 categories, projects length 3 with github URLs, experience has ≥6 bullets, no `TODO_` token leaks in featured fields. Run `node --test tests/data.test.mjs` → PASS.
- [ ] **Step 9: Commit** — `git commit -m "feat: real résumé data across src/data"`

---

## Task 3: Core primitives — ConsolePanel + blueprint accents + mount-reveal

**Files:** Create `src/components/ui/console-panel.jsx`, `src/components/blueprint/{node,axis,coordinate,grid-plane,chip}.jsx`, `src/components/motion/mount-reveal.jsx`. Keep `motion/reveal.jsx`.

- [ ] **Step 1: ConsolePanel** — props `{title, dots=false, children, className}`. Renders a window: title bar (`font-mono text-fg-3`, optional 3 hairline dots, the `title` like `~/projects`), body with `.scanlines`/hairline border, `shadow-panel`, inner glow. Token-only.
- [ ] **Step 2: Blueprint primitives** — `Node` (glowing dot, `shadow-glow`, optional pulse gated by `useReducedMotion`), `Axis` (gradient hairline, optional `scaleX` draw), `Coordinate` (mono tag e.g. `[ 042 · 117 ]`), `GridPlane` (perspective grid bg, reduced-motion static), `Chip` (mono bordered skill chip with inner glow).
- [ ] **Step 3: MountReveal** — like `RevealGroup`/`Item` but `animate="visible"` on mount (for above-the-fold), stagger 0.08, reuses the reveal item variants; reduced-motion static. (Reuse from Phase-2 `hero-reveal.jsx` logic.)
- [ ] **Step 4: Verify** — `npx next lint` clean.
- [ ] **Step 5: Commit** — `git commit -m "feat: console-panel + blueprint primitives + mount-reveal"`

---

## Task 4: Boot reveal (power-on reskin)

**Files:** Rewrite `src/components/boot/boot-overlay.jsx`; delete `brush-stroke.jsx`.

- [ ] **Step 1: BootOverlay** — sessionStorage `careeros:boot-shown`; phases pending→play→done; once-per-session; skip on pointer/key/wheel/touch; reduced-motion → instant. Power-on visual: the void with a grid-plane fading up + the `SOURABH JHA` wordmark glow-igniting (opacity + text-glow ramp, ~1.5–2s), then curtain wipe (`y:-100%`, transform-only). Returning/reduced → instant removal (no wipe). Mount in layout, does not block SSR.
- [ ] **Step 2: Verify** — `npx next lint` clean.
- [ ] **Step 3: Commit** — `git commit -m "feat: Career OS power-on boot reveal"`

---

## Task 5: Hero (approved hybrid)

**Files:** Rewrite `src/components/hero/hero.jsx`; delete `hero-grid.jsx`, `hero-plot.jsx`, `scroll-cue.jsx` (fold scroll cue inline or keep one small cue file).

- [ ] **Step 1: Hero** — terminal ConsolePanel-style frame: title bar `~/career-os — zsh`, scanlines, ambient glow blob. Content via MountReveal: `// identity` node kicker → 3D-extruded glowing `SOURABH JHA` (IBM Plex Sans 700, `clamp(40px,7.5vw,76px)`, the `t3d` text-shadow stack) → drawn axis → role `// ai engineer · backend engineer` (mono) → skill chips (top 5–6 from data) → telemetry line from `stats`. Coordinate tag top-right. Scroll cue bottom → `#snapshot`. Full `min-h-[100svh]`. Read all copy from `identity`/`stats`/`skills`.
- [ ] **Step 2: Verify** — `npx next lint`; `rm -rf .next && npx next build` clean; SSR check `index.html` contains `Sourabh Jha`, role, a metric.
- [ ] **Step 3: Commit** — `git commit -m "feat: Career OS hero (terminal frame + 3D blueprint wordmark)"`

---

## Task 6: Snapshot + About sections

**Files:** Create `src/components/sections/snapshot.jsx`, `about.jsx`.

- [ ] **Step 1: Snapshot** — `id="snapshot"`. A responsive row of telemetry stat panels from `stats` (glowing IBM Plex Sans number + mono label), each a small ConsolePanel/bordered cell. RevealGroup stagger; reduced-motion static.
- [ ] **Step 2: About** — `id="about"`. A `~/about` ConsolePanel with the confirmed bio prose (Plex Sans body, `text-fg-2`), max-w-prose. Reveal.
- [ ] **Step 3: Verify** — `npx next lint`; `next build` clean.
- [ ] **Step 4: Commit** — `git commit -m "feat: snapshot + about sections"`

---

## Task 7: Skills + Experience sections

**Files:** Create `src/components/sections/skills.jsx`, `experience.jsx`.

- [ ] **Step 1: Skills** — `id="skills"`. ConsolePanel titled `// system_spec`; grid of category panels from `skills` (mono category label + `Chip` per item, glowing). Responsive 1→2→3 cols. RevealGroup.
- [ ] **Step 2: Experience** — `id="experience"`. ConsolePanel titled `// changelog`; the Accenture entry: header (role · company · `Nov 2024 – Present` right-aligned mono), bullets as `+` log lines (mono `+` in `text-fg`, text in `text-fg-2`), metrics emphasized via `text-fg`/glow. Reveal.
- [ ] **Step 3: Verify** — `npx next lint`; `next build` clean.
- [ ] **Step 4: Commit** — `git commit -m "feat: skills + experience sections"`

---

## Task 8: Projects (expandable) + Certifications/Education

**Files:** Create `src/components/projects/project-window.jsx`, `src/components/sections/projects.jsx`, `certs-education.jsx`.

- [ ] **Step 1: ProjectWindow** — `'use client'`. Props from a `projects` entry. A repo window: title bar `~/<repo>`, stack `Chip`s, summary + `highlight` metric (glowing), GitHub/Demo links (Lucide icons, demo hidden if null). Expandable: a toggle reveals the `bullets[]` detail (height/opacity via Framer, reduced-motion = static toggle). aria-expanded, keyboard accessible.
- [ ] **Step 2: Projects** — `id="projects"`. Section header + grid of `ProjectWindow` (3 items). Responsive.
- [ ] **Step 3: Certs/Education** — `id="credentials"`. Two paired compact ConsolePanels from `certifications`/`education`.
- [ ] **Step 4: Verify** — `npx next lint`; `next build` clean; SSR check contains `Ash OS`, `Git Automation CLI`, `SRM`.
- [ ] **Step 5: Commit** — `git commit -m "feat: projects (expandable) + certifications/education"`

---

## Task 9: Contact (simulated) + Dock nav

**Files:** Create `src/components/sections/contact.jsx`, `src/components/nav/dock.jsx`.

- [ ] **Step 1: Contact** — `id="contact"`, `'use client'`. Transmission console: terminal-style inputs (`name>`, `email>`, `message>` with mono prompts), client validation (required + email regex; errors shown in ice-blue + icon, no red hue), `INITIATE TRANSMISSION` button → on valid submit show simulated `// transmission successful` output state; **nothing is sent**. Plus links row (email/LinkedIn/GitHub/résumé) from `links`. Labels + aria on inputs.
- [ ] **Step 2: Dock** — `'use client'`. Floating bottom-center glass-ish (dichromatic) dock with section jumps (Home/Snapshot/Skills/Experience/Projects/Contact) using anchor scroll + active-section highlight (IntersectionObserver), `useReducedMotion`-aware. Lucide icons + mono labels.
- [ ] **Step 3: Verify** — `npx next lint`; `next build` clean.
- [ ] **Step 4: Commit** — `git commit -m "feat: transmission contact (simulated) + floating dock nav"`

---

## Task 10: Assembly, layout, asset, final verify

**Files:** Rewrite `src/app/page.js`, modify `src/app/layout.js`; add `public/Sourabh-Jha-Resume.pdf`; remove dead theme-toggle/provider/old-hero files.

- [ ] **Step 1: layout.js** — dark-only: `<html className="dark">`, Plex fonts on body, metadata (title `Sourabh Jha — AI Engineer · Backend Engineer`, description, OpenGraph with a static image), mount `<BootOverlay/>` + `<Dock/>`. Remove header/theme-toggle. Remove `next-themes` provider if unused (or keep forced-dark).
- [ ] **Step 2: page.js** — assemble in order: Hero, Snapshot, About, Skills, Experience, Projects, Certs/Education, Contact. Each section wrapped with the `max-w-content` container where appropriate.
- [ ] **Step 3: Drop résumé** — place the provided PDF at `public/Sourabh-Jha-Resume.pdf`.
- [ ] **Step 4: Remove dead files** — `git rm` old hero subcomponents, brush-stroke, theme-toggle (+ provider if dropped).
- [ ] **Step 5: Final verify** — `npx next lint` clean; `rm -rf .next && npx next build` clean (4 pages); SSR `index.html` contains name, role, all section anchors, real project names, no `TODO_` leak; manual reduced-motion + responsive note for human browser check.
- [ ] **Step 6: Commit** — `git commit -m "feat: assemble Career OS portfolio + résumé asset + cleanup"`

---

## Self-Review

- **Spec coverage:** §2 design system → Tasks 1,3. §4 IA / 8 sections → Tasks 5–9 (+ dock, boot). §5 real data → Task 2. §6 tech → all. Boot/dock/light-theme-drop → Tasks 4,9,10. Assets §7 → Task 10 step 3 + links fallbacks (demo null hides action). All covered.
- **No placeholders:** data is real (spec §5); the only deferred assets (exact repo URLs beyond profile, live demos, About final wording) have explicit fallbacks (profile link, hidden demo, draft copy to confirm).
- **Consistency:** token/var names and component prop names are consistent across tasks; `stats`/`skills`/`projects` shapes defined in Task 2 are consumed unchanged in Tasks 5–9.

## Human-verify (after build)

Browser pass: boot power-on (once/session, skippable, reduced-motion bypass); hero wordmark + telemetry; each section in the dichromatic terminal language; projects expand; contact validates + simulated success; dock active-state + scroll; light-theme absent; responsive ≥320px; reduced-motion static. Then tweak.
