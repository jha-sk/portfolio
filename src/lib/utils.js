import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional class names and de-dupe conflicting Tailwind utilities.
 * Used by shadcn components and across the app so token utilities compose cleanly.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
