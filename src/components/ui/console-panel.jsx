import { cn } from '@/lib/utils';

/**
 * ConsolePanel — Mac/Ghostty-style terminal window frame for every section.
 *
 * Server component (no hooks). Renders:
 *   - A rounded, frosted-glass window (backdrop blur + saturate, ice border,
 *     soft drop shadow + inner top highlight) — sits over the 3D scene / panel.
 *   - A title bar with glossy traffic-light dots (left) + a centered title.
 *   - A body with a faint scanline overlay + children.
 *
 * Dichromatic: traffic dots are three ice-blue shades (no off-palette hues);
 * the only raw values are glass rgba + a white specular highlight on the dots,
 * both standard glassmorphism, derived from var(--fg).
 */

const GLASS = {
  background: 'rgba(12,20,26,0.55)',
  backdropFilter: 'blur(26px) saturate(150%)',
  WebkitBackdropFilter: 'blur(26px) saturate(150%)',
};

// Ice-toned "traffic lights" (light → mid → deep) — keeps the mac arrangement
// while staying strictly dichromatic.
const DOT_COLORS = ['#cfe7f2', '#9fd8ea', '#6fa9be'];

export function ConsolePanel({
  title,
  dots = false,
  className,
  bodyClassName,
  children,
}) {
  return (
    <div
      className={cn('overflow-hidden', className)}
      style={{
        ...GLASS,
        borderRadius: '16px',
        border: '1px solid rgba(178,213,229,0.16)',
        boxShadow:
          '0 24px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(178,213,229,0.03), inset 0 1px 0 rgba(178,213,229,0.12)',
      }}
    >
      {/* Title bar */}
      <div
        className="relative flex items-center gap-2 px-4"
        style={{
          height: '42px',
          borderBottom: '1px solid rgba(178,213,229,0.10)',
          background:
            'linear-gradient(180deg, rgba(178,213,229,0.06), rgba(178,213,229,0.012))',
        }}
      >
        {dots && (
          <div className="flex items-center gap-2">
            {DOT_COLORS.map((c, i) => (
              <span
                key={i}
                aria-hidden="true"
                style={{
                  height: 12,
                  width: 12,
                  borderRadius: '9999px',
                  background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.6), ${c} 62%)`,
                  boxShadow: `inset 0 0 0 0.5px rgba(0,0,0,0.25), 0 0 6px ${c}55`,
                }}
              />
            ))}
          </div>
        )}

        {/* Centered window title (mac style) */}
        {title && (
          <span
            className="font-mono"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              color: 'rgba(178,213,229,0.6)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {title}
          </span>
        )}
      </div>

      {/* Body */}
      <div className={cn('relative p-6 md:p-8', bodyClassName)}>
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
