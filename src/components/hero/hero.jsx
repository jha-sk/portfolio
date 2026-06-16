import { identity } from '@/data/identity';
import { stats } from '@/data/stats';
import { skills } from '@/data/skills';
import { ConsolePanel } from '@/components/ui/console-panel';
import { Node } from '@/components/blueprint/node';
import { Axis } from '@/components/blueprint/axis';
import { Coordinate } from '@/components/blueprint/coordinate';
import { Chip } from '@/components/blueprint/chip';
import { MountReveal, MountRevealItem } from '@/components/motion/mount-reveal';
import { ScrollCue } from './scroll-cue';

/**
 * Hero — full-viewport terminal frame + 3D blueprint wordmark (HERO-01 / HERO-02).
 *
 * Composition: A ConsolePanel (terminal window chrome) centered in a min-h-[100svh]
 * section. Inside: staggered MountReveal entrance with Node kicker, the 3D-extruded
 * SOURABH JHA wordmark, a drawn Axis, role line, skill chips, and telemetry.
 *
 * Server component — all client animation is in MountReveal/MountRevealItem +
 * child primitives. Content is data-driven (identity, stats, skills) — never hardcoded.
 * Token-only styling throughout (dichromatic: #020202 + #B2D5E5 tiers only).
 */

/* ── Skill chips: pick 6 representative skills from the data ───────────── */
const HERO_SKILL_IDS = ['Go', 'Kubernetes', 'Terraform', 'AWS', 'Linux', 'Observability'];

function pickHeroSkills(skillData) {
  const all = skillData.flatMap((cat) => cat.items);
  const selected = HERO_SKILL_IDS.map((id) => {
    // Observability is a category label, not an item — fall back to "Prometheus"
    if (id === 'Observability') {
      const found = all.find((s) => s === 'Prometheus' || s === 'Grafana');
      return found ?? 'Observability';
    }
    return all.find((s) => s === id) ?? id;
  });
  return selected;
}

/* ── Telemetry line from first 4 stats ─────────────────────────────────── */
const STAT_LABELS = {
  uptime: 'uptime',
  issues: 'issues',
  mttr: 'mttr',
  perf: 'perf',
};

function buildTelemetry(statData) {
  return statData
    .slice(0, 4)
    .map((s) => `${STAT_LABELS[s.id] ?? s.id} ${s.value}`)
    .join(' · ');
}

export function Hero() {
  const heroSkills = pickHeroSkills(skills);
  const telemetry = buildTelemetry(stats);

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 py-16 md:px-8">
      {/* Ambient glow blob behind the window */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[60vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg"
        style={{ opacity: 0.04, filter: 'blur(120px)' }}
      />

      {/* Terminal window — the hero frame */}
      <ConsolePanel
        title="~/career-os — zsh"
        dots
        className="relative w-full max-w-[780px]"
        bodyClassName="p-8 md:p-10"
      >
        {/* Coordinate tag — top-right of body */}
        <Coordinate className="absolute right-4 top-3 md:right-6">
          {'[ node_01 · 042,117 ]'}
        </Coordinate>

        {/* Staggered on-mount reveal */}
        <MountReveal className="flex flex-col gap-6">

          {/* 1. Kicker: Node + // identity */}
          <MountRevealItem className="flex items-center gap-3">
            <Node pulse />
            <span className="font-mono text-label uppercase tracking-[0.18em] text-fg3">
              {'// identity'}
            </span>
          </MountRevealItem>

          {/* 2. Wordmark — 3D extruded glow */}
          <MountRevealItem>
            <h1
              className="font-sans font-bold uppercase text-fg"
              style={{
                fontSize: 'clamp(40px,7.5vw,76px)',
                lineHeight: 0.92,
                letterSpacing: '.005em',
                textShadow:
                  '0 1px 0 rgba(133,174,191,.9), 0 2px 0 rgba(110,148,164,.85), 0 3px 0 rgba(88,120,135,.8), 0 4px 0 rgba(66,92,105,.74), 0 5px 0 rgba(48,68,78,.68), 0 6px 2px rgba(0,0,0,.5), 0 0 34px rgba(178,213,229,.5), 0 12px 28px rgba(0,0,0,.65)',
              }}
            >
              {identity.name.toUpperCase()}
            </h1>
          </MountRevealItem>

          {/* 3. Axis separator */}
          <MountRevealItem>
            <Axis draw className="w-full" />
          </MountRevealItem>

          {/* 4. Role line */}
          <MountRevealItem>
            <p className="font-mono text-label text-fg2">
              {'// '}
              {identity.title.toLowerCase()}
            </p>
          </MountRevealItem>

          {/* 5. Skill chips — 6 representative picks */}
          <MountRevealItem className="flex flex-wrap gap-2">
            {heroSkills.map((skill) => (
              <Chip key={skill}>{skill.toLowerCase()}</Chip>
            ))}
          </MountRevealItem>

          {/* 6. Telemetry line — first 4 stats */}
          <MountRevealItem>
            <p className="font-mono text-label text-fg3">{telemetry}</p>
          </MountRevealItem>

        </MountReveal>
      </ConsolePanel>

      {/* Scroll cue — absolute bottom-center → #snapshot */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <ScrollCue targetId="snapshot" />
      </div>
    </section>
  );
}

export default Hero;
