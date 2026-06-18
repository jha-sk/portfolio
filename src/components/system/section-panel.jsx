'use client';

/**
 * SectionPanel — genie/pop-out card overlay for 3D click-to-navigate.
 *
 * Instead of a side drawer, the section content scales out (genie effect) from
 * the exact point the user clicked — the 3D node, dock button, or palette item.
 * The trick: the card is centered in the viewport, and its transform-origin is
 * set to the click point via `calc(50% + clickX - 50vw)`, so a scale 0→1 makes
 * it emanate from there.
 *
 * Closed via backdrop click, Esc key, or the X button. Reduced-motion falls
 * back to a plain fade. Client-only (mounted inside CanvasOrFallback).
 */

import { useEffect, useCallback, useRef, useState } from 'react';
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

  // Track the most recent pointer-down position — the genie origin.
  const originRef = useRef(null);
  const [origin, setOrigin] = useState(null);

  useEffect(() => {
    const onDown = (e) => {
      originRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointerdown', onDown, true);
    return () => window.removeEventListener('pointerdown', onDown, true);
  }, []);

  // Snapshot the origin when the panel opens (default: viewport center).
  useEffect(() => {
    if (isOpen) {
      setOrigin(
        originRef.current ?? {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        }
      );
    }
  }, [isOpen]);

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
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // transform-origin = click point, expressed relative to the centered card.
  const transformOrigin = origin
    ? `calc(50% + ${origin.x}px - 50vw) calc(50% + ${origin.y}px - 50vh)`
    : '50% 50%';

  const cardMotion = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.18 },
      }
    : {
        initial: { opacity: 0, scale: 0.06 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.04 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimmed backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              background: 'rgba(2,2,2,0.72)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              cursor: 'pointer',
            }}
          />

          {/* Centering layer — card emanates from the click point */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              pointerEvents: 'none',
            }}
          >
            <motion.aside
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label={SECTION_TITLES[active] ?? 'Section panel'}
              {...cardMotion}
              style={{
                transformOrigin,
                pointerEvents: 'auto',
                width: '100%',
                maxWidth: '720px',
                maxHeight: '86vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '18px',
                overflow: 'hidden',
                background: 'rgba(8,14,18,0.62)',
                backdropFilter: 'blur(30px) saturate(150%)',
                WebkitBackdropFilter: 'blur(30px) saturate(150%)',
                border: '1px solid rgba(178,213,229,0.18)',
                boxShadow:
                  '0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(178,213,229,0.04), inset 0 1px 0 rgba(178,213,229,0.12)',
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

              {/* Header */}
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(178,213,229,0.12)',
                  background:
                    'linear-gradient(180deg, rgba(178,213,229,0.05), rgba(178,213,229,0.01))',
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
                  sourabh-jha://{SECTION_TITLES[active]?.toLowerCase() ?? active}
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
                    borderRadius: '8px',
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

              {/* Content */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  flex: 1,
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                }}
              >
                <SectionBody active={active} />
              </div>
            </motion.aside>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SectionPanel;
