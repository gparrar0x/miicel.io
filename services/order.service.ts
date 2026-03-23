/**
 * OrderService — business logic for orders/create + orders/list + orders/[id]/status.
 * Security: product ownership, stock validation, status transition rules.
 */

import { ForbiddenError, NotFoundError, ValidationError } from '@skywalking/core/errors'
import type { SupabaseClient } from '@supabase/supabase-js'
import { assertOwnership } from '@/lib/auth/constants'
import type { OrderStatus } from '@/lib/schemas/order'
import type { SelectedModifier } from '@/types/commerce'
import type { ICustomerRepo } from './repositories/customer.repo'
import type { IOrderRepo, OrderItem as RepoOrderItem } from './repositories/order.repo'
import type { IProductRepo } from './repositories/product.repo'
import type { ITenantRepo } from './repositories/tenant.repo'

// ---- Types ----

export interface OrderItemInput {
  productId: number
  quantity: number
  sizeId?: string
  selectedModifiers?: SelectedModifier[]
}

export interface CustomerInput {
  name: string
  phone: string
  email: string
}

export interface CreateOrderInput {
  tenantSlug: string
  customer: CustomerInput
  items: OrderItemInput[]
  paymentMethod: string
  notes?: string
}

export interface CreateOrderResult {
  success: true
  orderId: number
  total: number
}

export interface ListOrdersInput {
  tenantId: number
  userId: string
  userEmail?: string
  status?: OrderStatus
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

export interface UpdateStatusInput {
  orderId: number
  userId: string
  userEmail?: string
  newStatus: OrderStatus
}

export class OrderService {
  constructor(
    private readonly tenantRepo: ITenantRepo,
    private readonly customerRepo: ICustomerRepo,
    private readonly orderRepo: IOrderRepo,
    private readonly productRepo: IProductRepo,
    private readonly supabase?: SupabaseClient,
  ) {}

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const { tenantSlug, customer, items, paymentMethod, notes } = input

    // 1. Resolve tenant
    const tenant = await this.tenantRepo.findBySlug(tenantSlug)
    if (!tenant) throw new NotFoundError('Tenant')
    const tenantId = tenant.id

    // 2. Validate products — ownership + stock
    const productIds = items.map((i) => i.productId)
    const products = await this.productRepo.findByIds(productIds)

    if (!products || products.length === 0) {
      throw new ValidationError('Failed to validate products')
    }

    // Security: all products must belong to tenant
    const productMap = new Map(products.map((p) => [p.id, p]))
    for (const p of products) {
      if (p.tenant_id !== tenantId) {
        throw new ForbiddenError('Product ownership mismatch')
      }
    }

    // 2b. Validate modifiers if present
    const modifiersByItem = new Map<
      number,
      { groupName: string; optionName: string; priceDelta: number }[]
    >()

    if (this.supabase) {
      for (const item of items) {
        if (item.selectedModifiers && item.selectedModifiers.length > 0) {
          const validated = await this.validateModifiers(
            item.selectedModifiers,
            item.productId,
            tenantId,
          )
          modifiersByItem.set(item.productId, validated)
        }
      }
    }

    // Build order items + compute total
    const orderItems: RepoOrderItem[] = []
    let total = 0

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) throw new ValidationError(`Product ${item.productId} not found`)
      if (!product.active) throw new ValidationError(`Product ${product.name} is not available`)

      // Stock check
      const metadata = product.metadata as {
        sizes?: Array<{ id: string; label: string; stock: number }>
      } | null

      let availableStock = product.stock ?? 0
      let stockLabel = product.name

      if (item.sizeId && metadata?.sizes) {
        const size = metadata.sizes.find((s) => s.id === item.sizeId)
        if (!size) throw new ValidationError(`Invalid size for ${product.name}`)
        availableStock = size.stock ?? 0
        stockLabel = `${product.name} (${size.label})`
      }

