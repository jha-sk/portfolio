# Career OS — Sourabh Jha Portfolio (Redesign) — Design Spec

**Date:** 2026-06-16
**Status:** Draft for review
**Owner:** Sourabh Jha
**Supersedes:** the earlier dark/glass "Apple-Vision-Pro" direction (Phase 1–2 visual work). The technical foundation is kept; the visual identity is rebuilt.

---

## 1. Overview

A premium single-page personal portfolio for **Sourabh Jha**, positioned as **"AI Engineer · Backend Engineer"**, that presents him as a **backend / systems engineer who is AI-augmented**. The site is themed as a developer's operating system — **"Career OS"** — rendered as a dark console of titled window/panels with a glowing "engineering blueprint" identity. Storytelling is visual-first, content is real (from his résumé), and the experience is fast and accessible.

**Core value:** a recruiter or engineering manager's first reaction is *"this person clearly builds and runs real systems — and the portfolio itself proves the craft."*

**Audience:** recruiters, engineering managers, and peers evaluating Sourabh for AI Engineer / Backend Engineer roles.

---

## 2. Aesthetic Direction (locked)

**Concept:** "Career OS" — a console/terminal shell + engineering-blueprint identity.

- **Palette — strictly dichromatic.** Canvas `#020202`; foreground `#B2D5E5` (ice-blue) only, expressed in opacity tiers:
  - Emphasis 100% · Secondary ~62% · Muted ~42% · Hairlines/grid ~15–25%.
  - Glow: `0 0 24–34px rgba(178,213,229,.4)`. **No second hue, no white.**
  - State colours (form validation, success): expressed via the ice-blue at different opacities + iconography/motion, never a red/green hue (preserves the two-colour rule).
- **Typography — two families:**
  - **IBM Plex Sans** — wordmarks, section headings (700; the largest wordmarks get a 3D-extruded + glow treatment built from tints/shades of `#B2D5E5`), and readable body copy.
  - **JetBrains Mono** — the "system voice": labels, kickers, skill chips, telemetry/metrics, coordinate tags, command prompts, and code-comment taglines.
  - Loaded via `next/font` (self-hosted, `display: swap`, CSS-variable bound).
- **Panel pattern — every section is a console window:** a title bar (e.g. `~/projects`, `// EXPERIENCE`, optional traffic-dots), faint scanline/grid texture, ice-blue hairline border, soft outer shadow + subtle inner glow.
- **Blueprint connective tissue:** glowing nodes, drawn axis lines, coordinate tags (`[ 042 · 117 ]`), and grid planes used as accents between/around panels.
- **Theme:** **dark-only** (the light theme is intentionally dropped).

---

## 3. Scope

**In scope (v1):**
- Full visual rebuild of all sections in the Career OS language, populated with real résumé data.
- Dark-only dichromatic design-token system, two-font system, console-panel components, blueprint accent components.
- Boot reveal (reskinned, short, skippable, once-per-session), section reveals, a floating dock nav.
- Simulated contact form (front-end only success state).
- Responsive across mobile / tablet / desktop; reduced-motion support; 90+ Lighthouse target.

**Kept from the existing build (not rebuilt):**
- Next.js (App Router) + JavaScript project, Tailwind, Framer Motion, ShadCN primitives, build/lint tooling, the `src/` structure + `@/*` alias, the in-repo per-domain data architecture, the `next-themes`/`useReducedMotion` plumbing (theme provider simplified to dark-only), and the boot/reveal mechanics (reskinned).

**Rebuilt / replaced:**
- The design tokens in `globals.css` + `tailwind.config.js` (new dichromatic + two-font system).
- All visual components (hero, boot, sections) — the Phase-2 hero/boot and Phase-1 placeholder UI are replaced.
- The fonts (Geist → IBM Plex Sans + JetBrains Mono).

**Out of scope (v1):**
- Real contact-message delivery (backend/email) — simulated only.
- A light theme.
- CMS / blog / auth / analytics / i18n.
- Exact project repo/demo URLs and the résumé PDF are **assets to be dropped in** (see §7); the build ships with the known GitHub/LinkedIn profile links and the résumé file once provided.

