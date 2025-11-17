/**
 * useTheme hook - Type-safe theme context access
 *
 * Re-export for cleaner imports. Use this instead of importing from ThemeProvider directly.
 *
 * @throws Error if used outside ThemeProvider
 * @returns ResolvedTheme from context
 *
 * Created: 2025-11-16 (Issue #3)
 */

export { useTheme } from './ThemeProvider'
