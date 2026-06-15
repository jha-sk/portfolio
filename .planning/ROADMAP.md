# Roadmap: Career OS — Sourabh Jha Portfolio

## Overview

This roadmap builds "Career OS" as a series of vertical MVP slices, each putting a visible, end-to-end piece of the experience on screen. Phase 1 lays the foundation everything depends on — Next.js scaffold, the dichromatic design-token system, theme toggle, responsive baseline, the in-repo data architecture, and a reusable Framer Motion baseline. Phase 2 delivers the first "wow": the zen brush-stroke boot reveal flowing into a premium animated hero. Phase 3 brings the OS to life with dashboard stat cards and the floating glass dock that replaces a traditional navbar. Phases 4 and 5 layer in the storytelling sections — About timeline and Skills constellation, then Project Capsules and Experience Mission Logs. Phase 6 adds the Transmission Center contact panel, the Linear-style Ctrl+K command palette, and the advanced interaction layer (parallax, mouse-follow glow, glass reflections). Phase 7 is a cross-cutting polish and performance pass that enforces `prefers-reduced-motion` everywhere and locks in a 90+ Lighthouse score before ship.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Design System** - Scaffold, dichromatic tokens, theme toggle, responsive + data architecture, motion baseline (completed 2026-06-15)
- [ ] **Phase 2: Boot & Hero Landing** - Zen brush-stroke boot reveal flowing into the premium animated hero
- [ ] **Phase 3: Dashboard & Dock Navigation** - Glass stat cards and the floating glass dock replacing the navbar
- [ ] **Phase 4: About & Skills** - Interactive expand-on-hover timeline and the floating technology constellation
- [ ] **Phase 5: Projects & Experience** - Immersive Project Capsules and Mission Log experience entries
- [ ] **Phase 6: Transmission Center & Command Palette** - Simulated contact panel, Ctrl+K palette, and the advanced motion layer
- [ ] **Phase 7: Polish & Performance** - Reduced-motion enforcement and a verified 90+ Lighthouse score

## Phase Details

### Phase 1: Foundation & Design System

**Goal**: A running Next.js App Router app in JavaScript with the dichromatic design system, theme switching, responsive baseline, in-repo content data files, and a reusable Framer Motion baseline — the foundation every later phase consumes.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-07, MOT-01
**Success Criteria** (what must be TRUE):

  1. The app builds and runs locally on Next.js (latest, App Router) in JavaScript with Tailwind, Framer Motion, Lucide React, and ShadCN UI installed and working
  2. A visitor can toggle between full dark and light themes; the choice persists across reloads and loads without a flash of the wrong theme
  3. The dichromatic palette (`#020202` background, `#B2D5E5` primary) plus glass/gradient/glow tokens are defined once and consumable through Tailwind utilities
  4. Site content (identity, stats, projects, experience, skills, links) reads from editable in-repo data files seeded with known facts and clearly tagged TODO placeholders
  5. A shared section-reveal motion wrapper exists and animates a placeholder section smoothly, and the layout reflows cleanly across mobile, tablet, and desktop**Plans**: 2 plans

**Wave 1**

- [x] 01-01-PLAN.md — Walking Skeleton: Next.js+shadcn scaffold, dichromatic token system, theme toggle, motion wrapper, data-driven "System initialized" placeholder page (FND-01/02/03, MOT-01)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Full per-domain data architecture + greppable placeholder convention, responsive baseline proof, staggered reduced-motion-safe reveals (FND-07/04, MOT-01)

**UI hint**: yes

### Phase 2: Boot & Hero Landing

**Goal**: The first stunning on-screen slice — a zen brush-stroke boot animation reveals the homepage and hands off to a premium hero with the name, title, tagline, and an animated particle/aurora/floating-light background.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: BOOT-01, BOOT-02, HERO-01, HERO-02
**Success Criteria** (what must be TRUE):

  1. On first load, a zen brush-stroke boot animation renders over the `#020202` background and reveals the homepage
  2. The boot sequence can be skipped and does not replay disruptively on subsequent in-session navigations
  3. The hero displays "SOURABH JHA", the title "AI Engineer | Backend Engineer", and the building-scalable-systems tagline
  4. The hero background renders animated particles, aurora gradients, and floating light effects with subtle, GPU-friendly motion

**Plans**: 2 plans
Plans:
**Wave 1**

- [ ] 02-01-PLAN.md — Hero slice: data-driven SOURABH JHA wordmark/title/tagline, animated aurora/blob/particle background, scroll cue (HERO-01, HERO-02)

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 02-02-PLAN.md — Boot slice: zen brush-stroke wipe-reveal overlay, skip-on-any-input, once-per-session sessionStorage gate, reduced-motion bypass (BOOT-01, BOOT-02)

**UI hint**: yes

### Phase 3: Dashboard & Dock Navigation