---

## 4. Information Architecture

One page, top → bottom, each a console panel:

1. **Hero** — full-viewport. Terminal window (chrome, `~/career-os`, scanlines) + 3D blueprint wordmark **SOURABH JHA** + glowing `// identity` node + coordinate tag + role line + skill chips + live telemetry (uptime / issues / MTTR / perf). Scroll cue.
2. **Snapshot** — a strip of telemetry stat panels: `99.9%` uptime, `50+` prod issues resolved, `−30%` MTTR, `+20%` perf, `−15–20%` deploy turnaround, plus project/skill counts. Glowing IBM Plex Sans numbers, mono labels.
3. **About** — a `~/about` panel: a tight 2–3 sentence bio (backend foundations + AI-augmented engineering).
4. **Skills** — a "system spec" of category panels, each with glowing chips: Languages · Backend & APIs · Cloud & DevOps · Databases · Tools/Observability · Security · AI-Augmented · Practices.
5. **Experience** — a changelog / mission log: the Accenture entry as `+` log lines with right-aligned dates and glowing metrics.
6. **Projects** — the centerpiece: module/repo windows for **Ash OS**, **Website Nativefier**, **Git Automation CLI** — title, stack chips, one-line summary + a headline metric, GitHub/demo links; click to expand a detail panel (what it does, stack, highlights).
7. **Certifications & Education** — paired compact panels.
8. **Contact** — a "transmission console": terminal-style inputs (`name>`, `email>`, `message>`) + an `INITIATE TRANSMISSION` action → simulated success output; plus email / LinkedIn / GitHub / résumé-download links.

**Navigation:** a minimal floating **dock** (bottom-center) with section jumps + theme-independent; a **⌘K command palette** is a fast-follow (nav actions, open GitHub/LinkedIn, download résumé, contact).

**Boot:** on first visit per tab session, a short (~1.5–2s) themed power-on (grid + wordmark glow up, then settle) over the void; skippable on any input; bypassed under reduced motion; does not replay on in-session navigation.

---

## 5. Per-Section Real Content

**Identity:** Sourabh Jha · "AI Engineer · Backend Engineer" · tagline: *"Building scalable systems — backend foundations, AI on top."*

**Snapshot metrics (from Experience):** 99.9% uptime · 50+ production issues resolved · MTTR −30% · backend perf +20% · deploy turnaround −15–20%.

**About (draft copy, to confirm):** *"Backend & systems engineer at Accenture building and operating enterprise-scale platforms in Go, Java, and Python — REST/microservices, cloud & Kubernetes, and the observability that keeps them at 99.9% uptime. I work AI-augmented: prompt engineering and LLM-assisted workflows for debugging, architecture, and automation."*

**Skills (verbatim categories):**
- **Languages:** Go, Java, Python, C++, TypeScript, Bash
- **Backend & APIs:** REST APIs, Microservices, Echo, Gorilla Mux, Node.js, Express.js
- **Cloud & DevOps:** AWS, Azure, GCP, Docker, Kubernetes, Terraform, Helm, GitHub Actions, CI/CD
- **Databases:** MongoDB, PostgreSQL
- **Tools / Observability:** Linux, Git, Prometheus, Grafana, ELK, Docker Compose
- **Security:** Microsoft Security Operations, SIEM, Incident Response, Secure Coding
- **AI-Augmented Engineering:** Prompt Engineering, LLM-Assisted Development, Workflow Automation
- **Practices:** Agile, Code Review, Root Cause Analysis, Performance Optimization

**Experience:** Associate Software Engineer — Accenture Solutions Pvt Ltd — Nov 2024 – Present. Bullets: backend enhancements/prod fixes for enterprise WCM platforms (Java, REST, Git); 50+ production issues resolved via RCA; +20% backend perf via API optimization/refactor; CI/CD via Docker + GitHub Actions (−15–20% deploy turnaround); 99.9% availability; MTTR −30% via observability; cross-team release support; AI-assisted development workflows.

