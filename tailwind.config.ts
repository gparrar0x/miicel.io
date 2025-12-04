import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'media', // Use @media (prefers-color-scheme: dark) instead of class
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Clean Modern Palette (Kreosis-inspired)
        'clean-black': '#000000',
        'clean-gray': '#6B7280',
        'clean-light': '#F9FAFB',
        'clean-white': '#FFFFFF',
        'clean-border': '#E5E7EB',
        'clean-accent': '#111827',
        // Keep legacy for compatibility
        noir: '#0F0F0F',
        charcoal: '#1A1A1A',
        slate: '#2D2D2D',
        stone: '#F5F5F5',
        alabaster: '#FAFAFA',
        gold: '#B8860B',
        'gold-light': '#D4AF37',
        'gold-dark': '#8B6508',
        emerald: '#2D5F4F',
        coral: '#D97760',
        'slate-blue': '#4A5F7F',
        gallery: {
          black: '#1A1A1A',
          white: '#FFFFFF',
          gold: '#B8860B',
          'gold-hover': '#9A7209',
        }
      },
      boxShadow: {
        // Clean, modern shadows (Kreosis style)
        'clean': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'clean-md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'clean-lg': '0 10px 25px rgba(0, 0, 0, 0.1)',
        'clean-hover': '0 8px 20px rgba(0, 0, 0, 0.12)',
        // Keep elegant for reference
        'elegant': '0 2px 8px rgba(15, 15, 15, 0.12), 0 1px 2px rgba(15, 15, 15, 0.08)',
        'elegant-lg': '0 4px 16px rgba(15, 15, 15, 0.16), 0 2px 4px rgba(15, 15, 15, 0.08)',
        'elegant-hover': '0 8px 24px rgba(15, 15, 15, 0.20), 0 4px 8px rgba(15, 15, 15, 0.12)',
        'gold-glow': '0 0 0 3px rgba(184, 134, 11, 0.15)',
        brutal: '4px 4px 0px rgba(0,0,0,1)',
        'brutal-hover': '8px 8px 0px rgba(0,0,0,1)',
      },
      borderRadius: {
        'clean': '12px',
        'clean-lg': '16px',
        'clean-xl': '20px',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

export default config