**Goal**: The control-center feeling arrives — glass dashboard stat cards present key metrics, and a floating glass dock replaces the navbar, staying visible and moving the visitor between sections.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: DASH-01, DASH-02, NAV-01, NAV-02
**Success Criteria** (what must be TRUE):

  1. The dashboard shows stat glass cards (Years of Experience, Projects Built, Technologies, Repositories, Open Source Contributions) with values pulled from the data file
  2. Stat cards have a glass effect, hover glow, and animated borders with smooth transitions
  3. A floating glass dock (Home, Projects, Skills, Experience, About, Contact) stays visible instead of a traditional navbar and animates smoothly
  4. Selecting a dock item moves the visitor to and highlights the corresponding active section

**Plans**: TBD
**UI hint**: yes

### Phase 4: About & Skills

**Goal**: The storytelling sections begin — an interactive expand-on-hover timeline replaces About paragraphs, and a floating technology constellation of interconnected nodes presents skills with rich hover detail.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: ABT-01, ABT-02, SKL-01, SKL-02, SKL-03
**Success Criteria** (what must be TRUE):

  1. The About section renders as an interactive timeline (2024 / 2025 / 2026 / Future) instead of paragraphs, and each item expands on hover to reveal detail
  2. Skills render as a floating constellation of interconnected nodes with connecting lines and subtle motion
  3. Hovering a skill node reveals its experience, related projects, expertise level, and related technologies
  4. The constellation includes the seed technologies (Golang, React, Next.js, Node.js, Docker, Kubernetes, AWS, Linux, AEM, Git, DevOps) from the data file

**Plans**: TBD
**UI hint**: yes

### Phase 5: Projects & Experience

**Goal**: The flagship showcases land — futuristic Project Capsules open into immersive detail panels with screenshots in device mockups, and Experience renders as styled "Mission Log" operations.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: PRJ-01, PRJ-02, PRJ-03, PRJ-04, PRJ-05, EXP-01, EXP-02
**Success Criteria** (what must be TRUE):

  1. Projects appear as futuristic Project Capsules (not traditional cards), populated from the seed data set
  2. Activating a capsule opens an immersive panel showing Overview, Architecture, Tech Stack, Features, Challenges, Lessons Learned, GitHub link, and Live Demo link
  3. Project screenshots display inside futuristic device/mockup frames
  4. Experience renders as "Mission Logs" each styled as a completed operation, showing role, description, technologies, achievements, and timeline from the data file

**Plans**: TBD
**UI hint**: yes

### Phase 6: Transmission Center & Command Palette

**Goal**: The interactive layer completes — a "Transmission Center" contact panel with simulated transmission, a Linear-style Ctrl+K command palette, and the advanced motion polish (parallax, mouse-follow glow, glass reflections, animated gradients) tying every section together.
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: TXC-01, TXC-02, TXC-03, CMD-01, CMD-02, MOT-02
**Success Criteria** (what must be TRUE):

  1. The contact section is branded "Transmission Center" with an Incoming Connection Request Name / Email / Message form that validates input and shows a "Transmission Successful" state (front-end simulated — nothing is actually sent)
  2. The Transmission Center has scanning animation, glowing borders, and futuristic terminal effects
  3. Ctrl+K (and ⌘K) opens a Linear-style command palette with fuzzy search and actions: Go To Projects, Go To Skills, Download Resume, Open GitHub, Open LinkedIn, Contact Me, Search Website
  4. Parallax, mouse-follow glow, hover interactions, glass reflections, and animated gradients are applied tastefully across sections and stay subtle (never distracting)

**Plans**: TBD
**UI hint**: yes

### Phase 7: Polish & Performance

**Goal**: A cross-cutting hardening pass — all motion degrades gracefully under `prefers-reduced-motion`, and the production build is tuned to a verified 90+ Lighthouse score before ship.
**Mode:** mvp
**Depends on**: Phase 6
**Requirements**: FND-05, FND-06
**Success Criteria** (what must be TRUE):

  1. With `prefers-reduced-motion` enabled, every animation across boot, hero, dashboard, constellation, capsules, and Transmission Center degrades to static or minimal motion
  2. A production build achieves a 90+ Lighthouse score across performance, accessibility, and best-practices
  3. The full site remains visually correct and responsive across mobile, tablet, and desktop in both themes after optimization

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Design System | 2/2 | Complete    | 2026-06-15 |
| 2. Boot & Hero Landing | 0/2 | Not started | - |
| 3. Dashboard & Dock Navigation | 0/TBD | Not started | - |
| 4. About & Skills | 0/TBD | Not started | - |
| 5. Projects & Experience | 0/TBD | Not started | - |
| 6. Transmission Center & Command Palette | 0/TBD | Not started | - |
| 7. Polish & Performance | 0/TBD | Not started | - |
