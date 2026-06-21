# Sourabh Jha — Portfolio

> A futuristic, interactive **3D "operating-system"** portfolio for an AI / Backend engineer — you don't scroll a résumé, you explore a live system topology.

The landing page is a real-time **WebGL system map**: a glowing identity core wired to orbiting service nodes, server racks, and a database, with data packets streaming between them. Clicking any object flies the camera in cinematically and pops the matching section open with a genie effect. There's a working **terminal**, a **⌘K command palette**, a **guided tour**, live **GitHub stats**, and a contact form that actually delivers — all wrapped in a strictly dichromatic, glassmorphic dark theme.

---

## ✨ Features

**The 3D world**
- **Live system topology** (React Three Fiber) — identity core, 6 service nodes, 4 interactive racks, a Postgres node, plus ambient racks and cooling towers framing a server hall.
- **Flowing data** — packets travel a fully-connected mesh; nodes **pulse** when a packet arrives, so the flow looks causal.
- **Cinematic navigation** — click a node / dock button / palette item to dolly the camera onto it; closing flies back to the overview.
- **Atmosphere** — reflective floor, bloom, vignette, grain, spinning cooling-fan blades, flickering rack LEDs.

**Interaction & wayfinding**
- **Custom cursor** — a "target-lock" selection reticle that scans while idle and snaps onto interactive elements (with a contextual `▸ open / type / select` HUD label).
- **⌘K / Ctrl+K command palette** — jump to any section, run the trace, download the résumé, copy email, open socials.
- **Terminal** (`` ` `` backtick) — a real shell: `whoami`, `about`, `skills`, `projects`, `open <section>`, `resume`, `sudo hire-me`, with command history.
- **Guided tour** — a hands-free autopilot that visits each section with captions (great for passive viewers).
- **Trace a request** — fires a bright packet through the full `client → core → db` path.
- **URL deep-linking** — `/#projects` opens that section on load; back/forward supported.

**Content & credibility**
- **Genie pop-out panels** — section content (About, Skills, Projects, Experience, Contact) emanates from the click point in a frosted terminal window.
- **Live GitHub stats** — real repo/follower counts + top-starred repos, fetched client-side and cached.
- **Availability badge**, animated **live telemetry** HUD, **cold-start boot loader**.
- **Working contact form** — delivers via [Resend](https://resend.com) with a branded auto-reply (opt-in).

**Quality**
- **Progressive enhancement** — full content renders in a static `SystemFallback` for SSR / SEO / no-JS.
- **Mobile & reduced-motion** — phones and `prefers-reduced-motion` users get the lightweight static experience (no WebGL).
- **FPS-adaptive** — `PerformanceMonitor` + `AdaptiveDpr` scale resolution and drop heavy post-FX on weaker GPUs.

---

## 🧰 Tech Stack

| Area | Choice |
| --- | --- |
| Framework | **Next.js 15** (App Router) |
| Language | **JavaScript / JSX** (no TypeScript) |
| UI runtime | **React 19** |
| 3D | **React Three Fiber**, **drei**, **@react-three/postprocessing**, **three** |
| Styling | **Tailwind CSS** + CSS design tokens (shadcn-style) |
| Motion | **Framer Motion** + CSS keyframes |
| Icons | **lucide-react** |
| Email | **Resend** (API route) |
| Deploy | **Vercel** |

**Design language:** strictly dichromatic — canvas `#020202` + ice-blue `#B2D5E5` (opacity tiers). Type pairs **IBM Plex Sans** (display/body) with **JetBrains Mono** (system voice). Apple-Vision-Pro-leaning glassmorphism, no neon.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
# → http://localhost:3000

# 3. Production build
npm run build
npm run start
```

> Requires **Node.js 18.18+** (Next.js 15).

### Tip
The cold-start loader is held for a minimum duration so its boot sequence always plays — tune `MIN_LOADER_MS` in `src/components/system/system-hero.jsx`.

---

## 🔑 Environment Variables

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

**Behaviour:**
- No `RESEND_API_KEY` → the API returns "not configured"; the form shows an error with a `mailto:` fallback.
- **Test mode** (no verified domain) → Resend only delivers to the email tied to your Resend account.
- The recruiter **auto-reply** stays dormant until `RESEND_FROM` is set (i.e. a domain is verified), then activates automatically.

On Vercel, add the same variables under **Project → Settings → Environment Variables**.

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

---

## ✏️ Customizing the content

All copy lives in `src/data/` — edit these and the whole site (3D labels, panels, terminal, emails) updates from one place:

- **`identity.js`** — name, title, tagline
- **`links.js`** — email, phone, GitHub, LinkedIn, résumé path
- **`about.js` / `skills.js` / `experience.js` / `projects.js`** — section content
- **`stats.js`** — the telemetry HUD metrics
- **`certifications.js` / `education.js`** — credentials

Put your résumé PDF in `public/` and point `links.resume` at it.
GitHub stats read the username from the `<GithubStats username="…" />` prop in `src/components/sections/projects.jsx`.

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

---

## ☁️ Deployment

Deploys cleanly to **Vercel**:

1. Push to GitHub and import the repo into Vercel.
2. Add `RESEND_API_KEY` (and `RESEND_FROM` / `CONTACT_TO` if used) to the environment variables.
3. Deploy — the default build/start commands work out of the box.

---

## ♿ Accessibility & Performance

- Full text content is server-rendered in `SystemFallback` for crawlers and no-JS visitors.
- `prefers-reduced-motion` disables the WebGL scene, the cursor animation, and decorative motion.
- Touch / small screens get the static experience (no GPU cost).
- Keyboard support across the palette, terminal, and section panels (Esc / arrows / Enter).

---

## 📄 License

Personal portfolio — all rights reserved © Sourabh Jha. Code may be referenced for learning; please don't redistribute the content (résumé data, copy) as your own.

---

<p align="center"><em>Built as a living system, not a static page.</em></p>
