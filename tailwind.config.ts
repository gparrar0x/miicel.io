import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'media',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Miicel Design System
        'mii': {
          // Core
          'white': '#FFFFFF',
          'black': '#1A1A1A',
          // Primary action
          'blue': '#2563EB',
          'blue-hover': '#1D4ED8',
          // Grays
          'gray-50': '#F9FAFB',
          'gray-100': '#F3F4F6',
          'gray-200': '#E5E7EB',
          'gray-400': '#9CA3AF',
          'gray-500': '#6B7280',
          'gray-700': '#374151',
          'gray-900': '#111827',
          // Status
          'success': '#10B981',
          'error': '#EF4444',
          'warning': '#F59E0B',
        },
        // Legacy (keep for storefront compatibility)
        gallery: {
          black: '#1A1A1A',
          white: '#FFFFFF',
          gold: '#B8860B',
          'gold-hover': '#9A7209',
        }
      },
      boxShadow: {
        // Miicel shadows
        'mii': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'mii-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'mii-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'mii': '8px',
        'mii-sm': '4px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Miicel typography
        'mii-h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'mii-h2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'mii-h3': ['16px', { lineHeight: '1.4', fontWeight: '500' }],
        'mii-label': ['14px', { lineHeight: '1.4', fontWeight: '600' }],
        'mii-body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'mii-small': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        'mii-page': '24px',
        'mii-card': '20px',
        'mii-gap': '16px',
      },
      maxWidth: {
        'mii-content': '1400px',
      },
      width: {
        'mii-sidebar': '200px',
      }
    },
  },
  plugins: [],
}

export default config
