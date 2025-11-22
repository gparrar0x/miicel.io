/**
 * POST /api/cache/invalidate - Invalidate Middleware Cache
 *
 * Clears the tenant cache in middleware to force fresh data fetch.
 * Called after onboarding completion to ensure redirect works.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This will be used by middleware to check for invalidation signals
// Using a simple in-memory flag that resets on server restart
const invalidationTimestamps = new Map<string, number>()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tenantSlug } = body

    if (!tenantSlug || typeof tenantSlug !== 'string') {
      return NextResponse.json({ error: 'Invalid tenant slug' }, { status: 400 })
    }

    // Set invalidation timestamp for this tenant
    invalidationTimestamps.set(tenantSlug, Date.now())

    return NextResponse.json({
      success: true,
      message: `Cache invalidated for tenant: ${tenantSlug}`
    })
  } catch (error) {
    console.error('Cache invalidation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export helper to check if tenant cache should be invalidated
export function shouldInvalidateCache(tenantSlug: string): boolean {
  const timestamp = invalidationTimestamps.get(tenantSlug)
  if (!timestamp) return false

  // Keep invalidation signal for 10 seconds
  const age = Date.now() - timestamp
  if (age > 10000) {
    invalidationTimestamps.delete(tenantSlug)
    return false
  }

  return true
}

// Export function to clear invalidation signal
export function clearInvalidationSignal(tenantSlug: string) {
  invalidationTimestamps.delete(tenantSlug)
}
