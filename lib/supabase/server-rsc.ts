/**
 * RSC-only Supabase client — uses next/headers cookies().
 *
 * ONLY import this file from Server Components, layouts, and pages.
 * NEVER import from API route handlers — it will hang on Vercel.
 *
 * API routes should use createClientFromRequest() from './server' instead.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

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
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // Called from a Server Component — ignored.
          }
        },
      },
    },
  )
}
