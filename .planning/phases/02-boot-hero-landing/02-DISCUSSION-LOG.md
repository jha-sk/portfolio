# Phase 2: Boot & Hero Landing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-16
**Phase:** 2-boot-hero-landing
**Areas discussed:** Boot animation form, Boot skip/replay, Hero background technique, Hero composition

---

## Boot Animation Form (BOOT-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Stroke wipe-reveal | Single calligraphic stroke sweeps across the void and wipes away (SVG mask) to reveal the hero. Cleanest, cheapest. | ✓ |
| Wordmark painting | Brush paints an SJ monogram / "Career OS" stroke-by-stroke, holds, dissolves into hero. More branded, heavier. | |
| Stroke + particle dissolve | Stroke draws then shatters into particles that settle into the hero's field. Most cinematic, most complex. | |

**User's choice:** Stroke wipe-reveal
**Notes:** One zen gesture uncovering the OS. Ink stays within the two-hue palette; accent may tint it subtly (Claude's discretion).

---

## Boot Skip & Replay (BOOT-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Once per session + skip | sessionStorage; plays once per tab session, auto-advances, click/key/scroll skips; no replay on route changes; reduced-motion → instant reveal. | ✓ |
| Once ever (persistent) | localStorage; plays only first visit ever. Owner stops seeing their own showcase. | |
| Every load + skip | Plays every full load, no persistence. Repetitive on revisit. | |

**User's choice:** Once per session + skip
**Notes:** Best fit for BOOT-02 "does not replay disruptively on subsequent navigations."

---

## Hero Background Technique (HERO-02)

| Option | Description | Selected |
|--------|-------------|----------|
| CSS/SVG + Framer only | Animated aurora (existing token) + blurred floating-light divs + light CSS/SVG particle layer. Zero deps, GPU-friendly, safest for 90+ Lighthouse. | ✓ |
| Canvas particle engine | tsParticles / OGL — denser particles but +1 dep, perf risk, more cleanup. | |
| Hybrid (CSS aurora + small canvas) | CSS aurora + hand-rolled canvas particle layer. Middle ground, more code to own. | |

**User's choice:** CSS/SVG + Framer only
**Notes:** transform/opacity only; subtle; degrades to static under reduced-motion. Particle count is Claude's discretion.

---

## Hero Composition & Entry (HERO-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Centered + scroll cue | Centered wordmark (Display 700) / title / tagline + animated scroll-down cue. Tagline as-is from identity.js. | ✓ |
| Centered + ⌘K hint | Same stack but a command-palette hint instead of scroll cue. Forward-references Phase 6. | |
| Left-aligned editorial | Left-aligned name/title/tagline, bg fills the space. More distinctive, less conventional. | |

**User's choice:** Centered + scroll cue
**Notes:** ⌘K hint deferred (palette is Phase 6). No dock yet (Phase 3). Hero reads content from identity.js, not hardcoded.

---

## Final Gate

Presented "I'm ready for context" vs "Explore more gray areas". User selected **I'm ready for context** — all four areas resolved.

## Claude's Discretion

- Boot stroke duration (~2–2.5s target), easing, ink treatment within palette.
- Particle/floating-light density, aurora timing.
- Hero entrance choreography + scroll-cue styling.
- Component layout (boot/ hero/), boot overlay mounting strategy.
- Keep/relocate the Phase-1 placeholder section below the hero.

## Deferred Ideas

- Dock/nav + dashboard cards → Phase 3.
- ⌘K hint / command palette → Phase 6.
- Advanced motion (parallax, mouse-follow, glass reflections — MOT-02) → Phase 6.
- Reduced-motion enforcement sweep + 90+ Lighthouse audit → Phase 7.
- Wordmark-painting and stroke→particle-dissolve boot variants → considered, rejected for v1.
