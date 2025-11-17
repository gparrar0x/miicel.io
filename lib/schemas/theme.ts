/**
 * Zod Validation Schemas for Theme Configuration API
 * Matches ThemeOverrides interface from types/theme.ts
 * Used in PATCH /api/tenants/[slug]/theme endpoint
 */

import { z } from 'zod'

/**
 * Validates theme_overrides.colors field
 */
const themeColorsSchema = z
  .object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Primary color must be valid hex (e.g., #3B82F6)').optional(),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Accent color must be valid hex (e.g., #F59E0B)').optional(),
  })
  .strict()

/**
 * Validates full theme_overrides object
 * All fields optional (partial updates allowed)
 */
export const themeOverridesSchema = z
  .object({
    gridCols: z.number().int().min(1).max(6).optional(),
    imageAspect: z.string().regex(/^\d+:\d+$/, 'Image aspect must be ratio format (e.g., 1:1, 16:9)').optional(),
    cardVariant: z.enum(['flat', 'elevated', 'outlined']).optional(),
    spacing: z.enum(['compact', 'normal', 'relaxed']).optional(),
    colors: themeColorsSchema.optional(),
  })
  .strict()

/**
 * Validates PATCH /api/tenants/[slug]/theme request body
 * Allows updating template and/or theme_overrides
 */
export const updateThemeSchema = z
  .object({
    template: z.enum(['gallery', 'detail', 'minimal', 'restaurant']).optional(),
    overrides: themeOverridesSchema.optional(),
  })
  .strict()
  .refine((data) => data.template !== undefined || data.overrides !== undefined, {
    message: 'Must provide at least one of: template, overrides',
  })
