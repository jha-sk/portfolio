# Career OS — Sourabh Jha Portfolio

## What This Is

A futuristic, premium personal portfolio website for **Sourabh Jha** that feels like entering a software engineer's operating system — branded **"Career OS"** — rather than a traditional resume site. It opens with a zen brush-stroke boot reveal, then presents an interactive control-center of glass dashboard cards, a floating glass dock, a technology constellation, immersive "Project Capsules", "Mission Log" experience entries, a Linear-style Ctrl+K command palette, and a "Transmission Center" contact panel. Storytelling is ~80% visual / 20% text, on a premium dark theme (background `#020202`, primary `#B2D5E5`) with glassmorphism and subtle motion. Audience: recruiters, engineering managers, and peers evaluating Sourabh for **AI Engineer / Backend Engineer** roles.

## Core Value

A visitor's first reaction is *"this is one of the most unique developer portfolios I've ever seen"* — the landing + hero + navigation must feel premium, alive, and unmistakably an "OS", flawlessly, before anything else.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Zen brush-stroke boot/reveal animation on first load over the `#020202` background
- [ ] Hero: "SOURABH JHA" / "AI Engineer | Backend Engineer" / tagline, with animated particles, aurora gradients, floating light effects
- [ ] Floating glass dock navigation (Home, Projects, Skills, Experience, About, Contact) — no traditional navbar
- [ ] Dashboard stat cards (Years of Experience, Projects Built, Technologies, Repositories, Open Source Contributions) with glass effect, hover glow, animated borders
- [ ] About: interactive expand-on-hover timeline (2024 / 2025 / 2026 / Future)
- [ ] Skills: floating technology constellation of interconnected nodes with hover detail (experience, projects, level, related tech) and connecting lines
- [ ] Projects: "Project Capsules" (not cards) opening immersive panels (Overview, Architecture, Tech Stack, Features, Challenges, Lessons, GitHub, Live Demo, screenshots in futuristic mockups)
- [ ] Experience: "Mission Logs" (role, description, technologies, achievements, timeline)
- [ ] Command palette (Ctrl+K), Linear-style: nav actions, download resume, open GitHub/LinkedIn, contact, search
- [ ] Transmission Center contact panel: Name/Email/Message form, "INITIATE TRANSMISSION" button, "Transmission Successful" state, scanning animation + glowing borders + terminal effects (front-end simulated, no backend send)
- [ ] Dark + light mode toggle (full light theme, dark-first)
- [ ] Framer Motion animation system: page transitions, parallax, mouse-follow glow, hover interactions, glass reflections, animated gradients, section reveals, floating particles — subtle, respects `prefers-reduced-motion`
- [ ] Responsive across mobile / tablet / desktop
- [ ] 90+ Lighthouse score
- [ ] Content driven by an editable data/content config seeded with known info + tagged placeholders for repos/stats/demos/resume

### Out of Scope

- Real contact-message delivery (backend/API, email service) — chosen "simulated only"; success state is front-end. Revisit if real inbound is needed.
- CMS / headless content backend — content lives in in-repo data files for now.
- Blog / writing section — not in brief.
- Authentication, user accounts, analytics dashboards — it's a public marketing portfolio.
- i18n / multi-language.

## Context

- **Person:** Sourabh Jha — Associate Software Engineer @ Accenture (~1+ yr), positioning toward AI Engineer / Backend Engineer.
- **Links:** GitHub `github.com/jha-sk` · LinkedIn `linkedin.com/in/sk-jha` · email `codewithsourabhjha@gmail.com`.
- **Display title:** "AI Engineer | Backend Engineer".
- **Seed project capsules:** Git Automation CLI · DevOps Monitoring Dashboard · AEM Automation Toolkit · Cloud Infrastructure Projects (real specifics TBD — placeholders).
- **Seed skills:** Golang, React, Next.js, Node.js, Docker, Kubernetes, AWS, Linux, AEM, Git, DevOps.
- **Data approach:** user opted to interview for real data but deferred specifics ("rest everything is fine") — so build with a single content config: known identity facts + clearly-tagged `TODO` placeholders for stat numbers, repo/demo URLs, project details, achievements, and a resume PDF the user will drop into `/public`.
- **Environment gotchas (from prior portfolio work on this Windows/Node box):** npm can produce a truncated `next-swc` binary → `next build` fails with "not a valid Win32 application"; fix is `npm cache clean --force` + reinstall. `@vercel/og` dynamic OG/icon routes crash on this Node 26 box — prefer static OG/icon assets. Lingering `next start` jobs corrupt `.next` under concurrent builds — kill port owner + remove `.next` before re-testing.

## Constraints

- **Tech stack**: Next.js (latest, App Router), **JavaScript (not TypeScript)**, Tailwind CSS, **Framer Motion (required)**, Lucide React icons, ShadCN UI — locked by the user.
- **Design**: background `#020202`, primary `#B2D5E5`, subtle gradients + glassmorphism, dichromatic minimalism, premium dark theme; no excessive color, no neon cyberpunk, no generic cards/navbars/hero. Apple Vision Pro–like aesthetic.
- **Performance**: 90+ Lighthouse — heavy animation must stay GPU-friendly and respect `prefers-reduced-motion`.
- **Deployment**: Vercel (custom domain later).
- **Process**: built phase-by-phase with explicit user go-ahead between phases.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| JavaScript, not TypeScript | User directive (overrides prior portfolio's TS choice) | — Pending |
| Framer Motion as animation engine | User directive (overrides prior "no anim libs" decision) | — Pending |
| ShadCN UI + Tailwind + Lucide | User directive; ShadCN for accessible primitives, themed to the dark OS look | — Pending |
| Contact form simulated only | User chose front-end-only success; avoids backend/secrets/spam surface | — Pending |
| Full light + dark toggle, dark-first | User wants both; dark is the hero experience | — Pending |
| Content via in-repo data config w/ placeholders | User deferred real data; unblocks build, easy to fill later | — Pending |
| Deploy to Vercel, full brief (not MVP-trimmed) | User selected full scope on Vercel | — Pending |
| Palette `#020202` / `#B2D5E5` | User directive | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-16 after initialization*
