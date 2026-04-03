/**
 * Supabase server clients — API routes + service role.
 *
 * createClientFromRequest(req)    — API route handlers (parses cookies from Request).
 * createServiceRoleClient()       — Bypasses RLS, trusted server contexts only.
 *
 * For RSC (Server Components), use createClient() from './server-rsc'.
 *
 * IMPORTANT: This file must NOT import 'next/headers' or '@skywalking/core/supabase/server'.
 * Those imports hang Vercel Lambda cold-start because Turbopack bundles them
 * into every function via transpilePackages.
 */

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

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

export function createServiceRoleClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export const createAdminClient = createServiceRoleClient

/**
 * RSC only — uses next/headers cookies(). HANGS in API route handlers.
 * Dynamically imported to prevent next/headers from entering Lambda bundles.
 */
export async function createClient() {
  const { createClient: _create } = await import('./server-rsc')
  return _create()
}
