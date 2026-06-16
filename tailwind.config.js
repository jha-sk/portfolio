/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/lib/**/*.{js,jsx}',
  ],
  theme: {
    // Responsive breakpoint contract (UI-SPEC § Responsive Baseline).
    screens: {
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    container: {
      center: true,
      // Horizontal page gutter: 16px mobile / 24px tablet / 32px desktop.
      padding: {
        DEFAULT: '16px',
        md: '24px',
        lg: '32px',
      },
    },
    extend: {
      // All values resolve to the CSS custom properties declared once in globals.css.
      colors: {
        // Core dichromatic tokens
        background: 'var(--bg)',
        fg:         'var(--fg)',
        fg2:        'var(--fg-2)',
        fg3:        'var(--fg-3)',
        line:       'var(--line)',
        'line-strong': 'var(--line-strong)',

        // shadcn-compatible aliases (so shadcn primitives work out of the box)
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT:    'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT:    'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT:    'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT:    'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        border:  'var(--border)',
        input:   'var(--input)',
        ring:    'var(--ring)',
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT:    'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
      },
      boxShadow: {
        glow:  'var(--glow)',
        panel: 'var(--panel-shadow)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      maxWidth: {
        // 1200px content container (UI-SPEC § Spacing Scale).
        content: '1200px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // 4 type sizes
        body:    ['16px', { lineHeight: '1.5' }],
        label:   ['14px', { lineHeight: '1.4' }],
        heading: ['20px', { lineHeight: '1.3' }],
        display: ['28px', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
};
