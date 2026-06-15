import * as React from 'react';

import { cn } from '@/lib/utils';

/*
 * shadcn "New York" button, authored in JavaScript (D-08/D-11) and trimmed to
 * the audited dependency set: it consumes only `cn` (clsx + tailwind-merge) and
 * token utilities — no @radix-ui/react-slot or class-variance-authority, so the
 * Phase-1 runtime stays exactly the nine audited packages. Variant/size styling
 * matches the New York preset and uses tokens only (no hard-coded hex, D-12).
 */

const baseClasses =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-label font-semibold transition-colors transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0';

const variantClasses = {
  default: 'bg-primary text-primary-foreground hover:shadow-glow hover:scale-[1.02]',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
  outline: 'border border-glass bg-glass text-foreground hover:shadow-glow',
  secondary: 'bg-secondary text-secondary-foreground hover:opacity-90',
  ghost: 'text-foreground hover:bg-secondary',
  link: 'text-primary underline-offset-4 hover:underline',
};

const sizeClasses = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-11 w-11',
};

export function buttonVariants({ variant = 'default', size = 'default', className } = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
