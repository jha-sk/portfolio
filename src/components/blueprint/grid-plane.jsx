/**
 * GridPlane — aria-hidden decorative blueprint grid.
 *
 * SERVER component (no hooks). Uses the .grid-plane utility from globals.css.
 * Masked with a radial gradient so the grid fades at edges — uses CSS keyword
 * colours (black / transparent), NOT hex, so the mask value stays token-safe.
 *
 * When `perspective` is true the grid is tilted forward like a floor plane,
 * with a bottom-up linear mask so the near edge fades out.
 */
import { cn } from '@/lib/utils';

const FLAT_MASK =
  'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)';

const PERSPECTIVE_MASK =
  'linear-gradient(to top, transparent 0%, black 40%, black 100%)';

export function GridPlane({ perspective = false, className }) {
  const maskStyle = perspective
    ? {
        maskImage: PERSPECTIVE_MASK,
        WebkitMaskImage: PERSPECTIVE_MASK,
        transform: 'perspective(620px) rotateX(58deg) scale(1.4)',
        transformOrigin: 'center 78%',
      }
    : {
        maskImage: FLAT_MASK,
        WebkitMaskImage: FLAT_MASK,
      };

  return (
    <div
      aria-hidden="true"
      className={cn('grid-plane pointer-events-none', className)}
      style={maskStyle}
    />
  );
}

export default GridPlane;
