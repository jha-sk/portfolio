---
phase: 01-foundation-design-system
plan: 02
subsystem: foundation
tags: [data-architecture, placeholders, motion, stagger, responsive, content]
dependency_graph:
  requires:
    - "01-01: Next.js scaffold, tokens, ThemeProvider, Reveal wrapper, src/data/identity.js + TODO_ convention"
  provides:
    - "Six per-domain content data files (identity, links, stats, projects, skills, experience)"
    - "Greppable placeholder convention as a shared helper: TODO(label) factory + isPlaceholder() predicate (single TODO_ token)"
    - "src/data/README.md documenting the convention + stable field shapes for every later phase"
    - "RevealGroup/RevealItem — reduced-motion-safe staggered group reveal (0.06s) reusing the single-reveal timing"
    - "Responsive-proven placeholder home: 1200px container, 16/24/32 gutters, 1 -> md:2 -> lg:3 stat grid"
    - "tests/data.test.mjs (node:test) data-shape test; test:data npm script"
  affects:
    - "Phases 2-6 import @/data/* and reuse RevealGroup; v2 (CNT2-01) fills placeholders by grepping one token"
tech_stack:
  added: []
  patterns:
    - "Placeholder marker = frozen { __placeholder: true, TODO: 'TODO_<label>' } produced only via TODO(); detected via isPlaceholder()"
    - "Per-domain data files default- and named-export the same value; factory helpers (node/capsule/entry) keep seed files terse"
    - "Relative data imports use explicit .js extension so files run under both Next/webpack and raw Node ESM (node --test)"
    - "Grouped reveals use Framer Motion variants with staggerChildren 0.06s, gated on useReducedMotion via static variant swap"
    - "Empty-state copy path renders for any isPlaceholder() value so raw TODO_ tokens never reach a visitor"
key_files:
  created:
    - src/data/placeholders.js
    - src/data/README.md
    - src/data/links.js
    - src/data/stats.js
    - src/data/skills.js
    - src/data/projects.js
    - src/data/experience.js
    - tests/data.test.mjs
  modified:
    - src/data/identity.js
    - src/components/motion/reveal.jsx
    - src/app/page.js
    - package.json
decisions:
  - "Formalized the 01-01 TODO_ token as a shared placeholders.js helper: TODO(label) returns a frozen { __placeholder, TODO } marker; isPlaceholder() checks the flag — one factory, one greppable token"
  - "Used factory helpers (node/capsule/entry) inside seed files so 98 placeholders flow through ~27 TODO() calls without hand-rolling any bare TODO_ literal"
  - "Explicit .js extensions on relative data imports so the same files pass under node --test and the Next build"
  - "RevealGroup/RevealItem use Framer Motion variants (staggerChildren) rather than per-child delays, so the single-reveal timing is reused verbatim and never drifts"
metrics:
  duration_min: 5
  completed: "2026-06-15"
  tasks_completed: 2
  tasks_total: 3
  files_created: 8
  files_modified: 4
status: paused-at-checkpoint
---

# Phase 01 Plan 02: Content Data Architecture + Motion/Responsive Baseline Summary

One-liner: The Career OS content layer now reads from six editable in-repo per-domain data files seeded with known facts and a single greppable `TODO()` placeholder convention, the shared motion wrapper gained reduced-motion-safe staggered group reveals, and the placeholder home proves a clean 1 -> 2 -> 3 column responsive reflow — production build green, data-shape test 9/9. Paused at the Task 3 human-verify checkpoint.

## What Was Built

**Task 1 — Data architecture + placeholder convention (TDD):**
- `src/data/placeholders.js` — the single greppable convention formalized as a helper: `TODO(label)` returns a frozen marker `{ __placeholder: true, TODO: 'TODO_<label>' }`; `isPlaceholder(value)` detects it; `TODO_TOKEN` exports the one search token. This builds on (and supersedes the prose-only version of) the `TODO_` convention started in 01-01's `identity.js`.
- Six per-domain files (D-01): `identity.js` (extended header to point at the shared helper), `links.js` (known GitHub/LinkedIn/email facts + placeholder resume path), `stats.js` (five labelled metrics, placeholder values), `skills.js` (11 seed technology nodes with placeholder level/experience/relatedProjects/relatedTech), `projects.js` (4 seed project names + placeholder detail fields), `experience.js` (two mission-log entries, all visible fields placeholder).
- `src/data/README.md` documents the convention and the stable field shapes for every file (so later phases bind without churn and v2 fills by grepping one token).
- `tests/data.test.mjs` (node:test) + `test:data` npm script — 9 tests asserting imports, all known seed facts present and unmarked, `isPlaceholder()` correctness, and that every live placeholder carries the token while no data file hand-rolls a bare `TODO_` value literal.

**Task 2 — Stagger + responsive baseline:**
- `src/components/motion/reveal.jsx` — added `RevealGroup` and `RevealItem` using Framer Motion variants with `staggerChildren: 0.06`, reusing the exact single-reveal timing (fade + 16px y, 0.5s, ease `[0.22,1,0.36,1]`). Both new exports are gated on `useReducedMotion()` (static variant swap → no translate, instant opacity). The original single `Reveal` contract is unchanged.
- `src/app/page.js` — the placeholder home now renders the five `stats` in a `RevealGroup` grid that reflows `grid-cols-1 -> md:grid-cols-2 -> lg:grid-cols-3` with `gap-4/md:6/lg:8`, inside the existing 1200px `max-w-content` container and 16/24/32 gutters. Placeholder stat values render the exact UI-SPEC empty-state copy ("Nothing here yet" / "This section is awaiting data. Content loads from the in-repo data files.").

