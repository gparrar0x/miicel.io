/**
 * Feature Flag Categories — client-safe module.
 *
 * Pure data + helpers for grouping flags in the admin UI. Kept separate from
 * `lib/flags.ts` because that module imports server-only supabase clients,
 * which can't be pulled into client bundles (Next 16 App Router).
 */

export const FLAG_CATEGORY_ORDER = [
  'Payment Gateways',
  'Storefront',
  'Content',
  'Analytics',
  'Experimental',
  'Other',
] as const

export type FlagCategory = (typeof FLAG_CATEGORY_ORDER)[number]

/**
 * Map from flag key to category. Flags not in this map fall back to 'Other'.
 * Hardcoded for now; graduate to a DB column if the list grows.
 */
const FLAG_CATEGORIES: Record<string, FlagCategory> = {
  // Payment Gateways
  mercadopago_enabled: 'Payment Gateways',
  nequi_enabled: 'Payment Gateways',

  // Storefront features
  consignments: 'Storefront',
  kitchen_view: 'Storefront',
  author_landings: 'Storefront',
  dark_mode: 'Storefront',

  // Content & AI
  content_pipeline: 'Content',
  social_media: 'Content',
  agents: 'Content',

  // Analytics
  analytics_v2: 'Analytics',

  // Experimental
  new_checkout: 'Experimental',
}

export function getFlagCategory(flagKey: string): FlagCategory {
  return FLAG_CATEGORIES[flagKey] ?? 'Other'
}
