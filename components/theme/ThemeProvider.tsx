/**
 * ThemeProvider - Multi-tenant dynamic theming system
 *
 * Injects CSS variables from ResolvedTheme into DOM for tenant-specific styling.
 * Used in tenant layout to apply template + theme overrides from DB.
 *
 * Usage:
 * ```tsx
 * import { ThemeProvider } from '@/components/theme/ThemeProvider'
 * import { resolveTheme } from '@/types/theme'
 *
 * // In server component (layout)
 * const theme = resolveTheme(tenant.template, tenant.theme_overrides)
 * return <ThemeProvider theme={theme}>{children}</ThemeProvider>
 * ```
 *
 * CSS Variables Generated:
 * - --grid-cols: number
 * - --image-aspect: "W:H" string
 * - --spacing-xs, --spacing-sm, --spacing-md, --spacing-lg, --spacing-xl: px values
 * - --color-primary, --color-accent, --color-background, etc: hex colors
 *
 * Consumer components can use:
 * - `style={{ gridTemplateColumns: 'repeat(var(--grid-cols), 1fr)' }}`
 * - `style={{ aspectRatio: 'var(--image-aspect)' }}`
 * - Tailwind with CSS vars plugin
 *
 * Test IDs: theme-provider-root (outer div wrapper)
 *
 * Created: 2025-11-16 (Issue #3)
 */

'use client'

import { createContext, type ReactNode, useContext, useMemo } from 'react'
import type { ResolvedTheme, SpacingMode } from '@/types/theme'

const ThemeContext = createContext<ResolvedTheme | null>(null)

/**
 * Spacing scale map (8px base grid)
 * Compact = tight spacing, Relaxed = generous spacing
 */
const SPACING_SCALES: Record<SpacingMode, Record<string, string>> = {
  compact: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  normal: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  relaxed: {
    xs: '12px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
  },
}

interface ThemeProviderProps {
  theme: ResolvedTheme
  children: ReactNode
}

/**
 * ThemeProvider - Injects CSS variables from ResolvedTheme
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  // Compute CSS variable object (memoized for perf)
  const cssVars = useMemo(() => {
    const spacing = SPACING_SCALES[theme.spacing]
    const [width, height] = theme.imageAspect.split(':')

    return {
      // Layout
      '--grid-cols': theme.gridCols.toString(),
      '--image-aspect': `${width} / ${height}`, // CSS aspect-ratio format

      // Spacing scale (8px grid)
      '--spacing-xs': spacing.xs,
      '--spacing-sm': spacing.sm,
      '--spacing-md': spacing.md,
      '--spacing-lg': spacing.lg,
      '--spacing-xl': spacing.xl,

      // Colors
      '--color-primary': theme.colors.primary,
      '--color-accent': theme.colors.accent,
      ...(theme.colors.background && { '--color-background': theme.colors.background }),
      ...(theme.colors.surface && { '--color-surface': theme.colors.surface }),
      ...(theme.colors.textPrimary && { '--color-text-primary': theme.colors.textPrimary }),
      ...(theme.colors.textSecondary && { '--color-text-secondary': theme.colors.textSecondary }),
    } as React.CSSProperties
  }, [theme])

  if (process.env.NODE_ENV === 'development') {
    console.log('[ThemeProvider] Resolved theme:', theme)
    console.log('[ThemeProvider] CSS vars:', cssVars)
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div style={cssVars} data-testid="theme-provider-root">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ResolvedTheme {
  const theme = useContext(ThemeContext)
  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return theme
}
