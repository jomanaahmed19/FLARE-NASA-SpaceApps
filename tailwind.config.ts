import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        flare: {
          navy:      '#080e1a',
          dark:      '#0a0f1e',
          charcoal:  '#0f172a',
          graphite:  '#1e293b',
          slate:     '#334155',
          orange:    '#f97316',
          amber:     '#f59e0b',
          'amber-light': '#fbbf24',
          cyan:      '#06b6d4',
          'cyan-light': '#22d3ee',
          white:     '#f8fafc',
          muted:     '#94a3b8',
          'muted-dark': '#475569',
        },
      },
      fontFamily: {
        sans:          ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:          ['var(--font-mono)', 'ui-monospace', 'monospace'],
        display:       ['var(--font-space-grotesk)', 'sans-serif'],
        orbitron:      ['var(--font-orbitron)', 'sans-serif'],
        inter:         ['var(--font-inter)', 'sans-serif'],
        'space-grotesk': ['var(--font-space-grotesk)', 'sans-serif'],
      },
      animation: {
        'flame-flicker': 'flameFlicker 2.4s ease-in-out infinite alternate',
        'float':         'float 6s ease-in-out infinite',
        'fade-in-up':    'fadeInUp 0.8s ease-out forwards',
        'scan-line':     'scanLine 8s linear infinite',
        'glow-pulse':    'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        flameFlicker: {
          '0%':   { transform: 'scale(1) rotate(-1.5deg)',   filter: 'brightness(0.95) drop-shadow(0 0 8px rgba(249,115,22,0.5))' },
          '100%': { transform: 'scale(1.06) rotate(1.5deg)', filter: 'brightness(1.15) drop-shadow(0 0 16px rgba(251,191,36,0.6))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glowPulse: {
          '0%, 100%': { textShadow: '0 0 20px rgba(249,115,22,0.3), 0 0 40px rgba(249,115,22,0.15)' },
          '50%':      { textShadow: '0 0 30px rgba(249,115,22,0.7), 0 0 70px rgba(249,115,22,0.35), 0 0 100px rgba(251,191,36,0.15)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
