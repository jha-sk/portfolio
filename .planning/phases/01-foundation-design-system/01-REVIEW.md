---
phase: 01-foundation-design-system
reviewed: 2026-06-15T21:43:55Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - src/app/globals.css
  - src/app/layout.js
  - src/app/page.js
  - src/components/layout/theme-toggle.jsx
  - src/components/motion/reveal.jsx
  - src/components/theme-provider.jsx
  - src/components/ui/button.jsx
  - src/data/README.md
  - src/data/experience.js
  - src/data/identity.js
  - src/data/links.js
  - src/data/placeholders.js
  - src/data/projects.js
  - src/data/skills.js
  - src/data/stats.js
  - src/lib/fonts.js
  - src/lib/utils.js
  - tests/data.test.mjs
  - tests/smoke.test.mjs
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-06-15T21:43:55Z
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

Reviewed the Phase 1 foundation: design tokens (`globals.css` + `tailwind.config.js`), theme switching (`next-themes` provider + toggle), the per-domain data architecture with the `TODO()`/`isPlaceholder()` placeholder convention, the Framer Motion `Reveal`/`RevealGroup`/`RevealItem` wrapper, a trimmed shadcn button, and two Node test suites.

Overall the slice is coherent and the token discipline is real (components consume utilities, not hex; all utilities used in `page.js`/`button.jsx`/`layout.js` resolve to declared `tailwind.config.js` keys and CSS variables — cross-referenced, no dangling utility classes found). The placeholder convention is sound and the empty-state path in `page.js` correctly prevents raw `TODO_` tokens from reaching visitors.

No Critical (BLOCKER) issues. The findings below are correctness/robustness concerns: a flaky build-timeout in the smoke test, a `theme-provider`/Tailwind `darkMode` class-name mismatch that will silently break `dark:` variants in later phases, a `RevealGroup`/`RevealItem` contract that fails-invisible when misused, and an ineffective fallback in the dynamic `motion[Tag]` lookup. Placeholder/TODO values are intentional (FND-07) and are NOT flagged. TypeScript absence is per the locked JS constraint and is NOT flagged.

## Warnings

### WR-01: Smoke test build timeout will produce flaky failures

**File:** `tests/smoke.test.mjs:67-75`
**Issue:** The test invokes a full `next build` with `timeout: 55_000` (55s). A cold Next 15 production build (no `.next` cache, font fetching via `next/font/google`, first-run SWC compile) routinely exceeds 55s on CI and on a fresh dev machine. When it does, `execFileSync` throws `ETIMEDOUT` and the test fails even though the build is correct — a false negative that erodes trust in the suite. The node `--test` default per-test timeout is also a separate ceiling, but the explicit 55s here is the tighter, more likely tripwire.
**Fix:** Raise the build timeout to a realistic cold-build ceiling and (optionally) warm the cache first:
```js
execFileSync('npm', ['run', 'build'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
  timeout: 300_000, // 5 min — cold Next 15 build + font fetch
});
```
Consider also bumping the node test runner timeout (`test('...', { timeout: 360_000 }, () => { ... })`) so the harness ceiling stays above the build ceiling.

### WR-02: `attribute="class"` theme provider conflicts with Tailwind `darkMode: 'class'` token wiring

**File:** `src/components/theme-provider.jsx:15-19` (with `src/app/globals.css:19,68` and `tailwind.config.js:3`)
**Issue:** `next-themes` is configured with `attribute="class"` and `defaultTheme="dark"`, so it writes `class="dark"` (or `class="light"`) onto `<html>`. The token CSS, however, defines the **dark** palette on `:root` (line 19) and only the **light** palette on `.light` (line 68) — there is no `.dark` rule. Phase 1 happens to work only because `:root` dark tokens are always applied and `.light` overrides them. But `tailwind.config.js` sets `darkMode: 'class'`, which makes every Tailwind `dark:` variant key off the `.dark` class. The moment a later phase writes `dark:bg-surface` (or any `dark:` utility), it will activate based on the presence of `.dark` — which next-themes does add for the dark theme — yet the *base* (non-`dark:`) tokens are already the dark palette via `:root`. The result is two competing sources of truth for "dark", and `dark:`/`light:` variants will behave inconsistently with the `:root` vs `.light` token model. This is latent now and will surface as confusing styling bugs in Phases 2–6.
**Fix:** Pick one model and make the four pieces agree. Recommended: keep `attribute="class"`, but mirror the dark tokens onto `.dark` (in addition to or instead of `:root`) so both next-themes and Tailwind `dark:` variants resolve the same class:
```css
:root, .dark { /* dark palette */ }
.light { /* light palette */ }
```
Alternatively set `defaultTheme="dark"` with `value={{ light: 'light', dark: 'dark' }}` and document that `dark:` variants are intentionally unused, but the CSS/`darkMode` mismatch should be resolved explicitly rather than left to coincidence.

### WR-03: `RevealItem` / `RevealGroup` fail-invisible when used outside the documented pairing

