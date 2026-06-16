'use client';

/**
 * SectionPanel — glass drawer overlay for 3D click-to-navigate.
 *
 * Renders the existing section components inside a right-side glass panel.
 * Opened by clicking 3D objects or the HUD nav buttons.
 * Closed via backdrop click, Esc key, or the X button.
 *
 * Progressive enhancement: this component only mounts on the client (inside
 * CanvasOrFallback which is in a 'use client' component). No-JS/SSR paths
 * continue to render sections inline in SystemFallback.
 */

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

import { About } from '@/components/sections/about';
import { Skills } from '@/components/sections/skills';
import { Projects } from '@/components/sections/projects';
import { Experience } from '@/components/sections/experience';
import { Contact } from '@/components/sections/contact';
import { CertsEducation } from '@/components/sections/certs-education';

/* ── Section map ─────────────────────────────────────────────────────────── */
const SECTION_TITLES = {
  about:      'About',
  skills:     'Skills',
  projects:   'Projects',
  experience: 'Experience',
  contact:    'Contact',
};

function SectionBody({ active }) {
  switch (active) {
    case 'about':
      return (
        <>
          <About />
          <CertsEducation />
        </>
      );
    case 'skills':
      return <Skills />;
    case 'projects':
      return <Projects />;
    case 'experience':
      return <Experience />;
    case 'contact':
      return <Contact />;
    default:
      return null;
  }
}

/* ── SectionPanel ────────────────────────────────────────────────────────── */
export function SectionPanel({ active, onClose }) {
  const prefersReducedMotion = useReducedMotion();
  const isOpen = Boolean(active);

  /* Esc key closes */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /* Lock body scroll when panel is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const panelVariants = prefersReducedMotion
    ? { open: { x: 0 }, closed: { x: '100%' } }
    : {
        open:   { x: 0,      transition: { type: 'spring', stiffness: 340, damping: 36 } },
        closed: { x: '100%', transition: { type: 'spring', stiffness: 340, damping: 36 } },
      };

  const backdropVariants = prefersReducedMotion
    ? { open: { opacity: 1 }, closed: { opacity: 0 } }
    : {
        open:   { opacity: 1, transition: { duration: 0.22 } },
        closed: { opacity: 0, transition: { duration: 0.18 } },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimmed backdrop */}
          <motion.div
            key="backdrop"
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              background: 'rgba(2,2,2,0.72)',
              cursor: 'pointer',
            }}
          />

          {/* Glass panel */}
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={SECTION_TITLES[active] ?? 'Section panel'}
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              height: '100%',
              width: '100%',
              maxWidth: '680px',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(2,2,2,0.92)',
              borderLeft: '1px solid rgba(178,213,229,0.14)',
              boxShadow: '0 0 80px rgba(178,213,229,0.07), -4px 0 32px rgba(0,0,0,0.8)',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
            }}
          >
            {/* Scanlines texture overlay */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(178,213,229,0.015) 2px, rgba(178,213,229,0.015) 4px)',
                zIndex: 0,
              }}
            />

            {/* Panel header */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(178,213,229,0.1)',
                background: 'rgba(2,2,2,0.95)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-jetbrains-mono, monospace)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(178,213,229,0.7)',
                }}
              >
                career-os://{SECTION_TITLES[active]?.toLowerCase() ?? active}
              </span>

              <button
                onClick={onClose}
                aria-label="Close panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid rgba(178,213,229,0.15)',
                  background: 'transparent',
                  color: 'rgba(178,213,229,0.6)',
                  cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#eaf6fb';
                  e.currentTarget.style.borderColor = 'rgba(178,213,229,0.45)';
                  e.currentTarget.style.background = 'rgba(178,213,229,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(178,213,229,0.6)';
                  e.currentTarget.style.borderColor = 'rgba(178,213,229,0.15)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={15} strokeWidth={1.8} />
              </button>
            </div>

            {/* Panel content */}
            <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
              <SectionBody active={active} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default SectionPanel;
