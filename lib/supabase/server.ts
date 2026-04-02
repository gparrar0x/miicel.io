/**
 * Supabase server clients — typed wrappers over @skywalking/core.
 *
 * createClient()            — Server Components, respects RLS.
 * createServiceRoleClient() — Bypasses RLS, trusted server contexts only.
 * createAdminClient         — Alias for createServiceRoleClient.
 */

import { createAdminClient as _createAdminClient } from '@skywalking/core/supabase/admin'
import {
  createClient as _createClient,
  createClientFromRequest as _createClientFromRequest,
} from '@skywalking/core/supabase/server'
import type { Database } from '@/types/database.types'

/**
 * RSC only — uses next/headers cookies(). Hangs in API route handlers on Vercel.
 */
export async function createClient() {
  return _createClient<Database>()
}

/**
 * API route handlers — parses cookies from Request directly. Safe for Vercel serverless.
 */
export function createClientFromRequest(request: Request) {
  return _createClientFromRequest<Database>(request)
}

export function createServiceRoleClient() {
  return _createAdminClient<Database>()
}

export const createAdminClient = createServiceRoleClient
