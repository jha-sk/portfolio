# Requirements: Career OS — Sourabh Jha Portfolio

**Defined:** 2026-06-16
**Core Value:** A visitor's first reaction is "this is one of the most unique developer portfolios I've ever seen" — landing + hero + navigation feel premium, alive, and unmistakably an "OS".

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation & Theming

- [x] **FND-01**: Project scaffolded on Next.js (latest, App Router) in JavaScript with Tailwind CSS, Framer Motion, Lucide React, and ShadCN UI configured
- [x] **FND-02**: Design-token system encodes the dichromatic palette (background `#020202`, primary `#B2D5E5`) plus glass/gradient/glow tokens, consumable in Tailwind
- [x] **FND-03**: Dark + light theme toggle (dark-first) switches the whole site; choice persists and loads without flash
- [x] **FND-04**: Layout is fully responsive across mobile, tablet, and desktop breakpoints
- [ ] **FND-05**: All motion respects `prefers-reduced-motion` (animations degrade to static/minimal)
- [ ] **FND-06**: Production build achieves a 90+ Lighthouse score (performance/accessibility/best-practices)
- [x] **FND-07**: Site content (identity, stats, projects, experience, skills, links) is driven by editable in-repo data files seeded with known info + tagged TODO placeholders

### Boot & Landing

- [ ] **BOOT-01**: On first load, a zen brush-stroke boot animation renders over the `#020202` background and reveals the homepage
- [ ] **BOOT-02**: Boot sequence is skippable / does not replay disruptively on subsequent navigations, and respects reduced-motion

### Hero & Dashboard

- [ ] **HERO-01**: Hero displays "SOURABH JHA", title "AI Engineer | Backend Engineer", and the building-scalable-systems tagline
- [ ] **HERO-02**: Hero background renders animated particles, aurora gradients, and floating light effects with subtle motion (GPU-friendly)
- [ ] **DASH-01**: Dashboard shows stat glass cards (Years of Experience, Projects Built, Technologies, Repositories, Open Source Contributions) with values from the data file
- [ ] **DASH-02**: Stat cards have glass effect, hover glow, and animated borders with smooth transitions

### Navigation

- [ ] **NAV-01**: A floating glass dock (Home, Projects, Skills, Experience, About, Contact) replaces a traditional navbar, stays visible, and animates smoothly
- [ ] **NAV-02**: Dock navigation moves the visitor to / highlights the active section
- [ ] **CMD-01**: Ctrl+K (and ⌘K) opens a Linear-style command palette with fuzzy search
- [ ] **CMD-02**: Command palette actions: Go To Projects, Go To Skills, Download Resume, Open GitHub, Open LinkedIn, Contact Me, Search Website

### About

- [ ] **ABT-01**: About section is an interactive timeline (2024 / 2025 / 2026 / Future entries) instead of paragraphs
- [ ] **ABT-02**: Each timeline item expands on hover to reveal detail

### Skills

- [ ] **SKL-01**: Skills render as a floating technology constellation of interconnected nodes with connecting lines and subtle motion
- [ ] **SKL-02**: Hovering a node reveals experience, related projects, expertise level, and related technologies
- [ ] **SKL-03**: Constellation includes the seed technologies (Golang, React, Next.js, Node.js, Docker, Kubernetes, AWS, Linux, AEM, Git, DevOps) from the data file

### Projects

- [ ] **PRJ-01**: Projects appear as futuristic "Project Capsules" (not traditional cards)
- [ ] **PRJ-02**: Activating a capsule opens an immersive panel
- [ ] **PRJ-03**: Each project panel shows Overview, Architecture diagram, Tech Stack, Features, Challenges, Lessons Learned, GitHub link, and Live Demo link
- [ ] **PRJ-04**: Project screenshots display inside futuristic device/mockup frames
- [ ] **PRJ-05**: Capsules are populated from the data file (seed set: Git Automation CLI, DevOps Monitoring Dashboard, AEM Automation Toolkit, Cloud Infrastructure Projects)

### Experience

- [ ] **EXP-01**: Experience renders as "Mission Logs" (e.g. Mission Log 01) each styled as a completed operation
- [ ] **EXP-02**: Each mission log shows role, description, technologies, achievements, and timeline from the data file

### Transmission Center (Contact)

- [ ] **TXC-01**: Contact section is branded "Transmission Center" with an "Incoming Connection Request" Name / Email / Message form
- [ ] **TXC-02**: Form validates input and the "INITIATE TRANSMISSION" button shows a "Transmission Successful" state (front-end simulated — no message is actually sent)
- [ ] **TXC-03**: Section has scanning animation, glowing borders, and futuristic terminal effects

### Motion System

- [x] **MOT-01**: A cohesive Framer Motion system provides smooth section/page reveal transitions
- [ ] **MOT-02**: Parallax, mouse-follow glow, hover interactions, glass reflections, and animated gradients are applied tastefully and stay subtle (never distracting)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Contact Delivery

- **TXC2-01**: Real message delivery (API route + email service) behind the Transmission Center form

### Content

- **CNT2-01**: Replace all TODO placeholder data (stat numbers, repo/demo URLs, project specifics, achievements, resume PDF) with real values

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real contact-message backend / email send | User chose simulated-only success state for v1 |
| CMS / headless content backend | Content lives in in-repo data files |
| Blog / writing section | Not in brief |
| Auth / user accounts / analytics dashboards | Public marketing portfolio |
| i18n / multi-language | Not in brief |
| Dynamic OG/icon image routes (`@vercel/og`) | Crashes on this Node box — use static OG/icon assets |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Complete |
| FND-02 | Phase 1 | Complete |
| FND-03 | Phase 1 | Complete |
| FND-04 | Phase 1 | Complete |
| FND-07 | Phase 1 | Complete |
| MOT-01 | Phase 1 | Complete |
| BOOT-01 | Phase 2 | Pending |
| BOOT-02 | Phase 2 | Pending |
| HERO-01 | Phase 2 | Pending |
| HERO-02 | Phase 2 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| NAV-01 | Phase 3 | Pending |
| NAV-02 | Phase 3 | Pending |
| ABT-01 | Phase 4 | Pending |
| ABT-02 | Phase 4 | Pending |
| SKL-01 | Phase 4 | Pending |
| SKL-02 | Phase 4 | Pending |
| SKL-03 | Phase 4 | Pending |
| PRJ-01 | Phase 5 | Pending |
| PRJ-02 | Phase 5 | Pending |
| PRJ-03 | Phase 5 | Pending |
| PRJ-04 | Phase 5 | Pending |
| PRJ-05 | Phase 5 | Pending |
| EXP-01 | Phase 5 | Pending |
| EXP-02 | Phase 5 | Pending |
| TXC-01 | Phase 6 | Pending |
| TXC-02 | Phase 6 | Pending |
| TXC-03 | Phase 6 | Pending |
| CMD-01 | Phase 6 | Pending |
| CMD-02 | Phase 6 | Pending |
| MOT-02 | Phase 6 | Pending |
| FND-05 | Phase 7 | Pending |
| FND-06 | Phase 7 | Pending |

**Coverage:**

- v1 requirements: 31 total
- Mapped to phases: 31 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-06-16*
*Last updated: 2026-06-16 after roadmap creation (7 phases, 31/31 mapped)*
