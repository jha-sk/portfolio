'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Home, Activity, Cpu, History, FolderGit2, Mail } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'top', label: 'Home', icon: Home, href: null },
  { id: 'snapshot', label: 'Snapshot', icon: Activity, href: '#snapshot' },
  { id: 'skills', label: 'Skills', icon: Cpu, href: '#skills' },
  { id: 'experience', label: 'Experience', icon: History, href: '#experience' },
  { id: 'projects', label: 'Projects', icon: FolderGit2, href: '#projects' },
  { id: 'contact', label: 'Contact', icon: Mail, href: '#contact' },
];

const SECTION_IDS = NAV_ITEMS.filter((i) => i.href).map((i) => i.id);

export function Dock() {
  const [activeSection, setActiveSection] = useState('top');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Track the ratio for each section so we can pick the highest
    const ratios = {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios[entry.target.id] = entry.intersectionRatio;
        });

        // Find the section with the highest intersection ratio
        let bestId = null;
        let bestRatio = 0;
        SECTION_IDS.forEach((id) => {
          const r = ratios[id] ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        });

        if (bestRatio > 0 && bestId) {
          setActiveSection(bestId);
        } else {
          // No sections in view — treat as top
          setActiveSection('top');
        }
      },
      { threshold: [0, 0.1, 0.3, 0.5, 0.7, 1.0] },
    );

    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  function handleNav(e, item) {
    e.preventDefault();
    if (!item.href) {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
      return;
    }
    if (typeof document !== 'undefined') {
      const el = document.getElementById(item.id);
      if (el) {
        el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    }
  }

  return (
    <nav aria-label="Page sections" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 rounded-full border border-line bg-background/80 px-2 py-2 shadow-panel backdrop-blur-sm">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === 'top' ? activeSection === 'top' : activeSection === item.id;

          return (
            <a
              key={item.id}
              href={item.href ?? '#'}
              aria-label={item.label}
              title={item.label}
              onClick={(e) => handleNav(e, item)}
              className={`relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive ? 'text-fg' : 'text-fg3 hover:text-fg'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              {isActive && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-fg shadow-glow"
                  aria-hidden="true"
                />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export default Dock;
