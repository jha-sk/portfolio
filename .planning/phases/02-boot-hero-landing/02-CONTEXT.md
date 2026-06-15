# Phase 2: Boot & Hero Landing - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the first stunning on-screen slice of Career OS: a zen brush-stroke **boot animation** that renders over the `#020202` void on first load and reveals the homepage, handing off to a premium **hero** showing the name, title, and tagline over an animated particle / aurora / floating-light background.

**Covers requirements:** BOOT-01, BOOT-02, HERO-01, HERO-02.

**Builds on Phase 1:** replaces the Phase-1 placeholder home (`src/app/page.js`) with the real boot + hero experience. Reuses the locked foundation — Geist fonts, the dichromatic palette, the `Reveal` motion wrapper + `useReducedMotion()` gate, the glass/gradient/glow tokens (incl. the existing `bg-gradient-aurora`), `next-themes`, and `src/data/identity.js`.

**Explicitly NOT in this phase:** the floating glass dock / nav (NAV — Phase 3), dashboard stat cards (DASH — Phase 3), command palette (CMD — Phase 6), and the final reduced-motion enforcement sweep + 90+ Lighthouse audit (Phase 7). The hero must respect reduced-motion and stay GPU-friendly from the start, but the formal performance pass is Phase 7.
</domain>

<decisions>
## Implementation Decisions

### Boot Animation Form (BOOT-01)
- **D-01:** The boot is a **single calligraphic brush stroke that sweeps across the `#020202` void and "wipes" away (SVG stroke mask) to reveal the hero beneath it.** One clean gesture — most "zen", most GPU-cheap. Rejected: stroke-by-stroke wordmark painting (more work, more branded but heavier) and stroke→particle-dissolve (most cinematic but most complex). Keep it to a single stroke + reveal.
- **D-02:** The stroke renders over the `#020202` background (matches the void so the reveal feels like the stroke uncovering the hero, not a separate screen). Accent (`#B2D5E5`) may tint the stroke subtly — exact ink treatment is Claude's discretion within the dichromatic palette (no third hue).

