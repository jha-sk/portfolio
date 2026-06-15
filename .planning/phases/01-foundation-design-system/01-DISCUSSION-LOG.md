# Phase 1: Foundation & Design System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-16
**Phase:** 1-foundation-design-system
**Areas discussed:** Content data architecture, Theme switching mechanism, Project structure & conventions, ShadCN setup

---

## Area Selection

Presented four phase-specific gray areas (the visual contract was already locked by 01-UI-SPEC.md, so only structural/implementation decisions remained). User selected **all four** for discussion.

---

## Content Data Architecture (FND-07)

| Option | Description | Selected |
|--------|-------------|----------|
| Split per-domain files | `/data/identity.js, stats.js, projects.js, skills.js, experience.js, links.js`; each phase imports only what it needs; smaller diffs; consistent TODO tagging | ✓ |
| Single config object | One `/data/site.config.js` mega-object; everything in one place but grows large and every phase touches it | |

**User's choice:** Split per-domain files
**Notes:** Drives FND-07 and makes the v2 placeholder-fill (CNT2-01) easy. Exact placeholder marker syntax left to planner discretion.

---

## Theme Switching Mechanism (FND-03)

| Option | Description | Selected |
|--------|-------------|----------|
| next-themes library | Standard for Next.js App Router; pre-paint no-FOUC script, localStorage persistence, system-pref detection, `useTheme()` hook; one small dep | ✓ |
| Hand-rolled | Inline `<script>` + localStorage + manual class toggle; zero deps but more maintenance and no-FOUC edge cases | |

**User's choice:** next-themes library
**Notes:** Config locked: `attribute="class"`, `defaultTheme="dark"`, `enableSystem`. Toggle is a Lucide Sun/Moon button with `aria-label="Toggle theme"`.

---

## Project Structure & Conventions

| Option | Description | Selected |
|--------|-------------|----------|
| src/ dir + @/* alias | Everything under `src/` (app, components{ui,layout,motion}, data, lib); `@/* → ./src/*` in jsconfig.json; keeps code separate from root config | ✓ |
| Root-level (no src/) | `app/`, `components/` etc. at repo root (Next.js minimal default); mixes code with config files | |

**User's choice:** src/ dir + @/* alias
**Notes:** Greenfield — this sets the convention for the whole project. JavaScript only (jsconfig, no tsconfig).

---

## ShadCN Setup

| Option | Description | Selected |
|--------|-------------|----------|
| New York, minimal install | New York style (tighter/premium, fits Vision-Pro aesthetic); install only button + theme setup now; later components per-phase; shadcn CSS vars overridden by UI-SPEC tokens | ✓ |
| Default, minimal install | Default style (more relaxed spacing/rounding); same minimal install scope | |

**User's choice:** New York, minimal install
**Notes:** `baseColor: neutral`, `cssVariables: true`, class dark mode. Components consume tokens — no hard-coded hex.

---

## Final Gate

Presented "I'm ready for context" vs "Explore more gray areas". User selected **I'm ready for context** — all four areas resolved, no further gray areas to explore.

## Claude's Discretion

- Exact placeholder marker syntax (greppable convention).
- Precise data-object shapes/field names per `src/data/*.js` file.
- Internal file/component naming, `cn` util, ESLint/Prettier config, `next/font` wiring.
- What the Phase-1 placeholder section renders (must prove tokens + theme + motion).
- `create-next-app` flags / project-creation specifics (must heed env gotchas).

## Deferred Ideas

- CNT2-01 (v2): fill TODO placeholder data with real values.
- TXC2-01 (v2): real contact-message delivery.
- Boot/hero/named sections → Phases 2–6.
- Full reduced-motion enforcement + verified 90+ Lighthouse → Phase 7.
