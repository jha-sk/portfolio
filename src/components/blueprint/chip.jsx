import { cn } from '@/lib/utils';

/**
 * Chip — mono skill / stack label pill.
 *
 * SERVER component (no hooks). Ice-blue border + faint inner glow.
 * The inner-glow rgba is explicitly allowed here (derives from var(--fg))
 * per the design contract — it lives only in this primitive file.
 */
export function Chip({ children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-line px-2.5 py-1 font-mono text-[11px] tracking-wide text-fg',
        className,
      )}
      style={{ boxShadow: 'inset 0 0 12px rgba(178,213,229,0.06)' }}
    >
      {children}
    </span>
  );
}

export default Chip;