**File:** `src/components/motion/reveal.jsx:102-114` (and `85-100`)
**Issue:** `RevealItem` sets `variants` with a `hidden` state of `{ opacity: 0, y: 16 }` but defines **no** `initial`, `animate`, or `whileInView` of its own — it depends entirely on a parent `RevealGroup` propagating the `"hidden"`→`"visible"` variant labels. If a developer renders a `RevealItem` without a `RevealGroup` parent (an easy mistake given both are exported from the same module and named symmetrically), Framer Motion has no active variant label to apply, and the element can render stuck at the `hidden` opacity 0 — i.e. invisible content with no error. The single `Reveal` is safe (it self-contains `initial`/`whileInView`); only the grouped pair has this footgun. Given these wrappers are explicitly designed for reuse across all later sections (MOT-01/D-13), the misuse risk is real.
**Fix:** Make `RevealItem` degrade safely when orphaned, e.g. default its own animation drivers so it is visible without a parent, or guard at runtime:
```js
export function RevealItem({ children, className, as: Tag = 'div', standalone = false }) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[Tag] ?? motion.div;
  const variants = prefersReducedMotion ? staticItemVariants : itemVariants;
  return (
    <MotionTag
      className={className}
      variants={variants}
      {...(standalone
        ? { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.2 } }
        : {})}
    >
      {children}
    </MotionTag>
  );
}
```
At minimum, document the hard requirement in the component JSDoc that `RevealItem` MUST be a child of `RevealGroup`.

### WR-04: Reduced-motion `Reveal` keeps content hidden until scrolled into view

**File:** `src/components/motion/reveal.jsx:21-33`
**Issue:** Under `prefers-reduced-motion`, the wrapper still uses `initial={{ opacity: 0 }}` + `whileInView={{ opacity: 1 }}`. So reduced-motion users get content that is opacity 0 until it scrolls into the viewport, then snaps in (duration 0.01). Two problems: (1) it is not truly "static" rendering as the contract describes — content is hidden on first paint and depends on the in-view observer firing; (2) if Framer Motion / the IntersectionObserver fails to run (JS error upstream, or content already in view but observer misfires), reduced-motion users — the audience most likely to be on assistive/older setups — can be left with permanently invisible content. The reduced-motion branch should err toward always-visible.
**Fix:** For the reduced-motion branch, render visible immediately rather than gating on in-view:
```js
if (prefersReducedMotion) {
  return <motion.div className={className} initial={false} animate={{ opacity: 1 }}>{children}</motion.div>;
}
```
or simply render a plain `<div className={className}>{children}</div>` in that branch.

## Info

### IN-01: `motion[Tag] ?? motion.div` fallback never triggers

**File:** `src/components/motion/reveal.jsx:87,104`
**Issue:** `const MotionTag = motion[Tag] ?? motion.div;` — in Framer Motion v11 `motion` is a Proxy that returns a valid motion component for *any* string key, so `motion[Tag]` is never `null`/`undefined`. The `?? motion.div` fallback is therefore dead code; an invalid/typo `as` value (e.g. `as="dvi"`) silently yields `<dvi>` rather than falling back to a `div`. Harmless today (only `'div'` defaults are used) but misleading.
**Fix:** Validate against an allowlist of intended tags, or drop the misleading `?? motion.div` and document that `as` must be a valid HTML tag.

### IN-02: ThemeToggle pre-mount icon can flash for system-light users

**File:** `src/components/layout/theme-toggle.jsx:34-38`
**Issue:** Before mount, `mounted` is false so `<Sun>` renders. After mount, if `enableSystem` resolves to light, `resolvedTheme === 'light'` → `mounted && !isDark` → `<Moon>`. So a visitor whose OS prefers light sees Sun→Moon swap on hydration. This is largely inherent (the server cannot know the client's system preference), and the `suppressHydrationWarning` on `<html>` plus next-themes' pre-paint script mitigate the *page* flash — but the toggle glyph itself can still flip. Cosmetic only.
**Fix:** Acceptable as-is for Phase 1. If the flip is undesirable, render a neutral/placeholder icon (or `null` with reserved 44x44 box) until `mounted`, then resolve the real glyph.

### IN-03: Global `*` border-color rule omits pseudo-elements and is broad

**File:** `src/app/globals.css:111-113`
**Issue:** `* { border-color: var(--border); }` tints every element's border with the accent-hairline token. This is the shadcn-derived pattern, but applying to `*` alone (not `*, ::before, ::after`) means generated pseudo-element borders won't inherit the token, and the blanket rule can override component-local border intentions in later phases. Low risk in Phase 1 (no pseudo-element borders yet).
**Fix:** Optionally scope to `*, ::before, ::after { border-color: var(--border); }` to match the conventional shadcn reset, or restrict the default to a `border-border` utility applied where borders are actually used.

### IN-04: `theme-provider` prop spread allows callers to override safety defaults

**File:** `src/components/theme-provider.jsx:13-22`
**Issue:** `{...props}` is spread *after* `attribute`/`defaultTheme`/`enableSystem`, so any caller can silently override the foundation theme config (e.g. flip `defaultTheme` or disable `enableSystem`) without it being obvious. Intentional flexibility, but it weakens the "single foundation config" guarantee the file's docblock claims.
**Fix:** If the config is meant to be locked, place `{...props}` *before* the fixed props (so fixed values win), or omit the spread entirely. If overridability is intended, note it in the docblock.

---

_Reviewed: 2026-06-15T21:43:55Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