### Boot Skip & Replay (BOOT-02)
- **D-03:** Boot plays **once per browser tab session**, tracked via **`sessionStorage`**. It does NOT replay on client-side route changes (BOOT-02's "does not replay disruptively on subsequent navigations"); it replays on a fresh visit / new tab. Rejected: `localStorage` once-ever (owner stops seeing their own showcase) and every-load (repetitive for recruiters).
- **D-04:** Boot **auto-advances** after its duration AND is **skippable immediately** by any click, key press, or scroll. Skipping jumps straight to the hero.
- **D-05:** Under `prefers-reduced-motion`, the boot **does not animate** — the hero is shown immediately (no stroke sweep). Reuse the existing `useReducedMotion()` gate pattern from `src/components/motion/reveal.jsx`.

### Hero Background Technique (HERO-02)
- **D-06:** Build the animated background with **CSS/SVG + Framer Motion only — no canvas, no new dependencies.** Layers: (a) animated **aurora** via the existing `--gradient-aurora` token / animated radial gradients, (b) **floating light** as a few large blurred divs drifting on slow transform loops, (c) a **light particle layer** (~20–40 CSS/SVG dots on slow transform/opacity loops). Rejected: canvas particle engine (tsParticles/OGL — adds a dep, perf risk vs 90+ Lighthouse) and hand-rolled canvas (more code to own). Exact particle count/density is Claude's discretion.
- **D-07:** All background motion animates **only `transform`/`opacity`** (GPU-friendly, sets up FND-06), stays **subtle** (no neon/cyberpunk per CLAUDE.md), and **degrades to static** under reduced-motion.

### Hero Composition & Content (HERO-01)
- **D-08:** **Centered** vertical stack: large **"SOURABH JHA"** wordmark (UI-SPEC Display role, the documented **700-weight** hero exception, scaling up via `clamp()`), the **title** "AI Engineer | Backend Engineer" below it, then the **tagline** below that.
- **D-09:** Use the existing **`identity.js`** values as-is — `name`, `title`, and `tagline` ("Building scalable systems — backend foundations and AI on top."). Do NOT hardcode hero text in the component; read from the data file.
- **D-10:** Include a subtle **animated scroll-down cue** at the bottom of the hero (entry affordance). Rejected for now: a ⌘K command-palette hint (forward-references Phase 6, premature) and left-aligned editorial layout (less conventional than the centered wordmark the brief implies).
- **D-11:** No dock/nav in this phase (Phase 3). The hero is a full-viewport-height first section; the existing stat/placeholder content from Phase 1 may move below the hero or be removed — Claude's discretion, as long as the home route leads with boot→hero.

### Motion / Reuse
- **D-12:** Reuse the existing `Reveal` wrapper for hero element entrance where it fits; the boot stroke and the ambient background loops are new motion components but MUST follow the same contract (transform/opacity only, `useReducedMotion()` gate, ease `[0.22, 1, 0.36, 1]` family). Extend the motion layer; do not redefine the baseline.

### Claude's Discretion
- Exact boot stroke duration (target ~2–2.5s), easing, and ink treatment within the palette.
- Particle count/density, floating-light blob count, and aurora animation timing — tuned for "subtle" and 90+ Lighthouse headroom.
- Hero entrance choreography (wordmark/title/tagline stagger after the boot reveal).
- Scroll-cue styling and animation.
- Component file layout under `src/components/` (e.g. `boot/`, `hero/`) and whether the boot is a client overlay component.
- Whether to keep/relocate the Phase-1 placeholder section below the hero.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Contract & Phase 1 Foundation (READ FIRST)
- `.planning/phases/01-foundation-design-system/01-UI-SPEC.md` — the binding design system. Esp. § Typography (Display role + the 700-weight hero-wordmark exception), § Color (dichromatic, accent reserved-for list, aurora/glow tokens), § Motion Baseline (durations, easing, reduced-motion gate, transform/opacity-only rule).
- `src/components/motion/reveal.jsx` — the existing motion wrapper + `useReducedMotion()` gate to reuse/extend.
- `src/data/identity.js` — hero content (name / title / tagline) to read, not hardcode.
- `src/app/globals.css` + `tailwind.config.js` — existing tokens: `bg-gradient-aurora`, `glass-surface`, `shadow-glow`/`--glow-accent`, `bg-background`, `text-primary`.
- `src/app/page.js` — the Phase-1 placeholder home this phase replaces/restructures.

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — BOOT-01, BOOT-02, HERO-01, HERO-02 (this phase) + MOT-02 (advanced motion, Phase 6) and FND-05/FND-06 (reduced-motion sweep + Lighthouse, Phase 7) for awareness.
- `.planning/ROADMAP.md` § "Phase 2: Boot & Hero Landing" — goal + 4 success criteria.

### Project Constraints & Env
- `./CLAUDE.md` — locked stack/design (no neon/cyberpunk, Apple-Vision-Pro aesthetic, JavaScript not TypeScript, Framer Motion required).
- `.planning/PROJECT.md` § Context — env gotchas (truncated `next-swc` → cache clean + reinstall; avoid `@vercel/og` dynamic routes; kill port + remove `.next` before re-test).

### Open quality note carried from Phase 1
- `.planning/phases/01-foundation-design-system/01-REVIEW.md` — **WR-02**: dark palette is on `:root` while `darkMode: 'class'` is set. Phase 2 will introduce hero/boot styling and possibly the first `dark:` utilities — reconcile the theme source-of-truth (either fix WR-02 or consciously avoid `dark:` utilities) so the boot/hero render correctly in both themes.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (from Phase 1)
- `Reveal` / `RevealGroup` / `RevealItem` (`src/components/motion/reveal.jsx`) — section-reveal + stagger with reduced-motion gate. Reuse for hero element entrance.
- Tokens in `globals.css` / `tailwind.config.js`: `--gradient-aurora` (`bg-gradient-aurora`), `glass-surface`, `--glow-accent`/`shadow-glow`, full dark+light palette. The aurora token is a ready-made starting layer for HERO-02.
- `src/data/identity.js` — `{ name, title, tagline }`, all known facts (no placeholders).
- `next-themes` ThemeProvider in `src/app/layout.js`; Geist Sans/Mono via `src/lib/fonts.js`.

### Established Patterns
- Components consume tokens only — NO hardcoded hex (UI-SPEC contract; reviewer enforced).
- `'use client'` for motion components; animate transform/opacity only.
- JavaScript only — `.js`/`.jsx`, `@/*` alias to `src/*`.

### Integration Points
- `src/app/page.js` is the home route to restructure (boot overlay + hero section).
- The boot overlay likely mounts in the layout or as a client component wrapping the page; it must not block SSR/first paint of the underlying hero (so skip + reduced-motion reveal it cleanly).
</code_context>

<specifics>
## Specific Ideas

- Aesthetic: premium, Apple-Vision-Pro-like, dichromatic, **subtle** — the boot and hero are the "this is one of the most unique portfolios I've seen" moment, so polish here matters more than anywhere else.
- The boot should feel like a single zen gesture uncovering the OS, not a loading screen.
- Hero wordmark "SOURABH JHA" is the one place the 700 weight is allowed (UI-SPEC exception).
- Boot ink stays within the two-hue palette (near-black void + ice-blue accent) — no extra colors.
</specifics>

<deferred>
## Deferred Ideas

- Floating glass dock / nav and dashboard stat cards — Phase 3.
- Command palette / ⌘K hint — Phase 6 (so the hero entry cue is a scroll indicator, not a palette hint, for now).
- Advanced motion layer (parallax, mouse-follow glow, glass reflections — MOT-02) — Phase 6.
- Formal reduced-motion enforcement sweep + verified 90+ Lighthouse — Phase 7 (Phase 2 builds GPU-friendly + reduced-motion-aware, but the audit is later).
- Stroke→particle-dissolve and wordmark-painting boot variants — considered and rejected for v1; noted in case a future polish pass wants a richer boot.

None of the above is scope creep into Phase 2 — each is correctly owned elsewhere.
</deferred>

---

*Phase: 2-boot-hero-landing*
*Context gathered: 2026-06-16*
