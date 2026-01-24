/**
 * Supabase Clients for Server Components & API Routes
 *
 * Provides three types of clients:
 * 1. createClient() - For Server Components (respects RLS, uses user session)
 * 2. createServiceRoleClient() - For API Routes (bypasses RLS, admin access)
 * 3. createAdminClient() - Alias for service role client
 *
 * @example Server Component
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = createClient()
 *   const { data } = await supabase.from('products').select('*')
 *   // RLS policies apply - only sees user's data
 * }
 * ```
 *
 * @example API Route (Service Role)
 * ```tsx
 * import { createServiceRoleClient } from '@/lib/supabase/server'
 *
 * export async function POST(request: Request) {
 *   const supabase = createServiceRoleClient()
 *   const { data } = await supabase.from('orders').insert({...})
 *   // Bypasses RLS - full admin access
 * }
 * ```
 */

import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * Create a Supabase client for Server Components
 * Respects RLS policies based on authenticated user
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Create a Supabase client with Service Role key
 * Bypasses RLS - use ONLY in trusted server contexts
 *
 * ⚠️ SECURITY WARNING:
 * This client has full database access, bypassing all RLS policies.
 * Only use for:
 * - Webhook handlers (e.g., MercadoPago callbacks)
 * - Admin operations
 * - Trusted API routes
 *
 * Never expose this client to client-side code.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

/**
 * Alias for createServiceRoleClient()
 * Use for admin operations that need to bypass RLS
 */
export const createAdminClient = createServiceRoleClient
