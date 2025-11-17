/**
 * Theme Configuration Types for Multi-Tenant ThemeProvider
 *
 * Defines the contract between backend (theme_overrides JSONB) and frontend.
 * Used by Pixel's ThemeProvider to apply tenant-specific customization.
 *
 * Created: 2025-11-16 (Migration 015)
 * Related: /supabase/migrations/015_add_tenant_template_theme.sql
 */

/**
 * Template type determines layout and UX style
 */
export type TenantTemplate = 'gallery' | 'detail' | 'minimal' | 'restaurant'

/**
 * Card visual variant options
 */
export type CardVariant = 'flat' | 'elevated' | 'outlined'

/**
 * Spacing density options
 */
export type SpacingMode = 'compact' | 'normal' | 'relaxed'

/**
 * Image aspect ratio format
 * Examples: "1:1", "16:9", "4:3"
 */
export type ImageAspectRatio = string

/**
 * Theme color overrides (subset of full config.colors)
 * Only includes colors that theme_overrides can modify
 */
export interface ThemeColors {
  primary?: string    // Hex color (e.g., "#3B82F6")
  accent?: string     // Hex color (e.g., "#F59E0B")
}

/**
 * Theme override configuration stored in tenants.theme_overrides (JSONB)
 *
 * All fields optional → allows partial overrides
 * Defaults applied by ThemeProvider when fields missing
 */
export interface ThemeOverrides {
  gridCols?: number             // Product grid columns (1-6)
  imageAspect?: ImageAspectRatio // Product image ratio ("1:1", "16:9", etc)
  cardVariant?: CardVariant     // Card style
  spacing?: SpacingMode          // Layout density
  colors?: ThemeColors           // Color palette overrides
}

/**
 * Full theme configuration resolved at runtime
 * Merges: template defaults + theme_overrides + config.colors
 */
export interface ResolvedTheme {
  template: TenantTemplate
  gridCols: number
  imageAspect: ImageAspectRatio
  cardVariant: CardVariant
  spacing: SpacingMode
  colors: {
    primary: string
    accent: string
    // Extended color palette from config.colors
    background?: string
    surface?: string
    textPrimary?: string
    textSecondary?: string
  }
}

/**
 * Template default configurations
 * Used when theme_overrides doesn't specify a value
 */
export const TEMPLATE_DEFAULTS: Record<TenantTemplate, Omit<ResolvedTheme, 'template' | 'colors'>> = {
  gallery: {
    gridCols: 3,
    imageAspect: '1:1',
    cardVariant: 'elevated',
    spacing: 'normal',
  },
  detail: {
    gridCols: 2,
    imageAspect: '16:9',
    cardVariant: 'outlined',
    spacing: 'relaxed',
  },
  minimal: {
    gridCols: 4,
    imageAspect: '4:3',
    cardVariant: 'flat',
    spacing: 'compact',
  },
  restaurant: {
    gridCols: 2,
    imageAspect: '16:9',
    cardVariant: 'outlined',
    spacing: 'normal',
  },
}

/**
 * Fallback color palette when config.colors missing
 */
export const DEFAULT_COLORS: Required<ThemeColors> = {
  primary: '#3B82F6',  // Blue-500
  accent: '#F59E0B',   // Amber-500
}

/**
 * Type guard for valid template values
 */
export function isValidTemplate(value: unknown): value is TenantTemplate {
  return typeof value === 'string' && ['gallery', 'detail', 'minimal', 'restaurant'].includes(value)
}

/**
 * Type guard for valid theme overrides
 */
export function isValidThemeOverrides(value: unknown): value is ThemeOverrides {
  if (typeof value !== 'object' || value === null) return false

  const overrides = value as Record<string, unknown>

  // Validate gridCols if present
  if ('gridCols' in overrides) {
    if (typeof overrides.gridCols !== 'number' || overrides.gridCols < 1 || overrides.gridCols > 6) {
      return false
    }
  }

  // Validate imageAspect if present
  if ('imageAspect' in overrides) {
    if (typeof overrides.imageAspect !== 'string' || !/^\d+:\d+$/.test(overrides.imageAspect)) {
      return false
    }
  }

  // Validate cardVariant if present
  if ('cardVariant' in overrides) {
    if (!['flat', 'elevated', 'outlined'].includes(overrides.cardVariant as string)) {
      return false
    }
  }

  // Validate spacing if present
  if ('spacing' in overrides) {
    if (!['compact', 'normal', 'relaxed'].includes(overrides.spacing as string)) {
      return false
    }
  }

  // Validate colors if present
  if ('colors' in overrides) {
    const colors = overrides.colors
    if (typeof colors !== 'object' || colors === null) return false

    const colorObj = colors as Record<string, unknown>
    if ('primary' in colorObj && (typeof colorObj.primary !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(colorObj.primary))) {
      return false
    }
    if ('accent' in colorObj && (typeof colorObj.accent !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(colorObj.accent))) {
      return false
    }
  }

  return true
}

/**
 * Resolves final theme configuration from DB data
 * Merges template defaults + theme_overrides + config.colors
 *
 * @param template - Tenant template type from DB
 * @param themeOverrides - JSONB theme_overrides from DB
 * @param configColors - Optional config.colors object from DB
 * @returns Fully resolved theme configuration
 */
export function resolveTheme(
  template: TenantTemplate,
  themeOverrides: ThemeOverrides = {},
  configColors?: Record<string, string>
): ResolvedTheme {
  const defaults = TEMPLATE_DEFAULTS[template]

  return {
    template,
    gridCols: themeOverrides.gridCols ?? defaults.gridCols,
    imageAspect: themeOverrides.imageAspect ?? defaults.imageAspect,
    cardVariant: themeOverrides.cardVariant ?? defaults.cardVariant,
    spacing: themeOverrides.spacing ?? defaults.spacing,
    colors: {
      primary: themeOverrides.colors?.primary ?? configColors?.primary ?? DEFAULT_COLORS.primary,
      accent: themeOverrides.colors?.accent ?? configColors?.accent ?? DEFAULT_COLORS.accent,
      background: configColors?.background,
      surface: configColors?.surface,
      textPrimary: configColors?.textPrimary,
      textSecondary: configColors?.textSecondary,
    },
  }
}
