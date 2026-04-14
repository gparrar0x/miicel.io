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

export interface NequiSecureConfig {
  client_id: string
  api_key: string
  app_secret: string
  phone_number: string
}

export interface TenantWithNequi {
  mp_access_token: string | null
  secure_config: {
    mp_access_token?: string
    nequi?: NequiSecureConfig
  } | null
  currency?: string
}

export interface ITenantRepo {
  findById(id: number): Promise<(TenantRow & { owner_id: string }) | null>
  findBySlug(slug: string): Promise<TenantRow | null>
  findBySlugWithToken(slug: string): Promise<(TenantRow & TenantWithToken) | null>
  findBySlugWithNequi(slug: string): Promise<(TenantRow & TenantWithNequi) | null>
  findByIdWithNequi(
    id: number,
  ): Promise<(TenantRow & TenantWithNequi & { owner_id: string }) | null>
}

export class TenantRepo implements ITenantRepo {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: number): Promise<(TenantRow & { owner_id: string }) | null> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('id, template, owner_id')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`Failed to fetch tenant: ${error.message}`)
    return data ?? null
  }

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

  /**
   * Fetch tenant with mp_access_token, secure_config (for Nequi creds), and currency.
   * Single query — reused for both MP and Nequi checkout flows.
   */
  async findBySlugWithNequi(slug: string): Promise<(TenantRow & TenantWithNequi) | null> {
    // biome-ignore lint/suspicious/noExplicitAny: Supabase generated types don't cover secure_config/config JSONB
    const { data, error } = await (this.supabase as any)
      .from('tenants')
      .select('id, template, mp_access_token, secure_config, config')
      .eq('slug', slug)
      .maybeSingle()

    if (error) throw new Error(`Failed to fetch tenant: ${error.message}`)
    if (!data) return null

    return {
      id: data.id as number,
      template: data.template as string | undefined,
      mp_access_token: (data.mp_access_token as string | null) ?? null,
      secure_config: (data.secure_config as TenantWithNequi['secure_config']) ?? null,
      currency: (data.config as { currency?: string } | null)?.currency ?? undefined,
    }
  }

  /**
   * Fetch tenant by ID with owner_id + Nequi fields — for polling endpoint auth.
   */
  async findByIdWithNequi(
    id: number,
  ): Promise<(TenantRow & TenantWithNequi & { owner_id: string }) | null> {
    // biome-ignore lint/suspicious/noExplicitAny: Supabase generated types don't cover secure_config/config JSONB
    const { data, error } = await (this.supabase as any)
      .from('tenants')
      .select('id, template, owner_id, mp_access_token, secure_config, config')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`Failed to fetch tenant: ${error.message}`)
    if (!data) return null

    return {
      id: data.id as number,
      template: data.template as string | undefined,
      owner_id: data.owner_id as string,
      mp_access_token: (data.mp_access_token as string | null) ?? null,
      secure_config: (data.secure_config as TenantWithNequi['secure_config']) ?? null,
      currency: (data.config as { currency?: string } | null)?.currency ?? undefined,
    }
  }
}
