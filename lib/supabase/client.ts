/**
 * Supabase browser client — typed wrapper over @skywalking/core.
 *
 * Use in Client Components ('use client') only.
 */
import { createClient as _createClient } from '@skywalking/core/supabase/client'
import type { Database } from '@/types/database.types'

export function createClient() {
  return _createClient<Database>()
}
