/**
 * useFeatureFlag Hook
 *
 * Client-side hook for checking feature flags
 * Fetches flag state via API and caches result
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag'
 *
 * export function MyComponent() {
 *   const { enabled, loading } = useFeatureFlag('new_checkout', { tenantId: 1 })
 *
 *   if (loading) return <Skeleton />
 *   return enabled ? <NewUI /> : <OldUI />
 * }
 * ```
 */

import { useCallback, useEffect, useState } from 'react'

interface FlagContext {
  tenantId?: number
  userId?: string
}

interface UseFeatureFlagReturn {
  enabled: boolean
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Client-side cache
const clientCache = new Map<string, { enabled: boolean; expires: number }>()
const CLIENT_CACHE_TTL_MS = 30_000 // 30 seconds

export function useFeatureFlag(key: string, context: FlagContext = {}): UseFeatureFlagReturn {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cacheKey = `${key}:${context.tenantId ?? ''}:${context.userId ?? ''}`

  const fetchFlag = useCallback(async () => {
    // Check client cache
    const cached = clientCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      setEnabled(cached.enabled)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ key })
      if (context.tenantId) params.set('tenantId', context.tenantId.toString())
      if (context.userId) params.set('userId', context.userId)

      const res = await fetch(`/api/flags?${params}`)

      if (!res.ok) {
        throw new Error('Failed to fetch flag')
      }

      const data = await res.json()
      const isEnabled = data.enabled ?? false

      // Update cache
      clientCache.set(cacheKey, {
        enabled: isEnabled,
        expires: Date.now() + CLIENT_CACHE_TTL_MS,
      })

      setEnabled(isEnabled)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setEnabled(false)
    } finally {
      setLoading(false)
    }
  }, [key, context.tenantId, context.userId, cacheKey])

  useEffect(() => {
    fetchFlag()
  }, [fetchFlag])

  return {
    enabled,
    loading,
    error,
    refetch: fetchFlag,
  }
}

/**
 * Prefetch multiple flags (call early to reduce latency)
 */
export async function prefetchFlags(
  keys: string[],
  context: FlagContext = {},
): Promise<Record<string, boolean>> {
  const params = new URLSearchParams()
  keys.forEach((k) => params.append('keys', k))
  if (context.tenantId) params.set('tenantId', context.tenantId.toString())
  if (context.userId) params.set('userId', context.userId)

  try {
    const res = await fetch(`/api/flags/batch?${params}`)
    if (!res.ok) return {}

    const data = await res.json()

    // Update cache for each flag
    Object.entries(data.flags ?? {}).forEach(([key, enabled]) => {
      const cacheKey = `${key}:${context.tenantId ?? ''}:${context.userId ?? ''}`
      clientCache.set(cacheKey, {
        enabled: enabled as boolean,
        expires: Date.now() + CLIENT_CACHE_TTL_MS,
      })
    })

    return data.flags ?? {}
  } catch {
    return {}
  }
}

/**
 * Clear client-side flag cache
 */
export function clearClientFlagCache(): void {
  clientCache.clear()
}