## How It Works

Every unknown value in the data files is produced by `TODO()`, which stamps the single `TODO_` token at runtime; known facts are written as plain values and never wrapped. `isPlaceholder()` is the runtime predicate, and `grep -rn "TODO_" src/data` is the human path — the empty-state UI branch renders whenever `isPlaceholder(stat.value)` is true, so the raw token never reaches a visitor (threat T-02-02). The grouped reveal drives child animation through Framer Motion's parent→child variant propagation, so the parent's `whileInView` orchestrates the 0.06s stagger; under reduced motion the parent/child variants are swapped for static ones, inheriting the same gate every consumer already gets from the single `Reveal`.

## Verification Evidence

- `node --test tests/data.test.mjs` — 9/9 pass (imports, seed facts present + unmarked, isPlaceholder correctness, single-token grep invariant).
- Seed-fact grep: `github.com/jha-sk`, `linkedin.com/in/sk-jha`, `codewithsourabhjha@gmail.com`, `Kubernetes`, `Git Automation CLI` all present → `data-ok`.
- `rm -rf .next && npm run build` exits zero — 4 static pages, no truncated next-swc issue on this Node 26 box.
- Static motion/responsive check: `useReducedMotion` retained, `staggerChildren`/`0.06` present, `md:`+`lg:` prefixes and the 1200px container present → `motion+responsive-ok`.
- `npm run lint` → No ESLint warnings or errors.
- `node --test tests/smoke.test.mjs` still passes (page still renders "System initialized" + title + identity name).
- `grep -rl "TODO_" src/data` matches only README.md / identity.js / placeholders.js (documentation + factory) — confirming no bare `TODO_` value literal leaked into the per-domain files.

## TDD Gate Compliance

- RED: `test(01-02)` commit `ec1b59b` — data-shape test failed (data files did not exist).
- GREEN: `feat(01-02)` commit `1b9d1fa` — data files implemented, 9/9 pass.
- No REFACTOR commit needed (implementation was minimal and clean).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Explicit `.js` extension on relative data imports**
- **Found during:** Task 1 (GREEN)
- **Issue:** The per-domain files imported `./placeholders` extensionless. Next/webpack resolves that, but the data-shape test runs under raw Node ESM (`node --test`), which requires explicit extensions — imports threw `ERR_MODULE_NOT_FOUND`, blocking the test.
- **Fix:** Added `.js` to every `./placeholders` import (and to the `@/data/placeholders.js` import in `page.js`). Webpack resolves the explicit extension equally, so the production build is unaffected.
- **Files modified:** links.js, stats.js, skills.js, projects.js, experience.js, page.js
- **Commit:** `1b9d1fa` (data files), `8cf854b` (page.js)

**2. [Rule 1 - Code quality] Named the placeholders default export**
- **Found during:** Task 2 build
- **Issue:** `export default { ... }` in placeholders.js triggered the `import/no-anonymous-default-export` lint warning.
- **Fix:** Assigned to a `placeholders` const before the default export. Lint now clean.
- **Files modified:** placeholders.js
- **Commit:** `8cf854b`

### Verification-regex note (not a code deviation)

The plan's Task 2 verify regex checked for `max-w-[1200px]|max-w-6xl`. The project's established 1200px container utility (from 01-01's tailwind.config) is `max-w-content`. The acceptance criterion (1200px max container) is met via `max-w-content`; the verification regex was extended locally to include it. No code change to satisfy a literal regex string.

### Test-assertion correction

My first draft of the single-token test asserted `grepHits === liveCount` (literal `TODO(` calls equal to live placeholders). Because seed files use factory helpers (`node`/`capsule`/`entry`), 27 `TODO()` calls expand to 98 live placeholders — that strict equality was wrong. Corrected the test to assert the real invariant: every live placeholder carries the token, the factory is used, and no data file hand-rolls a bare `TODO_` value literal (comments stripped before the literal check). Final test 9/9.

## Authentication Gates

None — static frontend, no auth surface this plan.

## Known Stubs

The stat values, project detail fields, skill metadata, experience entries, and the resume path are intentional, documented placeholders (D-02/D-03) produced via `TODO()` — they are the deliberate Phase-1 deliverable, not unintended stubs. The empty-state copy path renders for them so nothing raw surfaces. v2 (CNT2-01) fills them by grepping the single `TODO_` token. No unintended stubs.

## Threat Surface Scan

No new network endpoints, auth paths, file access, or trust-boundary schema changes. Data files contain only public, intentional portfolio content (public profile handles, an already-published contact email). Threats T-02-01 / T-02-02 from the plan are mitigated as designed. No threat flags.

## Checkpoint Status

**PAUSED at Task 3 (checkpoint:human-verify, gate=blocking).** Tasks 1-2 (autonomous) are complete and committed; Task 3 requires the user to verify the staggered reveal + responsive reflow + both themes + empty-state copy in a browser. Not self-approved (auto_advance is false). See the checkpoint message returned to the orchestrator for verification steps.

## Self-Check: PASSED

All 8 created files and 4 modified files verified on disk; task commits `ec1b59b` (RED), `1b9d1fa` (GREEN data), `8cf854b` (stagger+responsive) verified in git history.
