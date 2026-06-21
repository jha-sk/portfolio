<div align="center">

<br />

# `CAREER · OS`

### Sourabh Jha — AI / Backend Engineer

*You don't scroll a résumé. You explore a live system.*

<br />

A futuristic, interactive **3D operating-system portfolio**. The landing page is a real-time **WebGL system map** — a glowing identity core wired to orbiting service nodes, server racks, and a database, with data packets streaming between them. Click any object and the camera flies in cinematically, popping the matching section open with a genie effect.

<br />

![Next.js](https://img.shields.io/badge/Next.js_15-020202?style=for-the-badge&logo=next.js&logoColor=B2D5E5)
![React](https://img.shields.io/badge/React_19-020202?style=for-the-badge&logo=react&logoColor=B2D5E5)
![Three.js](https://img.shields.io/badge/React_Three_Fiber-020202?style=for-the-badge&logo=three.js&logoColor=B2D5E5)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-020202?style=for-the-badge&logo=tailwindcss&logoColor=B2D5E5)
![Framer](https://img.shields.io/badge/Framer_Motion-020202?style=for-the-badge&logo=framer&logoColor=B2D5E5)
![Vercel](https://img.shields.io/badge/Vercel-020202?style=for-the-badge&logo=vercel&logoColor=B2D5E5)

<br />

**[Features](#-features) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [Configuration](#-configuration) · [Structure](#-project-structure) · [Customizing](#-customizing-content) · [Deploy](#-deployment)**

</div>

<br />

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

#### 🌐 The 3D World
- **Live system topology** (React Three Fiber) — identity core, 6 service nodes, 4 interactive racks, a Postgres node, plus ambient racks and cooling towers.
- **Flowing data** — packets travel a fully-connected mesh; nodes **pulse** when a packet arrives, so the flow looks causal.
- **Cinematic navigation** — click a node, dock button, or palette item to dolly the camera in; closing flies back to overview.
- **Atmosphere** — reflective floor, bloom, vignette, grain, spinning cooling fans, flickering rack LEDs.

</td>
<td width="50%" valign="top">

#### 🎯 Interaction & Wayfinding
- **Custom cursor** — a "target-lock" reticle that scans while idle and snaps onto interactive elements with a `▸ open / type / select` HUD label.
- **⌘K command palette** — jump to any section, run the trace, download the résumé, copy email, open socials.
- **Terminal** (`` ` ``) — a real shell: `whoami`, `skills`, `projects`, `open <section>`, `sudo hire-me`, with history.
- **Guided tour** — a hands-free autopilot that visits each section with captions.

</td>
</tr>
<tr>
<td width="50%" valign="top">

#### 🪪 Content & Credibility
- **Genie pop-out panels** — section content emanates from the click point in a frosted terminal window.
- **Live GitHub stats** — real repo / follower counts and top-starred repos, fetched client-side and cached.
- **Trace a request** — fires a bright packet through the full `client → core → db` path.
- **Working contact form** — delivers via [Resend](https://resend.com) with a branded auto-reply (opt-in).

</td>
<td width="50%" valign="top">

#### ⚡ Quality & Resilience
- **Progressive enhancement** — full content renders in a static `SystemFallback` for SSR / SEO / no-JS.
- **Mobile & reduced-motion** — phones and `prefers-reduced-motion` users get the lightweight static experience.
- **FPS-adaptive** — `PerformanceMonitor` + `AdaptiveDpr` scale resolution and drop heavy post-FX on weaker GPUs.
- **Deep-linking** — `/#projects` opens that section on load; back/forward supported.

</td>
</tr>
</table>

<br />

---

## 🧰 Tech Stack

| Area | Choice |
| --- | --- |
| **Framework** | Next.js 15 (App Router) |
| **Language** | JavaScript / JSX — *no TypeScript* |
| **UI runtime** | React 19 |
| **3D** | React Three Fiber · drei · @react-three/postprocessing · three |
| **Styling** | Tailwind CSS + CSS design tokens (shadcn-style) |
| **Motion** | Framer Motion + CSS keyframes |
| **Icons** | lucide-react |
| **Email** | Resend (API route) |
| **Deploy** | Vercel |

> [!NOTE]
> **Design language** — strictly dichromatic: canvas `#020202` + ice-blue `#B2D5E5` (opacity tiers). Type pairs **IBM Plex Sans** (display / body) with **JetBrains Mono** (system voice). Apple-Vision-Pro-leaning glassmorphism. No neon.

<br />

---

## 🚀 Quick Start

```bash
# 1 · Install dependencies
npm install

# 2 · Run the dev server  →  http://localhost:3000
npm run dev

# 3 · Production build
npm run build && npm run start
```

> [!IMPORTANT]
> Requires **Node.js 18.18+** (Next.js 15).

<details>
<summary><b>💡 Tip — tuning the boot loader</b></summary>

<br />

The cold-start loader is held for a minimum duration so its boot sequence always plays. Tune `MIN_LOADER_MS` in [`src/components/system/system-hero.jsx`](src/components/system/system-hero.jsx).

</details>

<br />

---

## 🔑 Configuration

The contact form sends through Resend. Create `.env.local` (gitignored):

```bash
# Required — your Resend API key (https://resend.com → API Keys)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# Optional — verified sender. Until you verify a domain, leave unset to use
# Resend's onboarding@resend.dev (test mode delivers only to your account email).
# RESEND_FROM=Sourabh Jha <noreply@yourdomain.com>

# Optional — delivery inbox (defaults to the email in src/data/links.js)
# CONTACT_TO=you@example.com
```

| Condition | Behaviour |
| --- | --- |
| No `RESEND_API_KEY` | API returns *"not configured"*; form shows an error with a `mailto:` fallback. |
| **Test mode** (no verified domain) | Resend only delivers to the email tied to your Resend account. |
| `RESEND_FROM` unset | The recruiter **auto-reply** stays dormant until a domain is verified, then activates automatically. |

> On Vercel, add the same variables under **Project → Settings → Environment Variables**.

<br />

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.js              # Root layout, fonts, metadata, custom cursor
│   ├── page.js                # Home route → <SystemHero/>
│   ├── globals.css            # Dichromatic design tokens + keyframes
│   └── api/contact/route.js   # Resend-backed contact endpoint
├── components/
│   ├── system/                # The 3D OS shell
│   │   ├── system-hero.jsx        # Hero orchestrator (HUD, tour, deep-link, ⌘K)
│   │   ├── system-scene.jsx       # R3F canvas: core, nodes, racks, packets, camera
│   │   ├── system-fallback.jsx    # Static SSR / no-WebGL experience
│   │   ├── system-loader.jsx      # Cold-start boot loader
│   │   ├── section-panel.jsx      # Genie pop-out content panel
│   │   ├── command-palette.jsx    # ⌘K palette
│   │   ├── command-terminal.jsx   # Interactive shell
│   │   ├── custom-cursor.jsx      # Target-lock reticle cursor
│   │   ├── live-telemetry.jsx     # Animated HUD telemetry
│   │   └── github-stats.jsx       # Live GitHub proof-of-work
│   ├── sections/              # About, Skills, Projects, Experience, Contact, …
│   ├── projects/              # ProjectWindow capsule
│   └── ui/console-panel.jsx   # Mac/Ghostty-style terminal window frame
├── data/                      # All résumé content (single source of truth)
│   ├── identity.js  links.js  about.js  skills.js
│   ├── experience.js  projects.js  stats.js
│   └── certifications.js  education.js
└── lib/                       # fonts, utils
```

<br />

---

## ✏️ Customizing Content

All copy lives in `src/data/` — edit these and the whole site (3D labels, panels, terminal, emails) updates from **one place**:

| File | Owns |
| --- | --- |
| `identity.js` | name, title, tagline |
| `links.js` | email, phone, GitHub, LinkedIn, résumé path |
| `about.js` · `skills.js` · `experience.js` · `projects.js` | section content |
| `stats.js` | the telemetry HUD metrics |
| `certifications.js` · `education.js` | credentials |

> Put your résumé PDF in `public/` and point `links.resume` at it.
> GitHub stats read the username from the `<GithubStats username="…" />` prop in [`src/components/sections/projects.jsx`](src/components/sections/projects.jsx).

<br />

---

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run test:smoke` | Smoke tests |
| `npm run test:data` | Data-layer tests |

<br />

---

## ☁️ Deployment

Deploys cleanly to **Vercel**:

1. Push to GitHub and import the repo into Vercel.
2. Add `RESEND_API_KEY` (and `RESEND_FROM` / `CONTACT_TO` if used) to the environment variables.
3. Deploy — the default build / start commands work out of the box.

<br />

---

## ♿ Accessibility & Performance

- Full text content is server-rendered in `SystemFallback` for crawlers and no-JS visitors.
- `prefers-reduced-motion` disables the WebGL scene, the cursor animation, and decorative motion.
- Touch / small screens get the static experience — **no GPU cost**.
- Keyboard support across the palette, terminal, and section panels (Esc / arrows / Enter).

<br />

---

## 📄 License

Personal portfolio — all rights reserved © Sourabh Jha. Code may be referenced for learning; please don't redistribute the content (résumé data, copy) as your own.

<br />

<div align="center">

<sub>Built as a living system, not a static page.</sub>

<br /><br />

`#020202` · `#B2D5E5`

</div>
