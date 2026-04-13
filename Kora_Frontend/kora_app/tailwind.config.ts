import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(220, 20%, 7%)',
        foreground: 'hsl(40, 20%, 95%)',
        card: {
          DEFAULT: 'hsl(220, 18%, 10%)',
          foreground: 'hsl(40, 20%, 95%)',
        },
        primary: {
          DEFAULT: 'hsl(12, 80%, 65%)',
          foreground: 'hsl(220, 20%, 7%)',
        },
        secondary: {
          DEFAULT: 'hsl(220, 15%, 15%)',
          foreground: 'hsl(40, 15%, 80%)',
        },
        muted: {
          DEFAULT: 'hsl(220, 15%, 13%)',
          foreground: 'hsl(220, 10%, 50%)',
        },
        accent: {
          DEFAULT: 'hsl(12, 80%, 65%)',
          foreground: 'hsl(220, 20%, 7%)',
        },
        destructive: {
          DEFAULT: 'hsl(0, 72%, 51%)',
          foreground: 'hsl(40, 20%, 95%)',
        },
        border: 'hsl(220, 15%, 16%)',
        input: 'hsl(220, 15%, 16%)',
        ring: 'hsl(12, 80%, 65%)',
        kora: {
          glow: 'hsl(12, 80%, 65%)',
          surface: 'hsl(220, 16%, 12%)',
          'surface-hover': 'hsl(220, 16%, 15%)',
          'text-dim': 'hsl(220, 10%, 40%)',
          success: 'hsl(160, 60%, 45%)',
          warning: 'hsl(38, 92%, 60%)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUpSm: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpMd: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpLg: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up-sm': 'slideUpSm 300ms ease-out',
        'slide-up-md': 'slideUpMd 400ms ease-out',
        'slide-up-lg': 'slideUpLg 500ms ease-out',
        'scale-in': 'scaleIn 300ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
