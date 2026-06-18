'use client';

/**
 * CommandTerminal — a real interactive shell for the Sourabh Jha portfolio.
 *
 * A working prompt: visitors type commands (whoami, about, skills, projects,
 * experience, contact, ls, open <section>, resume, github, linkedin, clear,
 * sudo hire-me) and get live responses sourced from the real resume data.
 * `open <section>` drives the same section navigation as the 3D scene.
 *
 * Up/Down recalls command history, Enter runs, Esc / `exit` closes. Frosted
 * glass, mono, strictly dichromatic. Opened via ⌘K palette or the backtick key.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { identity } from '@/data/identity';
import { about } from '@/data/about';
import { skills } from '@/data/skills';
import { projects } from '@/data/projects';
import { experience } from '@/data/experience';
import { links } from '@/data/links';

const SECTIONS = ['about', 'skills', 'projects', 'experience', 'contact'];
const PROMPT = 'visitor@sourabh-jha:~$';

const BANNER = [
  { t: 'sys', v: `${identity.name} — portfolio shell · v1.0` },
  { t: 'sys', v: "Type 'help' for commands · 'exit' to close." },
];

const HELP = [
  'available commands',
  '  whoami          identity',
  '  about           bio',
  '  skills          tech stack',
  '  projects        selected work',
  '  experience      work history',
  '  contact         how to reach me',
  '  ls              list sections',
  '  open <section>  jump to about | skills | projects | experience | contact',
  '  resume          download résumé',
  '  github          open GitHub',
  '  linkedin        open LinkedIn',
  '  clear           clear the screen',
  '  sudo hire-me    :)',
];

export function CommandTerminal({ open, onClose, onSelect }) {
  const [lines, setLines] = useState(BANNER);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [hIdx, setHIdx] = useState(-1);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const print = useCallback((arr, type = 'out') => {
    setLines((prev) => [...prev, ...arr.map((v) => ({ t: type, v }))]);
  }, []);

  const run = useCallback(
    (raw) => {
      const cmd = raw.trim();
      setLines((prev) => [...prev, { t: 'in', v: `${PROMPT} ${cmd}` }]);
      if (!cmd) return;
      setHistory((h) => [cmd, ...h].slice(0, 50));

      const [name, ...rest] = cmd.split(/\s+/);
      const arg = rest.join(' ').toLowerCase();
      const lc = name.toLowerCase();

      switch (lc) {
        case 'help':
        case 'h':
        case '?':
          print(HELP);
          break;
        case 'whoami':
          print([identity.name, `${identity.title}`, identity.tagline]);
          break;
        case 'about':
          print(about);
          break;
        case 'skills':
          print(skills.map((s) => `${s.category}: ${s.items.join(', ')}`));
          break;
        case 'projects':
          print(projects.map((p, i) => `${String(i + 1).padStart(2, '0')}  ${p.name} — ${p.summary}`));
          break;
        case 'experience':
        case 'exp': {
          const e = experience[0];
          print([`${e.role} @ ${e.company}`, e.period, ...e.bullets.slice(0, 3).map((b) => `· ${b}`)]);
          break;
        }
        case 'contact':
          print([`email     ${links.email}`, `github    ${links.github}`, `linkedin  ${links.linkedin}`]);
          break;
        case 'ls':
        case 'dir':
          print([SECTIONS.map((s) => `${s}/`).join('   ')]);
          break;
        case 'open':
        case 'cd':
        case 'goto':
          if (SECTIONS.includes(arg)) {
            print([`opening ${arg}…`], 'sys');
            setTimeout(() => { onSelect?.(arg); onClose?.(); }, 350);
          } else {
            print([`open: unknown section '${arg || ''}'. try: ${SECTIONS.join(', ')}`]);
          }
          break;
        case 'resume':
        case 'cv': {
          print(['downloading résumé…'], 'sys');
          const a = document.createElement('a');
          a.href = links.resume; a.download = ''; a.click();
          break;
        }
        case 'github':
          print(['opening GitHub…'], 'sys');
          window.open(links.github, '_blank', 'noopener');
          break;
        case 'linkedin':
          print(['opening LinkedIn…'], 'sys');
          window.open(links.linkedin, '_blank', 'noopener');
          break;
        case 'email':
          window.location.href = `mailto:${links.email}`;
          print([`→ ${links.email}`], 'sys');
          break;
        case 'clear':
        case 'cls':
          setLines([]);
          break;
        case 'sudo':
          if (arg === 'hire-me' || arg === 'hire me') {
            print(['Permission granted. ✓', `→ ${links.email}`, "Let's build something."], 'sys');
          } else {
            print([`sudo: ${arg || 'command'}: not permitted. try 'sudo hire-me'.`]);
          }
          break;
        case 'echo':
          print([rest.join(' ')]);
          break;
        case 'exit':
        case 'quit':
        case 'q':
          onClose?.();
          break;
        default:
          print([`command not found: ${lc}. type 'help'.`]);
      }
    },
    [print, onSelect, onClose]
  );

  // Reset to banner on open + focus the input.
  useEffect(() => {
    if (open) {
      setLines(BANNER);
      setInput('');
      setHIdx(-1);
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  // Keep scrolled to the latest line.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
      setHIdx(-1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHIdx((i) => {
        const ni = Math.min(i + 1, history.length - 1);
        if (history[ni] !== undefined) setInput(history[ni]);
        return ni;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHIdx((i) => {
        const ni = Math.max(i - 1, -1);
        setInput(ni === -1 ? '' : history[ni]);
        return ni;
      });
    }
  };

  const color = (t) =>
    t === 'in' ? '#bfe6f5' : t === 'sys' ? 'rgba(178,213,229,0.55)' : 'rgba(178,213,229,0.82)';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="term"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', background: 'rgba(2,2,2,0.6)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => inputRef.current?.focus()}
            role="dialog"
            aria-label="Terminal"
            style={{
              width: 'min(94vw, 680px)',
              height: 'min(70vh, 520px)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '14px',
              overflow: 'hidden',
              background: 'rgba(8,14,18,0.82)',
              backdropFilter: 'blur(26px) saturate(150%)',
              WebkitBackdropFilter: 'blur(26px) saturate(150%)',
              border: '1px solid rgba(178,213,229,0.18)',
              boxShadow: '0 30px 90px rgba(0,0,0,0.7), inset 0 1px 0 rgba(178,213,229,0.12)',
              fontFamily: 'var(--font-jetbrains-mono, monospace)',
            }}
          >
            {/* Title bar */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 38,
                borderBottom: '1px solid rgba(178,213,229,0.1)',
                background: 'linear-gradient(180deg, rgba(178,213,229,0.06), rgba(178,213,229,0.01))',
              }}
            >
              {['#cfe7f2', '#9fd8ea', '#6fa9be'].map((c, i) => (
                <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c, boxShadow: `0 0 5px ${c}55` }} />
              ))}
              <span style={{ flex: 1, textAlign: 'center', fontSize: 11, letterSpacing: '0.12em', color: 'rgba(178,213,229,0.6)' }}>
                sourabh-jha — zsh
              </span>
              <span style={{ width: 33 }} />
            </div>

            {/* Output */}
            <div
              ref={scrollRef}
              style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', fontSize: 12.5, lineHeight: 1.65 }}
            >
              {lines.map((l, i) => (
                <div key={i} style={{ color: color(l.t), whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {l.v}
                </div>
              ))}

              {/* Input line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ color: '#7fd4ee', flexShrink: 0 }}>{PROMPT}</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  spellCheck="false"
                  autoComplete="off"
                  aria-label="Terminal input"
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: '#eaf6fb', fontFamily: 'inherit', fontSize: 12.5, caretColor: '#7fd4ee',
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CommandTerminal;