      // Gastronomy template skips stock limits
      if (tenant.template !== 'gastronomy' && availableStock < item.quantity) {
        throw new ValidationError(
          `Insufficient stock for ${stockLabel}. Available: ${availableStock}`,
        )
      }

      // Compute modifier delta for this item
      const itemModifiers = modifiersByItem.get(item.productId) ?? []
      const modifierDelta = itemModifiers.reduce((sum, m) => sum + m.priceDelta, 0)
      const unitPriceWithModifiers = product.price + modifierDelta

      orderItems.push({
        product_id: product.id,
        name: product.name,
        quantity: item.quantity,
        unit_price: unitPriceWithModifiers,
        size_id: item.sizeId ?? null,
      })

      total += unitPriceWithModifiers * item.quantity
    }

    // 3. Upsert customer
    const customerId = await this.upsertCustomer(tenantId, customer)

    // 4. Create order
    const order = await this.orderRepo.create({
      tenant_id: tenantId,
      customer_id: customerId,
      items: orderItems,
      total,
      status: 'pending',
      payment_method: paymentMethod,
      notes: notes ?? null,
    })

    // 5. Dual-write: order_line_items + order_line_item_modifiers
    if (this.supabase) {
      await this.writeOrderLineItems(order.id, tenantId, items, productMap, modifiersByItem)
    }

    return { success: true, orderId: order.id, total }
  }

  async listOrders(input: ListOrdersInput) {
    const {
      tenantId,
      userId,
      userEmail,
      status,
      date_from,
      date_to,
      limit = 50,
      offset = 0,
    } = input

    // RLS validates tenant ownership; no additional tenant lookup needed here.
    const { data, count } = await this.orderRepo.list({
      tenant_id: tenantId,
      status,
      date_from,
      date_to,
      limit,
      offset,
    })

    const orders = data.map((order) => ({
      id: order.id,
      tenant_id: order.tenant_id,
      customer: order.customers || null,
      items: order.items,
      total: order.total,
      status: order.status,
      payment_method: order.payment_method,
      payment_id: order.payment_id,
      notes: order.notes,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }))

    return {
      orders,
      total_count: count ?? 0,
      page: Math.floor(offset / limit) + 1,
      per_page: limit,
    }
  }

  async updateStatus(input: UpdateStatusInput): Promise<unknown> {
    const { orderId, userId, userEmail, newStatus } = input

    const order = await this.orderRepo.findByIdWithTenant(orderId)
    if (!order) throw new NotFoundError('Order')

    assertOwnership(userId, userEmail, order.tenants.owner_id, 'order')

    const current = order.status
    if (current === 'delivered' && newStatus !== 'cancelled') {
      throw new ValidationError('Cannot change status of delivered order')
    }
    if (current === 'cancelled' && newStatus !== 'cancelled') {
      throw new ValidationError('Cannot change status of cancelled order')
    }

    return this.orderRepo.updateStatus(orderId, newStatus)
  }

  /**
   * Validate selected modifiers against DB: check active, group ownership, min/max.
   * Returns resolved modifier info for snapshot.
   */
  private async validateModifiers(
    selected: SelectedModifier[],
    productId: number,
    tenantId: number,
  ): Promise<
    {
      groupName: string
      optionName: string
      priceDelta: number
      optionId: string
      groupId: string
    }[]
  > {
    if (!this.supabase)
      throw new ValidationError('Supabase client required for modifier validation')

    // Fetch groups for this product
    const { data: groups, error } = await this.supabase
      .from('modifier_groups')
      .select(`
        id, name, min_selections, max_selections, active,
        modifier_options ( id, name, price_delta, active )
      `)
      .eq('product_id', productId)
      .eq('tenant_id', tenantId)
      .eq('active', true)

    if (error) throw new ValidationError(`Failed to fetch modifiers: ${error.message}`)

    // Build lookup
    const groupMap = new Map((groups ?? []).map((g) => [g.id, g]))
    const optionMap = new Map<string, { name: string; price_delta: number; groupId: string }>()
    for (const g of groups ?? []) {
      for (const o of (g.modifier_options ?? []) as any[]) {
        if (o.active) {
          optionMap.set(o.id, { name: o.name, price_delta: o.price_delta, groupId: g.id })
        }
      }
    }

    // Count selections per group
    const groupCounts = new Map<string, number>()
    const result: {
      groupName: string
      optionName: string
      priceDelta: number
      optionId: string
      groupId: string
    }[] = []

    for (const sel of selected) {
      const opt = optionMap.get(sel.modifier_option_id)
      if (!opt)
        throw new ValidationError(`Modifier option ${sel.modifier_option_id} not found or inactive`)
      if (opt.groupId !== sel.modifier_group_id) {
        throw new ValidationError(
          `Option ${sel.modifier_option_id} does not belong to group ${sel.modifier_group_id}`,
        )
      }

      const count = (groupCounts.get(sel.modifier_group_id) ?? 0) + 1
      groupCounts.set(sel.modifier_group_id, count)

      const group = groupMap.get(sel.modifier_group_id)
      if (!group) throw new ValidationError(`Modifier group ${sel.modifier_group_id} not found`)

      result.push({
        groupId: group.id,
        groupName: group.name,
        optionId: sel.modifier_option_id,
        optionName: opt.name,
        priceDelta: Number(opt.price_delta),
      })
    }

    // Validate min/max per group
    for (const [groupId, count] of groupCounts) {
      const group = groupMap.get(groupId)!
      if (count > group.max_selections) {
        throw new ValidationError(
          `Group "${group.name}": max ${group.max_selections} selections, got ${count}`,
        )
      }
    }

    return result
  }

  /**
   * Write structured order_line_items + order_line_item_modifiers after order creation.
   */
  private async writeOrderLineItems(
    orderId: number,
    tenantId: number,
    items: OrderItemInput[],
    productMap: Map<number, any>,
    modifiersByItem: Map<
      number,
      {
        groupName: string
        optionName: string
        priceDelta: number
        optionId?: string
        groupId?: string
      }[]
    >,
  ): Promise<void> {
    if (!this.supabase) return

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) continue

      const itemModifiers = modifiersByItem.get(item.productId) ?? []
      const modifierDelta = itemModifiers.reduce((sum, m) => sum + m.priceDelta, 0)
      const unitPrice = product.price + modifierDelta
      const subtotal = unitPrice * item.quantity

      const { data: lineItem, error: liError } = await this.supabase
        .from('order_line_items')
        .insert({
          tenant_id: tenantId,
          order_id: orderId,
          product_id: item.productId,
          product_name: product.name,
          unit_price: unitPrice,
          quantity: item.quantity,
          subtotal,
        })
        .select('id')
        .single()

      if (liError || !lineItem) {
        console.error('Failed to write order_line_item:', liError)
        continue
      }

      // Write modifier snapshots
      if (itemModifiers.length > 0) {
        const modifierRows = itemModifiers.map((m) => ({
          tenant_id: tenantId,
          order_line_item_id: lineItem.id,
          modifier_option_id: (m as any).optionId ?? '',
          modifier_group_name: m.groupName,
          modifier_name: m.optionName,
          price_delta: m.priceDelta,
        }))

        const { error: modError } = await this.supabase
          .from('order_line_item_modifiers')
          .insert(modifierRows)

        if (modError) {
          console.error('Failed to write order_line_item_modifiers:', modError)
        }
      }
    }
  }

  private async upsertCustomer(tenantId: number, customer: CustomerInput): Promise<number> {
    const existing = await this.customerRepo.findByEmailAndPhone(
      tenantId,
      customer.email,
      customer.phone,
    )

    if (existing) {
      await this.customerRepo.update(existing.id, { name: customer.name })
      return existing.id
    }

    const created = await this.customerRepo.create({
      tenant_id: tenantId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    })
    return created.id
  }
}
