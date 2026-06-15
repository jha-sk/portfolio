'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

/**
 * Icon-only dark <-> light theme toggle (D-05 / UI-SPEC copy contract).
 *
 * Lucide Sun/Moon glyph, aria-label "Toggle theme", >=44x44px hit area
 * (size="icon" -> h-11 w-11). Consumes token utilities only (no hex).
 * Mounted-guarded so the rendered icon matches the resolved theme after
 * hydration without a mismatch flash.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {mounted && !isDark ? (
        <Moon className="h-5 w-5 text-primary" />
      ) : (
        <Sun className="h-5 w-5 text-primary" />
      )}
    </Button>
  );
}

export default ThemeToggle;
