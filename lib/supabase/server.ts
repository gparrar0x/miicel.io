/**
 * Supabase server clients — typed wrappers over @skywalking/core.
 *
 * createClient()            — Server Components, respects RLS.
 * createServiceRoleClient() — Bypasses RLS, trusted server contexts only.
 * createAdminClient         — Alias for createServiceRoleClient.
 */

import { createAdminClient as _createAdminClient } from '@skywalking/core/supabase/admin'
import { createClient as _createClient } from '@skywalking/core/supabase/server'
import type { Database } from '@/types/database.types'

export async function createClient() {
  return _createClient<Database>()
}

export function createServiceRoleClient() {
  return _createAdminClient<Database>()
}

export const createAdminClient = createServiceRoleClient
