import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'media', // Use @media (prefers-color-scheme: dark) instead of class
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
