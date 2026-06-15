'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Career OS theme provider (D-04 / D-05).
 *
 * Wraps next-themes with the foundation config: class-based theme attribute,
 * dark-first default, and system-preference detection. next-themes injects the
 * pre-paint no-FOUC script and persists the choice to localStorage, so the
 * theme loads without a flash of the wrong theme and survives reload.
 */
export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
