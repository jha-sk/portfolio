'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Github, ExternalLink, ChevronDown, Zap } from 'lucide-react';
import { ConsolePanel } from '@/components/ui/console-panel';
import { Chip } from '@/components/blueprint/chip';

/**
 * ProjectWindow — expandable repo window for a single project capsule.
 *
 * Inside a ConsolePanel (`~/{id}`, mac dots):
 *   - Header: index badge + name (left), repo / demo icon-buttons (right).
 *   - Summary, an accented impact-metric callout, a divided stack row.
 *   - Expand toggle reveals the detail bullets (Framer height/opacity).
 * The whole card lifts slightly on hover.
 *
 * Design contract: token-only styling, dichromatic #020202/#B2D5E5.
 */

/* Square icon-button for repo / demo links. */
function IconLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-fg2 transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg"
      style={{ border: '1px solid rgba(178,213,229,0.16)', background: 'rgba(178,213,229,0.04)' }}
    >
      {children}
    </a>
  );
}

export function ProjectWindow({ project, index = 0 }) {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <ConsolePanel title={`~/${project.id}`} dots>
        {/* Header: index + name (left) · repo links (right) */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-baseline gap-3 min-w-0">
            <span
              className="font-mono text-label text-fg3 shrink-0"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-sans text-heading font-semibold text-fg leading-tight truncate">
              {project.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <IconLink href={project.github} label={`${project.name} GitHub repository`}>
              <Github size={15} aria-hidden="true" />
            </IconLink>
            {project.demo !== null && (
              <IconLink href={project.demo} label={`${project.name} live demo`}>
                <ExternalLink size={15} aria-hidden="true" />
              </IconLink>
            )}
          </div>
        </div>

        {/* Summary */}
        <p className="font-sans text-body text-fg2 leading-relaxed mt-3">
          {project.summary}
        </p>

        {/* Impact metric — accent callout */}
        <div
          className="mt-4 flex items-start gap-2.5 rounded-lg px-3.5 py-2.5"
          style={{
            background: 'rgba(178,213,229,0.05)',
            borderLeft: '2px solid rgba(178,213,229,0.45)',
          }}
        >
          <Zap size={14} className="text-fg shrink-0 mt-0.5" aria-hidden="true" />
          <span className="font-mono text-label text-fg text-glow leading-snug">
            {project.highlight}
          </span>
        </div>

        {/* Stack — divided */}
        <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(178,213,229,0.1)' }}>
          <p className="font-mono text-label uppercase tracking-[0.12em] text-fg3 mb-2.5">
            stack
          </p>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <Chip key={tech}>{tech}</Chip>
            ))}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-label text-fg3 hover:text-fg2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg rounded"
        >
          {open ? 'collapse' : 'details'}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeInOut' }}
            style={{ display: 'inline-flex' }}
            aria-hidden="true"
          >
            <ChevronDown size={13} />
          </motion.span>
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
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </ConsolePanel>
    </motion.div>
  );
}

export default ProjectWindow;
