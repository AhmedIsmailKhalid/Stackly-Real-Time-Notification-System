import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand ──
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a4bcfd',
          400: '#7b97fa',
          500: '#5b75f5',
          600: '#4355ea',
          700: '#3744d0',
          800: '#2f3aa8',
          900: '#2c3685',
          950: '#1a2050',
        },
        // ── Neutral (slate-based) ──
        surface: {
          0:   '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // ── Notification type colors ──
        notification: {
          mention:  '#5b75f5',  // brand blue
          comment:  '#0ea5e9',  // sky
          team:     '#10b981',  // emerald
          system:   '#f59e0b',  // amber
          assignment: '#8b5cf6', // violet
        },
        // ── Semantic ──
        success: '#10b981',
        warning: '#f59e0b',
        error:   '#ef4444',
        info:    '#0ea5e9',
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'notification': '0 4px 24px -4px rgba(91, 117, 245, 0.15)',
        'dropdown':     '0 8px 32px -8px rgba(15, 23, 42, 0.2)',
        'card':         '0 1px 3px 0 rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'slide-in-right':  'slideInRight 0.3s ease-out',
        'slide-in-top':    'slideInTop 0.25s ease-out',
        'fade-in':         'fadeIn 0.2s ease-out',
        'badge-pop':       'badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spin-slow':       'spin 2s linear infinite',
      },
      keyframes: {
        slideInRight: {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        slideInTop: {
          '0%':   { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        badgePop: {
          '0%':   { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;