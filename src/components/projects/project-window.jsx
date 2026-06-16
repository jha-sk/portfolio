'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Github, ExternalLink, ChevronDown } from 'lucide-react';
import { ConsolePanel } from '@/components/ui/console-panel';
import { Chip } from '@/components/blueprint/chip';

/**
 * ProjectWindow — expandable repo window for a single project capsule.
 *
 * Renders inside a ConsolePanel titled `~/{project.id}` with macOS dots.
 * Body: name, stack chips, summary, highlight metric.
 * Links row: GitHub always; Demo only when project.demo is non-null.
 * Expand toggle: reveals bullet log; animated with Framer Motion height/opacity,
 * or instant toggle under prefers-reduced-motion.
 *
 * Design contract: token-only styling, dichromatic #020202/#B2D5E5.
 */
export function ProjectWindow({ project }) {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <ConsolePanel title={`~/${project.id}`} dots>
      {/* Project name */}
      <h3 className="font-sans text-heading font-semibold text-fg mb-4">
        {project.name}
      </h3>

      {/* Stack chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.stack.map((tech) => (
          <Chip key={tech}>{tech}</Chip>
        ))}
      </div>

      {/* Summary */}
      <p className="font-sans text-body text-fg2 mb-3">{project.summary}</p>

      {/* Highlight metric */}
      <p className="font-mono text-label text-fg text-glow mb-6">
        {project.highlight}
      </p>

      {/* Links row */}
      <div className="flex flex-wrap gap-4 mb-5">
        <a
          href={project.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-label text-fg2 hover:text-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
          aria-label={`${project.name} GitHub repository`}
        >
          <Github size={13} aria-hidden="true" />
          GitHub
        </a>
        {project.demo !== null && (
          <a
            href={project.demo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-label text-fg2 hover:text-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
            aria-label={`${project.name} live demo`}
          >
            <ExternalLink size={13} aria-hidden="true" />
            Live Demo
          </a>
        )}
      </div>

      {/* Expand toggle */}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 font-mono text-label text-fg3 hover:text-fg2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
      >
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeInOut' }}
          style={{ display: 'inline-flex' }}
          aria-hidden="true"
        >
          <ChevronDown size={13} />
        </motion.span>
        {open ? 'collapse' : 'expand'}
      </button>

      {/* Detail region — animated expand/collapse */}
      {prefersReducedMotion ? (
        open && (
          <ul className="mt-4 space-y-3" role="list" aria-label="Project details">
            {project.bullets.map((bullet, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-mono text-fg shrink-0 select-none" aria-hidden="true">
                  +
                </span>
                <span className="font-sans text-body text-fg2 leading-relaxed">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <ul
                className="mt-4 space-y-3"
                role="list"
                aria-label="Project details"
              >
                {project.bullets.map((bullet, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className="font-mono text-fg shrink-0 select-none"
                      aria-hidden="true"
                    >
                      +
                    </span>
                    <span className="font-sans text-body text-fg2 leading-relaxed">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </ConsolePanel>
  );
}

export default ProjectWindow;
