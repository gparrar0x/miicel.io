/**
 * Gastronomy Template Theme Configuration
 *
 * Color palette and theme constants for food/gastronomy template.
 * Based on Aurora design specs (SKY_42_DESIGN_SPECS.md).
 *
 * Created: 2025-01-16 (SKY-42)
 */

export const GASTRONOMY_THEME = {
  primary: '#E63946', // Red (appetite trigger)
  accent: '#F4A261', // Orange (warmth)
  background: '#F8F9FA', // Light gray
  surface: '#FFFFFF', // White
  success: '#06D6A0', // Green (fresh)
  textPrimary: '#1F2937', // Gray-800
  textSecondary: '#6B7280', // Gray-500
}

/**
 * Badge configuration for food items
 */
export type BadgeType =
  | 'nuevo'
  | 'promo'
  | 'popular'
  | 'spicy-mild'
  | 'spicy-hot'
  | 'veggie'
  | 'vegan'
  | 'gluten-free'

export interface BadgeStyle {
  bg: string
  text: string
  icon: string
  label: string
}

export const BADGE_CONFIG: Record<BadgeType, BadgeStyle> = {
  nuevo: {
    bg: '#FEF3C7', // Yellow-100
    text: '#78350F', // Yellow-900
    icon: '🔥',
    label: 'Nuevo',
  },
  promo: {
    bg: '#FED7AA', // Orange-200
    text: '#7C2D12', // Orange-900
    icon: '💰',
    label: 'Promo',
  },
  popular: {
    bg: '#FFEDD5', // Orange-100
    text: '#9A3412', // Orange-800
    icon: '⭐',
    label: 'Popular',
  },
  'spicy-mild': {
    bg: '#FEF9C3', // Yellow-50
    text: '#713F12', // Yellow-800
    icon: '🌶️',
    label: 'Picante',
  },
  'spicy-hot': {
    bg: '#FEE2E2', // Red-100
    text: '#7F1D1D', // Red-900
    icon: '🌶️🌶️',
    label: 'Muy Picante',
  },
  veggie: {
    bg: '#DCFCE7', // Green-100
    text: '#14532D', // Green-900
    icon: '🥗',
    label: 'Vegetariano',
  },
  vegan: {
    bg: '#BBF7D0', // Green-200
    text: '#14532D', // Green-900
    icon: '🌱',
    label: 'Vegano',
  },
  'gluten-free': {
    bg: '#E0E7FF', // Indigo-100
    text: '#312E81', // Indigo-900
    icon: '🚫',
    label: 'Sin Gluten',
  },
}

/**
 * Generate CSS variables for gastronomy theme
 */
export function generateGastronomyCSSVars(overrides?: Partial<typeof GASTRONOMY_THEME>) {
  const theme = { ...GASTRONOMY_THEME, ...overrides }

  return {
    '--color-primary': theme.primary,
    '--color-accent': theme.accent,
    '--color-bg-base': theme.background,
    '--color-surface': theme.surface,
    '--color-success': theme.success,
    '--color-text-primary': theme.textPrimary,
    '--color-text-secondary': theme.textSecondary,
  }
}
