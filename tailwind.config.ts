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
        // Refined Gallery Palette
        noir: '#0F0F0F',
        charcoal: '#1A1A1A',
        slate: '#2D2D2D',
        stone: '#F5F5F5',
        alabaster: '#FAFAFA',
        gold: '#B8860B',
        'gold-light': '#D4AF37',
        'gold-dark': '#8B6508',
        emerald: '#2D5F4F',
        'emerald-light': '#4A8B6F',
        coral: '#D97760',
        'coral-light': '#E89080',
        'slate-blue': '#4A5F7F',
        'slate-blue-light': '#6B84A8',
        // Legacy gallery colors
        gallery: {
          black: '#1A1A1A',
          white: '#FFFFFF',
          gold: '#B8860B',
          'gold-hover': '#9A7209',
        }
      },
      boxShadow: {
        // Medium impact shadows - not brutal, not minimal
        'elegant': '0 2px 8px rgba(15, 15, 15, 0.12), 0 1px 2px rgba(15, 15, 15, 0.08)',
        'elegant-lg': '0 4px 16px rgba(15, 15, 15, 0.16), 0 2px 4px rgba(15, 15, 15, 0.08)',
        'elegant-hover': '0 8px 24px rgba(15, 15, 15, 0.20), 0 4px 8px rgba(15, 15, 15, 0.12)',
        'gold-glow': '0 0 0 3px rgba(184, 134, 11, 0.15)',
        // Keep brutal for reference
        brutal: '4px 4px 0px rgba(0,0,0,1)',
        'brutal-hover': '8px 8px 0px rgba(0,0,0,1)',
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
