/**
 * Supabase server clients.
 *
 * createClient()                  — RSC only (uses next/headers cookies()).
 * createClientFromRequest(req)    — API route handlers (parses cookies from Request).
 * createServiceRoleClient()       — Bypasses RLS, trusted server contexts only.
 *
 * IMPORTANT: createClient() is dynamically imported to avoid pulling in
 * next/headers at module level, which hangs Vercel serverless functions.
 */

import { createServerClient } from '@supabase/ssr'
import { createAdminClient as _createAdminClient } from '@skywalking/core/supabase/admin'
import type { Database } from '@/types/database.types'

/**
 * RSC only — uses next/headers cookies(). HANGS in API route handlers on Vercel.
 * Dynamic import ensures the cookies() dependency is only loaded in RSC context.
 */
export async function createClient() {
  const { createClient: _createClient } = await import('@skywalking/core/supabase/server')
  return _createClient<Database>()
}

/**
 * API route handlers — parses cookies from Request directly.
 * Bypasses next/headers AsyncLocalStorage, safe for Vercel serverless.
 */
export function createClientFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const parsed = cookieHeader
    .split(';')
    .filter(Boolean)
    .map((pair) => {
      const idx = pair.indexOf('=')
      if (idx === -1) return { name: pair.trim(), value: '' }
      return { name: pair.slice(0, idx).trim(), value: pair.slice(idx + 1).trim() }
    })

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parsed
        },
        setAll() {
          // No-op in route handlers — session refresh handled by middleware
        },
      },
    },
  )
}

export function createServiceRoleClient() {
  return _createAdminClient<Database>()
}

export const createAdminClient = createServiceRoleClient
