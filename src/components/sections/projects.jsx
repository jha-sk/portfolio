import { projects } from '@/data/projects';
import { ProjectWindow } from '@/components/projects/project-window';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';

/**
 * Projects — expandable repo-window grid (section #6 in Career OS IA).
 *
 * Layout: responsive 1-col → 2-col grid of ProjectWindow capsules.
 * Each card is a RevealItem inside a RevealGroup for staggered scroll reveal.
 *
 * Design contract: token-only styling, dichromatic #020202/#B2D5E5.
 * Motion: RevealGroup/RevealItem staggered fade+y (inherited from primitives).
 */
export function Projects() {
  return (
    <section id="projects" aria-label="Projects">
      <div className="mx-auto w-full max-w-content px-4 md:px-6 lg:px-8 py-16 md:py-20">
        {/* Kicker + heading */}
        <p className="font-mono text-label text-fg3 mb-3">{'// projects'}</p>
        <h2 className="font-sans text-display font-semibold text-fg mb-10">
          Selected Work
        </h2>

        {/* Grid */}
        <RevealGroup className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <RevealItem key={project.id}>
              <ProjectWindow project={project} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

export default Projects;
