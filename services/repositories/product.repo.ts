/**
 * ProductRepository — Supabase queries for products table.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface ProductRow {
  id: number
  tenant_id: number
  name: string
  description: string | null
  price: number
  category: string | null
  stock: number | null
  image_url: string | null
  active: boolean
  metadata: unknown
  created_at?: string
  updated_at?: string
}

export interface ProductWithTenant extends ProductRow {
  tenants: { slug: string }
}

export interface CreateProductInput {
  tenant_id: number
  name: string
  description?: string
  price: number
  category?: string
  stock?: number
  image_url?: string
  active?: boolean
}

export interface UpdateProductInput {
  name?: string
  description?: string
  price?: number
  category?: string
  stock?: number
  image_url?: string
  active?: boolean
}

export interface IProductRepo {
  list(filters: {
    tenant_id?: number
    category?: string
    active?: boolean
    search?: string
  }): Promise<ProductRow[]>
  findById(id: number): Promise<ProductWithTenant | null>
  findByIdWithOwner(id: number): Promise<(ProductRow & { tenants: { owner_id: string } }) | null>
  findByIds(ids: number[]): Promise<ProductRow[]>
  create(input: CreateProductInput): Promise<ProductRow>
  update(id: number, input: UpdateProductInput): Promise<ProductRow>
  softDelete(id: number): Promise<ProductRow>
}

export class ProductRepo implements IProductRepo {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(filters: {
    tenant_id?: number
    category?: string
    active?: boolean
    search?: string
  }): Promise<ProductRow[]> {
    let query = this.supabase.from('products').select('*').order('created_at', { ascending: false })

    if (filters.tenant_id !== undefined) query = query.eq('tenant_id', filters.tenant_id)
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.active !== undefined) query = query.eq('active', filters.active)
    if (filters.search) query = query.ilike('name', `%${filters.search}%`)

    const { data, error } = await query
    if (error) throw new Error(`Failed to list products: ${error.message}`)
    return (data ?? []) as ProductRow[]
  }

  async findById(id: number): Promise<ProductWithTenant | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*, tenants(slug)')
      .eq('id', id)
      .eq('active', true)
      .maybeSingle()

    if (error) throw new Error(`Failed to fetch product: ${error.message}`)
    return (data as ProductWithTenant) ?? null
  }

  async findByIdWithOwner(
    id: number,
  ): Promise<(ProductRow & { tenants: { owner_id: string } }) | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('id, tenant_id, tenants!inner(owner_id)')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`Failed to fetch product: ${error.message}`)
    return data as (ProductRow & { tenants: { owner_id: string } }) | null
  }

  async findByIds(ids: number[]): Promise<ProductRow[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('id, tenant_id, stock, price, active, name, metadata')
      .in('id', ids)

    if (error) throw new Error(`Failed to fetch products: ${error.message}`)
    return (data ?? []) as ProductRow[]
  }

  async create(input: CreateProductInput): Promise<ProductRow> {
    const { data, error } = await this.supabase
      .from('products')
      .insert({
        tenant_id: input.tenant_id,
        name: input.name,
        description: input.description,
        price: input.price,
        category: input.category,
        stock: input.stock ?? 0,
        image_url: input.image_url,
        active: input.active ?? true,
      })
      .select()
      .single()

    if (error || !data)
      throw new Error(`Failed to create product: ${error?.message ?? 'Unknown error'}`)
    return data as ProductRow
  }

  async update(id: number, input: UpdateProductInput): Promise<ProductRow> {
    const { data, error } = await this.supabase
      .from('products')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data)
      throw new Error(`Failed to update product: ${error?.message ?? 'Unknown error'}`)
    return data as ProductRow
  }

  async softDelete(id: number): Promise<ProductRow> {
    const { data, error } = await this.supabase
      .from('products')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data)
      throw new Error(`Failed to delete product: ${error?.message ?? 'Unknown error'}`)
    return data as ProductRow
  }
}
