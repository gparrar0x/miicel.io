'use client'

/**
 * ThemeProvider Component
 *
 * Injects tenant CSS variables into :root for dynamic theming
 * Must be client component to handle style tag injection
 *
 * Usage:
 * <ThemeProvider config={tenantConfig}>
 *   {children}
 * </ThemeProvider>
 */

import { type TenantConfigResponse } from '@/lib/schemas/order'
import { useEffect } from 'react'

interface ThemeProviderProps {
  config: TenantConfigResponse
  children: React.ReactNode
}

export function ThemeProvider({ config, children }: ThemeProviderProps) {
  useEffect(() => {
    // Inject CSS variables into :root
    const root = document.documentElement

    root.style.setProperty('--color-primary', config.colors.primary)
    root.style.setProperty('--color-secondary', config.colors.secondary)
    root.style.setProperty('--color-accent', config.colors.accent)
    root.style.setProperty('--color-bg-base', config.colors.surface)
    root.style.setProperty('--color-bg-elevated', config.colors.background)
    root.style.setProperty('--color-text-primary', config.colors.textPrimary)
    root.style.setProperty('--color-text-secondary', config.colors.textSecondary)

    // Cleanup on unmount (restore defaults)
    return () => {
      root.style.removeProperty('--color-primary')
      root.style.removeProperty('--color-secondary')
      root.style.removeProperty('--color-accent')
      root.style.removeProperty('--color-bg-base')
      root.style.removeProperty('--color-bg-elevated')
      root.style.removeProperty('--color-text-primary')
      root.style.removeProperty('--color-text-secondary')
    }
  }, [config])

  return <>{children}</>
}
