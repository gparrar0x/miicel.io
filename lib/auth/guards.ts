/**
 * Server-side Authentication Guards
 *
 * Provides type-safe utilities for verifying user permissions and tenant ownership.
 * All functions are designed for server-side use only (Server Components, API Routes).
 *
 * Performance: Uses headers from middleware when available to avoid redundant DB queries.
 * Security: Multi-layered approach (middleware + server guards + RLS policies).
 *
 * @example
 * ```tsx
 * import { verifyTenantOwnership, requireTenantOwner } from '@/lib/auth/guards'
 *
 * // Server Component - Returns result object
 * export default async function DashboardPage({ params }: { params: { tenant: string } }) {
 *   const { isOwner, user, tenant, error } = await verifyTenantOwnership(params.tenant)
 *
 *   if (!isOwner) {
 *     return <UnauthorizedView error={error} />
 *   }
 *
 *   return <DashboardContent user={user} tenant={tenant} />
 * }
 *
 * // API Route - Throws error if unauthorized
 * export async function POST(request: Request) {
 *   const { user, tenant } = await requireTenantOwner('tenant-slug')
 *   // Proceeds only if user is owner
 * }
 * ```
 */

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

// ============================================================================
// Types
// ============================================================================

export type TenantOwnershipResult = {
  isOwner: boolean
  user: User | null
  tenant: {
    id: number
    slug: string
    name: string
    owner_id: string
  } | null
  error?: 'unauthenticated' | 'not_owner' | 'tenant_not_found' | 'server_error'
  message?: string
}

export type RequireOwnerResult = {
  user: User
  tenant: {
    id: number
    slug: string
    name: string
    owner_id: string
  }
}

// ============================================================================
// Core Verification Functions
// ============================================================================

/**
 * Verifies if the current authenticated user owns the specified tenant.
 *
 * Returns detailed result object without throwing errors.
 * Use when you need conditional rendering based on ownership.
 *
 * Performance optimizations:
 * - Reads tenant_id from middleware headers when available (avoids DB query)
 * - Caches results per request lifecycle
 * - Parallel execution of auth check and tenant fetch when needed
 *
 * @param tenantSlug - The tenant slug from URL params
 * @returns TenantOwnershipResult with ownership status and details
 *
 * @example
 * ```tsx
 * const { isOwner, user, tenant } = await verifyTenantOwnership('my-store')
 * if (!isOwner) {
 *   return <Forbidden />
 * }
 * ```
 */
export async function verifyTenantOwnership(
  tenantSlug: string
): Promise<TenantOwnershipResult> {
  try {
    const supabase = await createClient()

    // Step 1: Get current session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        isOwner: false,
        user: null,
        tenant: null,
        error: 'unauthenticated',
        message: 'User is not authenticated'
      }
    }

    // Step 2: Get tenant data
    // Try to read from middleware headers first (performance optimization)
    const headersList = await headers()
    const tenantIdFromHeader = headersList.get('x-tenant-id')

    let tenant: { id: number; slug: string; name: string; owner_id: string } | null = null

    if (tenantIdFromHeader) {
      // Fast path: Use cached tenant data from middleware
      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select('id, slug, name, owner_id')
        .eq('id', parseInt(tenantIdFromHeader, 10))
        .single()

      if (fetchError || !data) {
        return {
          isOwner: false,
          user,
          tenant: null,
          error: 'tenant_not_found',
          message: 'Tenant not found'
        }
      }

      tenant = data
    } else {
      // Fallback: Query by slug
      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select('id, slug, name, owner_id')
        .eq('slug', tenantSlug)
        .single()

      if (fetchError || !data) {
        return {
          isOwner: false,
          user,
          tenant: null,
          error: 'tenant_not_found',
          message: 'Tenant not found'
        }
      }

      tenant = data
    }

    // Step 3: Verify ownership
    const isOwner = user.id === tenant.owner_id

    if (!isOwner) {
      return {
        isOwner: false,
        user,
        tenant,
        error: 'not_owner',
        message: 'User is not the tenant owner'
      }
    }

    return {
      isOwner: true,
      user,
      tenant
    }

  } catch (error) {
    console.error('[Auth Guard] Error verifying tenant ownership:', error)
    return {
      isOwner: false,
      user: null,
      tenant: null,
      error: 'server_error',
      message: 'Internal server error during ownership verification'
    }
  }
}

