'use client';

/**
 * CommandPalette — Linear-style ⌘K / Ctrl+K palette for the Sourabh Jha portfolio.
 *
 * Opens on ⌘K / Ctrl+K (handled by the parent) and lets visitors jump to any
 * section, fire the request trace, grab the résumé, copy the email, or open
 * social links — all without touching the 3D scene.
 *
 * Dichromatic frosted glass, full keyboard nav (↑/↓/Enter/Esc), framer-motion
 * enter/exit. Token contract: ice-blue rgba/hex inline.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Boxes, FolderGit2, Briefcase, Send,
  Activity, Download, Copy, Github, Linkedin, Check, Play, TerminalSquare, Gauge,
} from 'lucide-react';
import { links } from '@/data/links';

const GLASS = {
  background: 'rgba(10,18,23,0.72)',
  backdropFilter: 'blur(28px) saturate(150%)',
  WebkitBackdropFilter: 'blur(28px) saturate(150%)',
  border: '1px solid rgba(178,213,229,0.18)',
  boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(178,213,229,0.10)',
};

export function CommandPalette({ open, onClose, onSelect, onTrace, onTour, onTerminal, onSetQuality }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const close = useCallback(() => {
    onClose?.();
  }, [onClose]);

  /* Action catalog — built once (depends only on callbacks). */
  const actions = useMemo(() => [
    { id: 'about',      group: 'Navigate', label: 'Go to About',       Icon: Compass,    run: () => onSelect?.('about') },
    { id: 'skills',     group: 'Navigate', label: 'Go to Skills',      Icon: Boxes,      run: () => onSelect?.('skills') },
    { id: 'projects',   group: 'Navigate', label: 'Go to Projects',    Icon: FolderGit2, run: () => onSelect?.('projects') },
    { id: 'experience', group: 'Navigate', label: 'Go to Experience',  Icon: Briefcase,  run: () => onSelect?.('experience') },
    { id: 'contact',    group: 'Navigate', label: 'Go to Contact',     Icon: Send,       run: () => onSelect?.('contact') },
    { id: 'terminal',   group: 'System',   label: 'Open terminal',     Icon: TerminalSquare, run: () => onTerminal?.() },
    { id: 'tour',       group: 'System',   label: 'Play guided tour',  Icon: Play,       run: () => onTour?.() },
    { id: 'trace',      group: 'System',   label: 'Trace a request',   Icon: Activity,   run: () => onTrace?.(), keepOpen: false },
    { id: 'q-auto', group: 'Quality', label: 'Quality: Auto (detect)', Icon: Gauge, run: () => onSetQuality?.('auto') },
    { id: 'q-high', group: 'Quality', label: 'Quality: High (full 3D)', Icon: Gauge, run: () => onSetQuality?.('high') },
    { id: 'q-low',  group: 'Quality', label: 'Quality: Low (static)',   Icon: Gauge, run: () => onSetQuality?.('low') },
    { id: 'resume',     group: 'System',   label: 'Download résumé',   Icon: Download,   run: () => { const a = document.createElement('a'); a.href = links.resume; a.download = ''; a.click(); } },
    { id: 'email',      group: 'Contact',  label: 'Copy email',        Icon: Copy,       run: () => { navigator.clipboard?.writeText(links.email); }, copy: true },
    { id: 'github',     group: 'Contact',  label: 'Open GitHub',       Icon: Github,     run: () => window.open(links.github, '_blank', 'noopener') },
    { id: 'linkedin',   group: 'Contact',  label: 'Open LinkedIn',     Icon: Linkedin,   run: () => window.open(links.linkedin, '_blank', 'noopener') },
  ], [onSelect, onTrace, onTour, onTerminal, onSetQuality]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => a.label.toLowerCase().includes(q) || a.group.toLowerCase().includes(q));
  }, [actions, query]);

  /* Reset transient state whenever the palette opens. */
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setCopied(false);
      // focus the input after mount
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  const runAction = useCallback((action) => {
    if (!action) return;
    action.run?.();
    if (action.copy) {
      setCopied(true);
      setTimeout(() => { setCopied(false); close(); }, 700);
      return;
    }
    close();
  }, [close]);

  /* Keyboard nav within the palette. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, filtered.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); runAction(filtered[activeIndex]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, activeIndex, runAction, close]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cmdk"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: 'min(18vh, 160px)',
            background: 'rgba(2,2,2,0.55)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Command palette"
            style={{ ...GLASS, width: 'min(92vw, 560px)', borderRadius: '16px', overflow: 'hidden' }}
          >
            {/* search row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid rgba(178,213,229,0.12)' }}>
              <Compass size={16} color="rgba(178,213,229,0.6)" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search…"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#eaf6fb', fontFamily: 'var(--font-jetbrains-mono, monospace)',
                  fontSize: 14, letterSpacing: '0.02em',
                }}
              />
              <kbd style={{
                fontFamily: 'var(--font-jetbrains-mono, monospace)', fontSize: 10,
                color: 'rgba(178,213,229,0.5)', border: '1px solid rgba(178,213,229,0.2)',
                borderRadius: 6, padding: '2px 6px',
              }}>ESC</kbd>
            </div>

            {/* results */}
            <ul style={{ listStyle: 'none', margin: 0, padding: '6px', maxHeight: '46vh', overflowY: 'auto' }}>
              {filtered.length === 0 && (
                <li style={{ padding: '18px', textAlign: 'center', color: 'rgba(178,213,229,0.45)', fontFamily: 'var(--font-jetbrains-mono, monospace)', fontSize: 12 }}>
                  No matches
                </li>
              )}
              {filtered.map((a, i) => {
                const isActive = i === activeIndex;
                const justCopied = copied && a.copy;
                const Icon = justCopied ? Check : a.Icon;
                return (
                  <li key={a.id}>
                    <button
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => runAction(a)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                        padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: isActive ? 'rgba(178,213,229,0.12)' : 'transparent',
                        color: isActive ? '#eaf6fb' : 'rgba(178,213,229,0.75)',
                        textAlign: 'left', transition: 'background .12s, color .12s',
                      }}
                    >
                      <Icon size={16} color={isActive ? '#bfe6f5' : 'rgba(178,213,229,0.55)'} />
                      <span style={{ flex: 1, fontFamily: 'var(--font-jetbrains-mono, monospace)', fontSize: 13, letterSpacing: '0.02em' }}>
                        {justCopied ? 'Copied!' : a.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(178,213,229,0.4)' }}>
                        {a.group}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
