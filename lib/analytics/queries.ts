/**
 * Analytics Query Helpers
 *
 * Helper functions to fetch analytics data from materialized views
 * Performance target: <500ms for 30-day ranges
 *
 * Design:
 * - Uses materialized views for pre-computed aggregations
 * - Date filtering on indexed columns (tenant_id, order_date)
 * - Returns empty arrays gracefully for new tenants
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type SupabaseType = SupabaseClient<Database>

/**
 * Summary metrics for dashboard header
 */
export interface SummaryMetrics {
  total_revenue: number
  total_orders: number
  avg_order_value: number
  total_discounts: number
}

/**
 * Top product by revenue
 */
export interface TopProduct {
  product_id: number
  product_name: string
  units_sold: number
  revenue: number
}

/**
 * Category aggregation
 */
export interface CategoryMetrics {
  category: string
  order_count: number
  units_sold: number
  revenue: number
}

/**
 * Payment method breakdown
 */
export interface PaymentMethodMetrics {
  payment_method: string
  order_count: number
  revenue: number
}

/**
 * Discount source/code aggregation
 */
export interface DiscountMetrics {
  discount_source: string
  discount_code: string | null
  usage_count: number
  total_discount_amount: number
  avg_discount_percentage: number | null
}

/**
 * Get summary metrics (revenue, orders, AOV, discounts) for date range
 */
export async function getSummaryMetrics(
  supabase: SupabaseType,
  tenantId: number,
  dateFrom: string,
  dateTo: string,
): Promise<SummaryMetrics> {
  // Query orders directly for real-time summary metrics
  const { data, error } = await supabase
    .from('orders')
    .select('total')
    .eq('tenant_id', tenantId)
    .not('status', 'in', '(cancelled)')
    .gte('created_at', dateFrom)
    .lt('created_at', dateTo)

  if (error) {
    console.error('Error fetching summary metrics:', error)
    return {
      total_revenue: 0,
      total_orders: 0,
      avg_order_value: 0,
      total_discounts: 0,
    }
  }

  if (!data || data.length === 0) {
    return {
      total_revenue: 0,
      total_orders: 0,
      avg_order_value: 0,
      total_discounts: 0,
    }
  }

  const totalRevenue = data.reduce((sum, order) => sum + Number(order.total), 0)
  const totalOrders = data.length
  // Note: discounts are tracked in mv_discounts view, not in orders table
  // We'll get discounts from the materialized view instead
  const totalDiscounts = 0

  return {
    total_revenue: totalRevenue,
    total_orders: totalOrders,
    avg_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    total_discounts: totalDiscounts,
  }
}

/**
 * Get top 10 products by revenue for date range
 * Queries the mv_top_products materialized view directly
 */
export async function getTopProducts(
  supabase: SupabaseType,
  tenantId: number,
  dateFrom: string,
  dateTo: string,
): Promise<TopProduct[]> {
  // Query from order_items joined with products for real-time data
  // since materialized views may not be accessible via Supabase client
  const { data: orders, error } = await supabase
    .from('orders')
    .select('items')
    .eq('tenant_id', tenantId)
    .not('status', 'in', '(cancelled)')
    .gte('created_at', dateFrom)
    .lt('created_at', dateTo)

  if (error) {
    console.error('Error fetching top products:', error)
    return []
  }

  // Aggregate products from order items
  const productMap = new Map<number, TopProduct>()

  for (const order of orders || []) {
    const items = order.items as Array<{
      product_id?: number
      productId?: number
      name?: string
      product_name?: string
      quantity?: number
      price?: number
      total?: number
    }> | null

    if (!items || !Array.isArray(items)) continue

    for (const item of items) {
      const productId = item.product_id || item.productId
      const productName = item.name || item.product_name || 'Unknown'
      const quantity = item.quantity || 1
      const itemTotal = item.total || (item.price || 0) * quantity

      if (!productId) continue

      const existing = productMap.get(productId)
      if (existing) {
        existing.units_sold += quantity
        existing.revenue += Number(itemTotal)
      } else {
        productMap.set(productId, {
          product_id: productId,
          product_name: productName,
          units_sold: quantity,
          revenue: Number(itemTotal),
        })
      }
    }
  }

  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
}

