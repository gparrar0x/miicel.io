/**
 * CustomerRepository — Supabase queries for customers table.
 * All methods accept a typed Supabase client to allow test injection.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface CustomerInput {
  tenant_id: number
  name: string
  email: string
  phone: string
}

export interface CustomerRow {
  id: number
}

export interface ICustomerRepo {
  findByEmail(tenantId: number, email: string): Promise<CustomerRow | null>
  findByEmailAndPhone(tenantId: number, email: string, phone: string): Promise<CustomerRow | null>
  create(input: CustomerInput): Promise<CustomerRow>
  update(id: number, data: Partial<Pick<CustomerInput, 'name' | 'phone'>>): Promise<void>
}

export class CustomerRepo implements ICustomerRepo {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByEmail(tenantId: number, email: string): Promise<CustomerRow | null> {
    const { data } = await this.supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('email', email)
      .maybeSingle()
    return data ?? null
  }

  async findByEmailAndPhone(
    tenantId: number,
    email: string,
    phone: string,
  ): Promise<CustomerRow | null> {
    const { data } = await this.supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('phone', phone)
      .eq('email', email)
      .maybeSingle()
    return data ?? null
  }

  async create(input: CustomerInput): Promise<CustomerRow> {
    const { data, error } = await this.supabase
      .from('customers')
      .insert({
        tenant_id: input.tenant_id,
        name: input.name,
        email: input.email,
        phone: input.phone,
      })
      .select('id')
      .single()

    if (error || !data) {
      throw new Error(`Failed to create customer: ${error?.message ?? 'Unknown error'}`)
    }
    return data
  }

  async update(id: number, data: Partial<Pick<CustomerInput, 'name' | 'phone'>>): Promise<void> {
    await this.supabase
      .from('customers')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
  }
}
