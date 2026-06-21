# Responsive + Multi-Tier Performance for Career OS — Design

**Date:** 2026-06-21
**Status:** Approved (pending spec review)
**Scope:** Make the Career OS portfolio fully responsive across all devices and performant on lower-spec hardware, including the heavy WebGL hero and Framer Motion animations.

---

## 1. Problem

The hero is the entire page (`src/app/page.js` → `SystemHero`). It mounts a heavy React Three Fiber scene (`system-scene.jsx`):

- `MeshReflectorMaterial` reflective floor @ `resolution={1024}`
- Full `EffectComposer`: `DepthOfField` + `Bloom` + `Vignette` + `Noise`
- A near-complete edge graph with traveling packets
- ~30 ambient racks + 4 cooling towers, orbit controls, camera rigs

Today the **only** off-ramps from the full scene (`CanvasOrFallback` in `system-hero.jsx`) are:

1. `prefers-reduced-motion: reduce`, or
2. `max-width: 820px`

Both route to the **static** `SystemFallback`. Consequences:

- **No capability awareness.** A weak-GPU laptop or software-renderer (SwiftShader/llvmpipe) machine at >820px gets the full scene and janks.
- **Binary breakpoint.** Tablets (768–1024) get the full scene.
- **Static hero has no navigation.** `SystemFallback` renders content sections inline but offers phone users no way to jump between them except scrolling.

### Latent responsive bug (found during design)

`tailwind.config.js` overrides `theme.screens` to `{ md: 768, lg: 1024, xl: 1280 }`, which **removes** Tailwind's default `sm` (640px). But `skills.jsx` uses `sm:grid-cols-2` — a class Tailwind never generates under this config — so Skills is stuck single-column at every width. Any other `sm:` usage is silently dead too. This is fixed as part of the responsive pass.

---

## 2. Approach (approved)

Three capability tiers with a single decision point, plus a manual override:

- **`low`** → upgraded static hero (no WebGL)
- **`mid`** → `<SystemScene quality="mid" />` (stripped-down live 3D)
- **`high`** → `<SystemScene quality="high" />` (current full scene)

Detection is automatic with a user-facing **Low / Auto / High** override (the recovery path if detection guesses wrong). Live FPS-adaptive downgrading is **out of scope** — the manual `Low` override covers misdetection; FPS monitoring can be added later as a safety net.

The scene stays in **one parameterized file** (`quality` prop), not a forked lite file, to keep the scene graph DRY.

---

## 3. Components

### 3.1 New: `useDeviceTier()` — `src/lib/use-device-tier.js`

Client hook returning `{ tier, quality, setQuality }` where `tier ∈ {low, mid, high}` is the *resolved* tier and `quality ∈ {low, auto, high}` is the persisted user preference.

**Signals collected:**

- viewport width (`matchMedia`)
- `navigator.deviceMemory`
- `navigator.hardwareConcurrency`
- `(pointer: coarse)` (touch)
- `navigator.connection?.saveData`
- `prefers-reduced-motion: reduce`
- one-time **WebGL probe**: attempt a context; read `WEBGL_debug_renderer_info` → `UNMASKED_RENDERER_WEBGL`. No context or a software renderer (SwiftShader / llvmpipe / "Software") forces `low`.

**Pure resolution function** `resolveTier(signals)` (exported, unit-testable, no DOM access):

- `low` if: phone-width (≤ 768) OR no WebGL OR software renderer OR `prefers-reduced-motion` OR `saveData` OR `deviceMemory ≤ 2`
- `high` if: width ≥ 1024 AND `deviceMemory` not low AND `hardwareConcurrency > 4` AND not coarse-pointer-only
- `mid` otherwise (tablets, weak laptops, mid memory/cores)

**Override semantics:** `quality==='high'` clamps resolved tier to `high`; `quality==='low'` clamps to `low`; `quality==='auto'` uses `resolveTier`. Persisted in `localStorage` under a stable key. SSR-safe: first render returns a deterministic default (`low`) until mounted to avoid hydration mismatch, then upgrades client-side.

### 3.2 Scene parameterization — `system-scene.jsx`

Add a `quality` prop (`'mid' | 'high'`, default `'high'`) backed by a single config object:

```js
const QUALITY = {
  high: { dpr: [1, 2], antialias: true, reflectiveFloor: true,
          postFx: 'full',  ambient: 'full', packets: 'full', autoRotate: 0.5 },
  mid:  { dpr: [1, 1.5], antialias: false, reflectiveFloor: false,
          postFx: 'lite',  ambient: 'reduced', packets: 'core', autoRotate: 0.3 },
};
```

Behavioral mapping:

