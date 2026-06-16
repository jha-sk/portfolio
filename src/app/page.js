import { Hero } from '@/components/hero/hero';

/*
 * Home route — leads with the Career OS Hero.
 *
 * The boot overlay (mounted in layout.js) wipes away to reveal the full-viewport
 * Hero. The #snapshot section lands in the next task (Phase 2, plan 02). The
 * scroll-cue's window.scrollBy fallback handles the missing target gracefully.
 */
export default function HomePage() {
  return <Hero />;
}