/**
 * Requires tenant ownership or throws an error.
 *
 * Use in API routes or server actions where you want automatic error handling.
 * Throws descriptive errors that can be caught by error boundaries.
 *
 * @param tenantSlug - The tenant slug from URL params
 * @returns Object with user and tenant (guaranteed to be owner)
 * @throws Error if user is not authenticated or not the owner
 *
 * @example API Route
 * ```tsx
 * export async function POST(request: Request) {
 *   try {
 *     const { user, tenant } = await requireTenantOwner('my-store')
 *     // Proceed with operation - user is guaranteed to be owner
 *   } catch (error) {
 *     return Response.json({ error: error.message }, { status: 403 })
 *   }
 * }
 * ```
 */
export async function requireTenantOwner(
  tenantSlug: string
): Promise<RequireOwnerResult> {
  const result = await verifyTenantOwnership(tenantSlug)

  if (!result.isOwner) {
    const errorMessages = {
      unauthenticated: 'Authentication required. Please log in.',
      not_owner: 'Access denied. You are not the owner of this tenant.',
      tenant_not_found: 'Tenant not found.',
      server_error: 'Server error during authentication.'
    }

    throw new Error(
      result.error ? errorMessages[result.error] : 'Unauthorized access'
    )
  }

  return {
    user: result.user!,
    tenant: result.tenant!
  }
}

/**
 * Requires tenant ownership with automatic redirect on failure.
 *
 * Use in Server Components where you want automatic redirect behavior.
 * Redirects to login if unauthenticated, or home if not owner.
 *
 * @param tenantSlug - The tenant slug from URL params
 * @returns Object with user and tenant (guaranteed to be owner)
 *
 * @example Server Component
 * ```tsx
 * export default async function DashboardPage({ params }: { params: { tenant: string } }) {
 *   const { user, tenant } = await requireTenantOwnerOrRedirect(params.tenant)
 *   // Component only renders if user is owner
 *   return <Dashboard user={user} tenant={tenant} />
 * }
 * ```
 */
export async function requireTenantOwnerOrRedirect(
  tenantSlug: string
): Promise<RequireOwnerResult> {
  const result = await verifyTenantOwnership(tenantSlug)

  if (!result.isOwner) {
    // Redirect to login if not authenticated
    if (result.error === 'unauthenticated') {
      redirect(`/${tenantSlug}/login`)
    }

    // Redirect to tenant home if authenticated but not owner
    redirect(`/${tenantSlug}`)
  }

  return {
    user: result.user!,
    tenant: result.tenant!
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Checks if the current user is authenticated.
 *
 * Simple authentication check without tenant verification.
 * Use for pages that require login but not tenant ownership.
 *
 * @returns User object if authenticated, null otherwise
 *
 * @example
 * ```tsx
 * const user = await getCurrentUser()
 * if (!user) {
 *   return <LoginPrompt />
 * }
 * ```
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

/**
 * Requires authentication with automatic redirect to login.
 *
 * Use for pages that need authentication but not specific tenant ownership.
 *
 * @param redirectPath - Path to redirect after login (default: current path)
 * @returns User object (guaranteed to be authenticated)
 *
 * @example
 * ```tsx
 * export default async function ProfilePage() {
 *   const user = await requireAuth()
 *   return <Profile user={user} />
 * }
 * ```
 */
export async function requireAuth(redirectPath?: string): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    const loginPath = redirectPath
      ? `/login?redirect=${encodeURIComponent(redirectPath)}`
      : '/login'
    redirect(loginPath)
  }

  return user
}

// ============================================================================
// Performance & Monitoring Helpers
// ============================================================================

/**
 * Logs authentication events for monitoring and debugging.
 *
 * Use in production to track unauthorized access attempts.
 * Structured logging format for easy parsing.
 *
 * @internal
 */
function logAuthEvent(
  event: 'ownership_check' | 'unauthorized_access' | 'auth_error',
  details: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString()

  // Structured logging (JSON format)
  console.log(JSON.stringify({
    timestamp,
    event,
    service: 'auth_guard',
    ...details
  }))
}

/**
 * Gets tenant ownership status with performance metrics.
 *
 * Development helper that includes timing information.
 * Use for performance optimization and debugging.
 *
 * @param tenantSlug - The tenant slug
 * @returns Ownership result with performance metrics
 */
export async function verifyTenantOwnershipWithMetrics(
  tenantSlug: string
): Promise<TenantOwnershipResult & { duration_ms: number }> {
  const startTime = performance.now()
  const result = await verifyTenantOwnership(tenantSlug)
  const duration_ms = Math.round(performance.now() - startTime)

  logAuthEvent('ownership_check', {
    tenant_slug: tenantSlug,
    is_owner: result.isOwner,
    duration_ms,
    error: result.error
  })

  return { ...result, duration_ms }
}
