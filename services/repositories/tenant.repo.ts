/**
 * TenantRepository — Supabase queries for tenants table.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface TenantRow {
  id: number
  template?: string
}

export interface TenantWithToken {
  mp_access_token: string | null
}

export interface ITenantRepo {
  findBySlug(slug: string): Promise<TenantRow | null>
  findBySlugWithToken(slug: string): Promise<(TenantRow & TenantWithToken) | null>
}

export class TenantRepo implements ITenantRepo {
  constructor(private readonly supabase: SupabaseClient) {}

  async findBySlug(slug: string): Promise<TenantRow | null> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('id, template')
      .eq('slug', slug)
      .maybeSingle()

    if (error) throw new Error(`Failed to fetch tenant: ${error.message}`)
    return data ?? null
  }

  async findBySlugWithToken(slug: string): Promise<(TenantRow & TenantWithToken) | null> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('id, template, mp_access_token')
      .eq('slug', slug)
      .single()

    if (error) throw new Error(`Failed to fetch tenant token: ${error.message}`)
    return data ?? null
  }
}
