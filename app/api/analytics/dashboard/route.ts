/**
 * GET /api/analytics/dashboard - Analytics Dashboard Data
 *
 * Returns aggregated analytics for a tenant in a date range:
 * - Summary metrics (revenue, orders, AOV, discounts)
 * - Top 10 products by revenue
 * - Category breakdown
 * - Payment method distribution
 * - Discount usage by source/code
 *
 * Uses materialized views for performance (<500ms target)
 * RLS enforced via tenant ownership check
 *
 * Performance: Indexed queries on mv_* tables
 * Security: Tenant ownership verified before data access
 */

import { NextResponse } from 'next/server'
import {
  getDiscounts,
  getPaymentMethods,
  getSummaryMetrics,
  getTopCategories,
  getTopProducts,
} from '@/lib/analytics/queries'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/analytics/dashboard - Get analytics dashboard data
 *
 * Query params:
 * - tenant_id: number (required)
 * - date_from: string (ISO date: 2025-01-01, required)
 * - date_to: string (ISO date: 2025-01-31, required)
 *
 * Response:
 * {
 *   summary: {
 *     total_revenue: number,
 *     total_orders: number,
 *     avg_order_value: number,
 *     total_discounts: number
 *   },
 *   top_products: TopProduct[],
 *   top_categories: CategoryMetrics[],
 *   payment_methods: PaymentMethodMetrics[],
 *   discounts: DiscountMetrics[]
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Step 1: Validate required query parameters
    const tenantIdParam = searchParams.get('tenant_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    if (!tenantIdParam) {
      return NextResponse.json({ error: 'tenant_id is required' }, { status: 400 })
    }

    if (!dateFrom || !dateTo) {
      return NextResponse.json({ error: 'date_from and date_to are required' }, { status: 400 })
    }

    // Validate date format (basic ISO date check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateFrom) || !dateRegex.test(dateTo)) {
      return NextResponse.json(
        { error: 'date_from and date_to must be in YYYY-MM-DD format' },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    // Step 2: Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    // Step 3: Resolve tenant - accept both numeric ID and slug
    const numericId = parseInt(tenantIdParam, 10)
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq(
        Number.isNaN(numericId) ? 'slug' : 'id',
        Number.isNaN(numericId) ? tenantIdParam : numericId,
      )
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
    }

    const isSuperadmin = user.email?.toLowerCase().trim() === 'gparrar@skywalking.dev'

    if (!isSuperadmin && tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this tenant.' }, { status: 403 })
    }

    // Step 4: Fetch analytics data in parallel
    // Adjust dateTo to include entire end date (add +1 day for < comparison)
    const adjustedDateTo = new Date(dateTo)
    adjustedDateTo.setDate(adjustedDateTo.getDate() + 1)
    const dateToExclusive = adjustedDateTo.toISOString().split('T')[0]

    const [summary, topProducts, topCategories, paymentMethods, discounts] = await Promise.all([
      getSummaryMetrics(supabase, tenant.id, dateFrom, dateToExclusive),
      getTopProducts(supabase, tenant.id, dateFrom, dateToExclusive),
      getTopCategories(supabase, tenant.id, dateFrom, dateToExclusive),
      getPaymentMethods(supabase, tenant.id, dateFrom, dateToExclusive),
      getDiscounts(supabase, tenant.id, dateFrom, dateToExclusive),
    ])

    // Calculate items sold from top products
    const itemsSold = topProducts.reduce((sum, p) => sum + p.units_sold, 0)

    // Step 5: Return aggregated dashboard data
    // Map to frontend expected field names
    return NextResponse.json({
      summary: {
        total_sales: summary.total_revenue,
        total_transactions: summary.total_orders,
        average_ticket: summary.avg_order_value,
        items_sold: itemsSold,
      },
      top_products: topProducts.slice(0, 10).map((p, i) => ({
        rank: i + 1,
        product_name: p.product_name,
        category: '', // Not available from current query
        quantity_sold: p.units_sold,
        revenue: p.revenue,
        percentage: summary.total_revenue > 0 ? (p.revenue / summary.total_revenue) * 100 : 0,
      })),
      top_categories: topCategories.map((c) => ({
        name: c.category,
        items_sold: c.units_sold,
        revenue: c.revenue,
        percentage: summary.total_revenue > 0 ? (c.revenue / summary.total_revenue) * 100 : 0,
      })),
      payment_methods: paymentMethods.map((p) => ({
        method: p.payment_method,
        transaction_count: p.order_count,
        total_amount: p.revenue,
        percentage: summary.total_revenue > 0 ? (p.revenue / summary.total_revenue) * 100 : 0,
      })),
      discounts: discounts.map((d) => ({
        source: d.discount_source,
        usage_count: d.usage_count,
        total_discount_amount: d.total_discount_amount,
        affected_orders: d.usage_count,
      })),
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/analytics/dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    )
  }
}
