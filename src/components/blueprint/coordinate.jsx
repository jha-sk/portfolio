import { cn } from '@/lib/utils';

/**
 * Coordinate — blueprint coordinate tag (e.g. `[ 042 · 117 ]`).
 *
 * SERVER component (no hooks). Renders children in muted mono uppercase.
 */
export function Coordinate({ children, className }) {
  return (
    <span
      className={cn(
        'font-mono text-[11px] uppercase tracking-[0.2em] text-fg3',
        className,
      )}
    >
      {children}
    </span>
  );
}

export default Coordinate;
