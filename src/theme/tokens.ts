/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Aura Luxe "Warm Premium + Modern AI" Design Tokens
 */

export const tokens = {
  colors: {
    bg: {
      primary: '#FAF8F5',       // Soft Ivory / Warm White
      surface: '#FFFFFF',       // Pure Crisp White
      surfaceWarm: '#F5EFEB',   // Warm Tint
      surfaceGlass: 'rgba(255, 255, 255, 0.78)',
      glassDark: 'rgba(30, 36, 51, 0.88)',
      canvasDark: '#1E2433',    // Deep Navy / Charcoal
      darkSurface: '#181E2B',
    },
    text: {
      primary: '#1E2433',       // Deep Navy / Charcoal (WCAG AA 12:1 on #FAF8F5)
      secondary: '#566176',     // Slate Medium Gray
      muted: '#8491A5',         // Soft Gray Muted
      white: '#FFFFFF',
      onAccent: '#FFFFFF',
    },
    accent: {
      primary: '#D66A78',       // Rose / Coral / Rose-Gold
      primaryHover: '#C55866',
      primarySubtle: '#FDF2F3',
      primaryBorder: 'rgba(214, 106, 120, 0.35)',
      gold: '#C89B53',          // Soft Gold
      goldHover: '#B88942',
      goldSubtle: '#FAF4EB',
      goldBorder: 'rgba(200, 155, 83, 0.35)',
    },
    border: {
      warm: 'rgba(226, 220, 212, 0.75)',
      warmSubtle: '#EAE5DF',
      glass: 'rgba(255, 255, 255, 0.65)',
      focus: '#D66A78',
      dark: 'rgba(255, 255, 255, 0.12)',
    },
    state: {
      success: '#059669',
      successSubtle: '#ECFDF5',
      successBorder: '#A7F3D0',
      warning: '#D97706',
      warningSubtle: '#FFFBEB',
      warningBorder: '#FDE68A',
      error: '#DC2626',
      errorSubtle: '#FEF2F2',
      errorBorder: '#FECACA',
      info: '#2563EB',
      infoSubtle: '#EFF6FF',
      infoBorder: '#BFDBFE',
    },
  },

  typography: {
    fontFamily: {
      serif: "'Playfair Display', Georgia, serif",
      sans: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.65',
    },
  },

  spacing: {
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
  },

  radius: {
    none: '0',
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  shadows: {
    xs: '0 1px 2px 0 rgba(30, 36, 51, 0.04)',
    sm: '0 2px 8px -1px rgba(30, 36, 51, 0.05)',
    md: '0 4px 20px -2px rgba(30, 36, 51, 0.05), 0 2px 6px -1px rgba(30, 36, 51, 0.02)',
    lg: '0 10px 28px -4px rgba(30, 36, 51, 0.08), 0 4px 12px -2px rgba(30, 36, 51, 0.03)',
    xl: '0 20px 40px -8px rgba(30, 36, 51, 0.12)',
    glass: '0 8px 32px 0 rgba(30, 36, 51, 0.06)',
    inner: 'inset 0 2px 4px 0 rgba(30, 36, 51, 0.04)',
  },

  zIndex: {
    base: 0,
    dropdown: 50,
    sticky: 40,
    drawer: 90,
    modal: 100,
    popover: 110,
    toast: 120,
    tooltip: 130,
  },

  motion: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const;

export type ThemeTokens = typeof tokens;
