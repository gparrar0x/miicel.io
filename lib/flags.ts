/**
 * Feature Flags System
 *
 * DB-driven feature flags with support for:
 * - Global on/off
 * - Tenant-specific targeting
 * - User allowlists
 * - Percentage rollouts
 *
 * @example Server Component
 * ```tsx
 * import { isEnabled } from '@/lib/flags'
 *
 * export default async function Page() {
 *   const showConsignments = await isEnabled('consignments', { tenantId: 1 })
 *   return showConsignments ? <Consignments /> : null
 * }
 * ```
 *
 * @example API Route
 * ```tsx
 * import { isEnabled } from '@/lib/flags'
 *
 * export async function GET() {
 *   if (await isEnabled('analytics_v2')) {
 *     return Response.json({ version: 2 })
 *   }
 * }
 * ```
 */

import { createClient } from '@/lib/supabase/server'

// In-memory cache with TTL
const cache = new Map<string, { data: FeatureFlag; expires: number }>()
const CACHE_TTL_MS = 60_000 // 1 minute

export interface FeatureFlagRules {
  tenants?: number[]
  users?: string[]
  templates?: string[] // e.g., ['gallery', 'gastronomy']
  percentage?: number
  environments?: string[]
}

export interface FeatureFlag {
  id: number
  key: string
  description: string | null
  enabled: boolean
  rules: FeatureFlagRules
  created_at: string
  updated_at: string
}

export interface FlagContext {
  tenantId?: number
  tenantTemplate?: string // 'gallery' | 'gastronomy' | etc
  userId?: string
  environment?: string
}

/**
 * Mapping from flag key to NEXT_PUBLIC_FEATURE_* env var override.
 * When set to "true", the flag is forced on regardless of DB state.
 * Useful for local dev without a DB row.
 */
const ENV_OVERRIDES: Record<string, string> = {
  author_landings: 'NEXT_PUBLIC_FEATURE_AUTHOR_LANDINGS',
}

/**
 * Check if a feature flag is enabled
 *
 * Evaluation order:
 * 0. Env var override (NEXT_PUBLIC_FEATURE_*) forces on when set to "true"
 * 1. Flag must be globally enabled
 * 2. If rules.environments exists, current env must match
 * 3. If rules.tenants exists, tenantId must be in list
 * 4. If rules.users exists, userId must be in list
 * 5. If rules.percentage exists, deterministic hash check
 * 6. If no targeting rules, flag is enabled for all
 */
export async function isEnabled(key: string, context: FlagContext = {}): Promise<boolean> {
  // Env var override — allows local dev without DB row
  const envVar = ENV_OVERRIDES[key]
  if (envVar && process.env[envVar] === 'true') {
    return true
  }

  const flag = await getFlag(key)

  if (!flag?.enabled) {
    return false
  }

  const rules = flag.rules
  const env = context.environment ?? process.env.NODE_ENV ?? 'development'

  // Environment check
  if (rules.environments?.length && !rules.environments.includes(env)) {
    return false
  }

  // If no targeting rules, enabled for all.
  // Note: presence of the key (even as empty array) means "allowlist mode, currently empty"
  // — NOT "no targeting". Only `undefined` means "no rule defined → global".
  const hasTargeting =
    rules.tenants !== undefined ||
    rules.templates !== undefined ||
    rules.users !== undefined ||
    rules.percentage != null

  if (!hasTargeting) {
    return true
  }

  // Template allowlist (checked first, most common use case)
  if (rules.templates?.length) {
    if (context.tenantTemplate && rules.templates.includes(context.tenantTemplate)) {
      return true
    }
  }

  // Tenant allowlist
  if (rules.tenants?.length) {
    if (context.tenantId && rules.tenants.includes(context.tenantId)) {
      return true
    }
  }

  // User allowlist
  if (rules.users?.length) {
    if (context.userId && rules.users.includes(context.userId)) {
      return true
    }
  }

  // Percentage rollout (deterministic by userId or tenantId)
  if (rules.percentage != null && rules.percentage > 0) {
    const identifier = context.userId ?? context.tenantId?.toString() ?? ''
    if (identifier) {
      const hash = simpleHash(`${key}:${identifier}`)
      const bucket = hash % 100
      if (bucket < rules.percentage) {
        return true
      }
    }
  }

  // Has targeting but no match
  return false
}

/**
 * Get a feature flag by key (with caching)
 */
export async function getFlag(key: string): Promise<FeatureFlag | null> {
  // Check cache
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  // Fetch from DB
  const supabase = await createClient()
  const { data, error } = await supabase.from('feature_flags').select('*').eq('key', key).single()

  if (error || !data) {
    return null
  }

  const flag = data as FeatureFlag

  // Update cache
  cache.set(key, { data: flag, expires: Date.now() + CACHE_TTL_MS })

  return flag
}

/**
 * Get all feature flags (for admin dashboard)
 */
export async function getAllFlags(): Promise<FeatureFlag[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('feature_flags').select('*').order('key')

  if (error) {
    console.error('[flags] Failed to fetch flags:', error)
    return []
  }

  return (data as FeatureFlag[]) ?? []
}

/**
 * Clear the flag cache (call after updates)
 */
export function clearFlagCache(key?: string): void {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

/**
 * Simple deterministic hash for percentage rollouts
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Convenience export for common flags
export const Flags = {
  CONSIGNMENTS: 'consignments',
  KITCHEN_VIEW: 'kitchen_view',
  AGENTS: 'agents',
  AUTHOR_LANDINGS: 'author_landings',
  CONTENT_PIPELINE: 'content_pipeline',
  SOCIAL_MEDIA: 'social_media',
  NEQUI: 'nequi_enabled',
  MERCADOPAGO: 'mercadopago_enabled',
} as const

// Re-export client-safe category helpers so server-side code can still import
// everything from `@/lib/flags`. Client code should import from `@/lib/flag-categories`
// directly to avoid pulling server deps into the client bundle.
export { FLAG_CATEGORY_ORDER, type FlagCategory, getFlagCategory } from './flag-categories'

/**
 * Check if Nequi push payments are enabled for a specific tenant.
 */
export async function isNequiEnabled(tenantId: number): Promise<boolean> {
  return isEnabled(Flags.NEQUI, { tenantId })
}

/**
 * Check if MercadoPago is enabled for a specific tenant.
 * Enabled globally by default; tenant-level opt-out supported via allowlist/disable rules.
 */
export async function isMercadoPagoEnabled(tenantId: number): Promise<boolean> {
  return isEnabled(Flags.MERCADOPAGO, { tenantId })
}