**Projects:**
- **Ash OS** — *Linux · Shell · Lua · GitHub Actions · Docker.* Lightweight Linux distro for older hardware with enhanced audio/performance. **66.7% lower storage, 24% lower RAM vs Fedora.** Automated ISO build/release via Docker + GH Actions. (GitHub)
- **Website Nativefier** — *Go · Electron · Tailwind · Docker · Kubernetes · Terraform · Azure.* Converts websites into native-like Electron apps; deployed via Docker, AKS, Terraform, CI/CD on GH Actions. (GitHub)
- **Git Automation CLI** — *Go · Cobra · fsnotify · Git.* Real-time Git repo monitoring (branches, commits, merges) via fsnotify + git metadata; persistent logging, colorized output, multi-repo. (GitHub)

**Certifications:** Microsoft Certified: Security Operations Analyst Associate · "Simple Golang Projects" — Udemy (Akhil Sharma).

**Education:** B.Tech, Computer Science & Engineering — SRM University, Sonepat, Haryana — CGPA 7.72.

**Contact:** codewithsourabhjha@gmail.com · +91 76939 03439 · LinkedIn (linkedin.com/in/sk-jha) · GitHub (github.com/jha-sk) · résumé download.

---

## 6. Technical Approach

- **Stack (unchanged):** Next.js (App Router) in JavaScript, Tailwind, Framer Motion, Lucide, ShadCN primitives. Deploy on Vercel. Avoid `@vercel/og` dynamic routes (static assets only). Heed the Windows/Node `next-swc` cache gotcha.
- **Data:** real content lives in the existing per-domain `src/data/*.js` files (identity, stats, projects, skills, experience, certifications/education, links) — placeholders replaced with the §5 data.
- **Design tokens:** rewrite `globals.css` (`:root` dark-only) + `tailwind.config.js` — dichromatic colour tiers, glow/scanline/grid tokens, the two font-family variables. Components consume tokens only (no hardcoded hex except mask/keyword alphas).
- **Components (new):** `console-panel` (the window frame), blueprint primitives (`node`, `axis`, `coordinate`, `grid-plane`), `boot-overlay` (reskinned), `hero`, `snapshot`, `about`, `skills`, `experience`, `projects` (+ expandable detail), `certs-education`, `contact`, `dock`, and the motion wrappers (reuse the reveal pattern + a mount-reveal).
- **Motion:** transform/opacity only; `useReducedMotion` gates everywhere; staggered scroll reveals; the boot + hero entrance choreography; ambient glows on slow loops. Target 90+ Lighthouse.
- **Accessibility:** AA contrast for ice-blue text on the void (verify the muted tiers); focus-visible rings; the icon-only/interactive elements carry aria-labels; reduced-motion renders everything static.

---

## 7. Assets To Provide (small, explicit gaps)

- Exact **GitHub repo URLs** for Ash OS, Website Nativefier, Git Automation CLI (else they link to the GitHub profile).
- Any **live demo** URLs (else the "Live Demo" action is hidden per project).
- The **résumé PDF** placed at `/public/Sourabh-Jha-Resume.pdf` (the attached résumé can be used).
- Confirm the **About** copy in §5 (or tweak).

These are content drops, not design blockers — the build ships with sensible fallbacks.

---

## 8. Success Criteria

1. The site builds and runs (clean `next build` + lint), deploys on Vercel.
2. Every section renders the real §5 data in the Career OS language, strictly `#020202` + `#B2D5E5`.
3. Hero matches the approved hybrid (terminal frame + 3D blueprint wordmark + telemetry).
4. Boot plays once per session, skippable, reduced-motion-safe; sections reveal on scroll; dock nav works.
5. Contact form validates and shows a simulated success state (nothing sent).
6. Responsive with no horizontal scroll ≥320px; reduced-motion degrades to static; 90+ Lighthouse.

---

## 9. Relationship to Prior Planning

The earlier GSD roadmap/specs targeted the dark-glass direction. This redesign keeps the **foundation** (scaffold, data architecture, motion plumbing) and replaces the **visual layer + content**. Prior phase plans for hero/boot are superseded by this spec; remaining roadmap sections (skills, projects, experience, contact, command palette, polish) are re-scoped to the Career OS language during planning.
