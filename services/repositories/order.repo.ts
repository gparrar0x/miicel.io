/**
 * OrderRepository — Supabase queries for orders table.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface OrderItem {
  product_id: number
  name: string
  quantity: number
  unit_price: number
  size_id?: string | null
  price?: number
  currency?: string
  image?: string
  color?: { id: number; name: string }
}

export interface CreateOrderInput {
  tenant_id: number
  customer_id: number
  items: OrderItem[]
  total: number
  status: string
  payment_method: string
  notes?: string | null
}

export interface OrderRow {
  id: number
}

export interface OrderWithCustomer {
  id: number
  tenant_id: number
  customers: { id: number; name: string; email: string; phone: string } | null
  items: OrderItem[]
  total: number
  status: string
  payment_method: string
  payment_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface IOrderRepo {
  create(input: CreateOrderInput): Promise<OrderRow>
  findByIdWithTenant(
    orderId: number,
  ): Promise<{ id: number; status: string; tenants: { owner_id: string } } | null>
  updateStatus(orderId: number, status: string): Promise<unknown>
  updateCheckoutId(orderId: number, checkoutId: string): Promise<void>
  list(params: {
    tenant_id: number
    status?: string
    date_from?: string
    date_to?: string
    limit: number
    offset: number
  }): Promise<{ data: OrderWithCustomer[]; count: number | null }>
}

export class OrderRepo implements IOrderRepo {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(input: CreateOrderInput): Promise<OrderRow> {
    const { data, error } = await this.supabase
      .from('orders')
      .insert({
        tenant_id: input.tenant_id,
        customer_id: input.customer_id,
        items: input.items,
        total: input.total,
        status: input.status,
        payment_method: input.payment_method,
        notes: input.notes ?? null,
      })
      .select('id')
      .single()

    if (error || !data) {
      throw new Error(`Failed to create order: ${error?.message ?? 'Unknown error'}`)
    }
    return data
  }

  async findByIdWithTenant(
    orderId: number,
  ): Promise<{ id: number; status: string; tenants: { owner_id: string } } | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*, tenants!inner(owner_id)')
      .eq('id', orderId)
      .maybeSingle()

    if (error) throw new Error(`Failed to fetch order: ${error.message}`)
    return data ?? null
  }

  async updateStatus(orderId: number, status: string): Promise<unknown> {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update order status: ${error.message}`)
    return data
  }

  async updateCheckoutId(orderId: number, checkoutId: string): Promise<void> {
    const { error } = await this.supabase
      .from('orders')
      .update({ checkout_id: checkoutId, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) throw new Error(`Failed to update order checkout_id: ${error.message}`)
  }

  async list(params: {
    tenant_id: number
    status?: string
    date_from?: string
    date_to?: string
    limit: number
    offset: number
  }): Promise<{ data: OrderWithCustomer[]; count: number | null }> {
    let query = this.supabase
      .from('orders')
      .select(`*, customers ( id, name, email, phone )`, { count: 'exact' })
      .eq('tenant_id', params.tenant_id)
      .order('created_at', { ascending: false })
      .range(params.offset, params.offset + params.limit - 1)

    if (params.status) query = query.eq('status', params.status)
    if (params.date_from) query = query.gte('created_at', params.date_from)
    if (params.date_to) {
      const end = new Date(params.date_to)
      end.setDate(end.getDate() + 1)
      query = query.lt('created_at', end.toISOString())
    }

    const { data, error, count } = await query
    if (error) throw new Error(`Failed to list orders: ${error.message}`)
    return { data: (data ?? []) as OrderWithCustomer[], count }
  }
}