| Feature | high | mid |
|---|---|---|
| `dpr` | `[1,2]` | `[1,1.5]` |
| antialias | on | off |
| Floor | `MeshReflectorMaterial` @1024 | plain dark plane + `GridFloor` |
| Post-FX | DoF + Bloom + Vignette + Noise | Bloom (lighter) + Vignette |
| Ambient racks / towers | full (~30) | reduced (~10, no towers) |
| Packets | full graph | core links only |
| autoRotate speed | 0.5 | 0.3 |

`DepthOfField` + `DofDriver` only mount in `full` post-FX. `ReflectiveFloor` only in high; mid uses the existing `GridFloor` over a cheap dark plane.

### 3.3 Upgraded static hero — `system-fallback.jsx`

- **Cheap motion** (CSS keyframes / SVG, all gated by `prefers-reduced-motion`): pulsing nodes, packet dots animating along the SVG edges, soft core glow. No Three.js.
- **Sticky section-nav**: a horizontally-scrollable pill bar (About / Skills / Projects / Experience / Certs / Contact) anchoring to the inline sections already rendered below the hero.
- Identity, telemetry, and content made fully fluid.

### 3.4 Manual quality control

- **Command palette** (`command-palette.jsx`): add a "Quality: Low / Auto / High" command group that calls `setQuality`.
- **HUD chip** (`system-hero.jsx`): a small Low/Auto/High control in the top HUD cluster, consistent with existing glass-pill styling.

---

## 4. Responsive pass — every surface

Standardize breakpoints by restoring `sm` (640) and adding `xs` (480) to `theme.screens`, keeping `md/lg/xl`. Audit & fix:

- Top HUD cluster, nav dock (wrap/scroll on narrow), `LiveTelemetry`
- `SectionPanel` drawer — comfortable full-bleed padding at small widths; verify genie origin on touch
- All 6 content sections (About, Skills, Experience, Projects, Certs/Education, Contact): single-column grids on mobile, fluid type, no horizontal overflow; **fix the dead `sm:` classes**
- Command palette + terminal: width clamps on small screens
- `CustomCursor`: already guards `(pointer: fine)` — verified, runs only on fine-pointer devices; no touch change needed

---

## 5. Data flow

```
useDeviceTier() ──tier──> CanvasOrFallback ──┬─ low  → SystemFallback (static, animated, nav)
        ▲                                     ├─ mid  → SystemScene quality="mid"
        │ setQuality                          └─ high → SystemScene quality="high"
   ┌────┴───────────────┐
   │ palette command    │
   │ HUD quality chip    │
   └────────────────────┘   (quality persisted in localStorage)
```

`useDeviceTier` is owned by `SystemHero` (top of the hero tree) and threaded down to `CanvasOrFallback`, the palette, and the HUD chip.

---

## 6. Error handling / edge cases

- **SSR/hydration:** hook returns deterministic `low` until mounted, then resolves — prevents mismatch and guarantees crawlers/no-JS get full content.
- **WebGL probe failure:** any exception → treat as no WebGL → `low`.
- **`deviceMemory`/`connection` absent** (Safari/Firefox): treat as neutral, fall back to width + cores + pointer.
- **Override conflicts with reduced-motion:** `prefers-reduced-motion` still forces static even under a `high` override (accessibility wins); document this in the chip tooltip.
- **Resize across tier boundary:** width is reactive; tier recomputes on `matchMedia` change. Avoid thrash by only switching tiers on a debounced/threshold change.

---

## 7. Testing

- **Unit:** extend `tests/smoke.test.mjs` (or new `tests/tier.test.mjs`) to exercise `resolveTier(signals)` against mock signal objects — assert each tier and each override clamp. Pure function, no DOM.
- **Manual matrix:** Chrome DevTools device emulation (small phone / tablet / desktop) × override (Low/Auto/High), plus a throttled-GPU (4× CPU + software GL) pass. Confirm: phone → static with working nav; tablet → mid scene; desktop → full scene; Low override → static everywhere; High override → full scene on tablet.
- **Lighthouse:** 90+ mobile target preserved on the `low` path.

---

## 8. Deliverables

1. `src/lib/use-device-tier.js` (hook + pure `resolveTier`)
2. `system-scene.jsx` parameterized by `quality`
3. `system-fallback.jsx` upgraded (cheap motion + section nav + fluid)
4. `system-hero.jsx` — tier routing + HUD quality chip
5. `command-palette.jsx` — quality commands
6. `tailwind.config.js` — restore `sm`/add `xs`; fix dead `sm:` classes across sections
7. Responsive fixes across the 6 sections, panel, dock, telemetry, terminal
8. Tier unit tests
