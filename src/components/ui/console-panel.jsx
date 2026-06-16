import { cn } from '@/lib/utils';

/**
 * ConsolePanel — the universal window frame for every Career OS section.
 *
 * A server component (no hooks). Renders:
 *   - An outer wrapper with border, background, and panel shadow
 *   - A title bar: optional macOS traffic dots + mono uppercase label
 *   - A body with scanline overlay + children
 *
 * Token contract: all styling via Tailwind utility classes and CSS vars.
 * The only raw value here is the inner-glow rgba — explicitly allowed by the
 * design contract as it derives directly from var(--fg).
 */
export function ConsolePanel({
  title,
  dots = false,
  className,
  bodyClassName,
  children,
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-line bg-background shadow-panel',
        className,
      )}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        {dots && (
          <>
            <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
          </>
        )}
        <span className="font-mono text-label uppercase tracking-[0.18em] text-fg3">
          {title}
        </span>
      </div>

      {/* Body */}
      <div
        className={cn('relative p-6 md:p-8', bodyClassName)}
        style={{ boxShadow: 'inset 0 1px 0 rgba(178,213,229,0.06)' }}
      >
        {/* Scanline texture overlay */}
        <span
          aria-hidden="true"
          className="scanlines pointer-events-none absolute inset-0"
        />
        {/* Content above overlay */}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

export default ConsolePanel;
