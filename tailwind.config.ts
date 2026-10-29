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
        brand: {
          red: '#E31C1C',
          'red-dark': '#B01515',
          'red-light': '#FF2D2D',
          'red-glow': 'rgba(227, 28, 28, 0.4)',
          black: '#0A0A0A',
          'black-soft': '#111111',
          'black-card': '#141414',
          'black-border': '#1E1E1E',
          white: '#FFFFFF',
          'white-muted': '#A0A0A0',
          'white-dim': '#D0D0D0',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'red-gradient': 'linear-gradient(135deg, #E31C1C 0%, #B01515 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
        'hero-gradient': 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 60%, rgba(10,10,10,1) 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(227,28,28,0.1) 0%, rgba(10,10,10,0) 100%)',
        'glow-radial': 'radial-gradient(ellipse at center, rgba(227,28,28,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'red-glow': '0 0 30px rgba(227, 28, 28, 0.5), 0 0 60px rgba(227, 28, 28, 0.2)',
        'red-glow-sm': '0 0 15px rgba(227, 28, 28, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(227, 28, 28, 0.3), 0 4px 24px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-red': 'pulse-red 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(227, 28, 28, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(227, 28, 28, 0.8), 0 0 80px rgba(227, 28, 28, 0.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
export default config
