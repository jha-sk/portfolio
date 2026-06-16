import { certifications } from '@/data/certifications';
import { education } from '@/data/education';
import { ConsolePanel } from '@/components/ui/console-panel';
import { Reveal } from '@/components/motion/reveal';

/**
 * CertsEducation — credentials panel pair (section #7 in Career OS IA).
 *
 * Two paired ConsolePanels side-by-side on md+: certifications + education.
 * Wrapped in a single Reveal for scroll-triggered entrance.
 *
 * Design contract: token-only styling, dichromatic #020202/#B2D5E5.
 * Motion: single Reveal wrapper (fade + 16px y, GPU-friendly, reduced-motion gated).
 */
export function CertsEducation() {
  return (
    <section id="credentials" aria-label="Certifications and education">
      <div className="mx-auto w-full max-w-content px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certifications panel */}
            <ConsolePanel title="~/certifications">
              <ul className="space-y-5" role="list">
                {certifications.map((cert, i) => (
                  <li key={i}>
                    <p className="font-sans text-body text-fg">{cert.name}</p>
                    <p className="font-mono text-label text-fg3 mt-1">
                      {cert.issuer}
                    </p>
                  </li>
                ))}
              </ul>
            </ConsolePanel>

            {/* Education panel */}
            <ConsolePanel title="~/education">
              <ul className="space-y-5" role="list">
                {education.map((edu, i) => (
                  <li key={i}>
                    <p className="font-sans text-body text-fg">{edu.degree}</p>
                    <p className="font-sans text-body text-fg2 mt-0.5">
                      {edu.school} · {edu.location}
                    </p>
                    <p className="font-mono text-label text-fg3 mt-1">
                      {edu.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </ConsolePanel>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default CertsEducation;
