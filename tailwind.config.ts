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
        gallery: {
          black: '#1A1A1A',
          white: '#FFFFFF',
          gold: '#B8860B',
          'gold-hover': '#9A7209',
        }
      },
      boxShadow: {
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