/**
 * Get category breakdown for date range
 * Aggregates from order items since materialized views may not be accessible
 */
export async function getTopCategories(
  supabase: SupabaseType,
  tenantId: number,
  dateFrom: string,
  dateTo: string,
): Promise<CategoryMetrics[]> {
  // Get orders and aggregate by category from items
  const { data: orders, error } = await supabase
    .from('orders')
    .select('items')
    .eq('tenant_id', tenantId)
    .not('status', 'in', '(cancelled)')
    .gte('created_at', dateFrom)
    .lt('created_at', dateTo)

  if (error) {
    console.error('Error fetching top categories:', error)
    return []
  }

  // Aggregate by category from order items
  const categoryMap = new Map<string, CategoryMetrics>()
  const orderCategories = new Set<string>()

  for (const order of orders || []) {
    orderCategories.clear()
    const items = order.items as Array<{
      category?: string
      quantity?: number
      price?: number
      total?: number
    }> | null

    if (!items || !Array.isArray(items)) continue

    for (const item of items) {
      const category = item.category || 'Sin categoría'
      const quantity = item.quantity || 1
      const itemTotal = item.total || (item.price || 0) * quantity

      orderCategories.add(category)

      const existing = categoryMap.get(category)
      if (existing) {
        existing.units_sold += quantity
        existing.revenue += Number(itemTotal)
      } else {
        categoryMap.set(category, {
          category,
          order_count: 0,
          units_sold: quantity,
          revenue: Number(itemTotal),
        })
      }
    }

    // Increment order_count for each category in this order
    for (const cat of orderCategories) {
      const entry = categoryMap.get(cat)
      if (entry) entry.order_count += 1
    }
  }

  return Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue)
}

/**
 * Get payment method breakdown for date range
 * Aggregates from orders table directly
 */
export async function getPaymentMethods(
  supabase: SupabaseType,
  tenantId: number,
  dateFrom: string,
  dateTo: string,
): Promise<PaymentMethodMetrics[]> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('payment_method, total')
    .eq('tenant_id', tenantId)
    .not('status', 'in', '(cancelled)')
    .gte('created_at', dateFrom)
    .lt('created_at', dateTo)

  if (error) {
    console.error('Error fetching payment methods:', error)
    return []
  }

  // Aggregate by payment_method
  const methodMap = new Map<string, PaymentMethodMetrics>()

  for (const order of orders || []) {
    const method = order.payment_method || 'No especificado'
    const existing = methodMap.get(method)

    if (existing) {
      existing.order_count += 1
      existing.revenue += Number(order.total)
    } else {
      methodMap.set(method, {
        payment_method: method,
        order_count: 1,
        revenue: Number(order.total),
      })
    }
  }

  return Array.from(methodMap.values()).sort((a, b) => b.revenue - a.revenue)
}

/**
 * Get discount usage breakdown for date range
 * Reads from orders.discount_metadata JSONB column
 */
export async function getDiscounts(
  supabase: SupabaseType,
  tenantId: number,
  dateFrom: string,
  dateTo: string,
): Promise<DiscountMetrics[]> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('discount_metadata')
    .eq('tenant_id', tenantId)
    .not('status', 'in', '(cancelled)')
    .not('discount_metadata', 'is', null)
    .gte('created_at', dateFrom)
    .lt('created_at', dateTo)

  if (error) {
    console.error('Error fetching discounts:', error)
    return []
  }

  // Aggregate by discount source/code
  const discountMap = new Map<string, DiscountMetrics>()

  for (const order of orders || []) {
    const discount = order.discount_metadata as {
      source?: string
      code?: string
      type?: string
      value?: number
      amount?: number
    } | null

    if (!discount || !discount.source) continue

    const key = discount.code || discount.source
    const existing = discountMap.get(key)

    if (existing) {
      existing.usage_count += 1
      existing.total_discount_amount += Number(discount.amount || 0)
    } else {
      discountMap.set(key, {
        discount_source: discount.source,
        discount_code: discount.code || null,
        usage_count: 1,
        total_discount_amount: Number(discount.amount || 0),
        avg_discount_percentage: discount.type === 'percentage' ? discount.value || null : null,
      })
    }
  }

  return Array.from(discountMap.values()).sort(
    (a, b) => b.total_discount_amount - a.total_discount_amount,
  )
}
