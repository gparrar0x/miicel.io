/**
 * GET /api/analytics/export - Export Analytics Data as CSV
 *
 * Exports analytics data for download as CSV file:
 * - Products: product_id, name, units_sold, revenue
 * - Categories: category, order_count, units_sold, revenue
 * - Payments: payment_method, order_count, revenue
 * - Discounts: source, code, usage_count, total_amount, avg_percentage
 *
 * Uses materialized views for performance
 * RLS enforced via tenant ownership check
 *
 * Security: Tenant ownership verified before export
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getTopProducts,
  getTopCategories,
  getPaymentMethods,
  getDiscounts
} from '@/lib/analytics/queries'

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], headers: string[]): string {
  if (data.length === 0) {
    return headers.join(',') + '\n'
  }

  const rows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      // Escape quotes and wrap in quotes if contains comma
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

/**
 * GET /api/analytics/export - Export analytics data as CSV
 *
 * Query params:
 * - type: string (required: "products" | "categories" | "payments" | "discounts")
 * - tenant_id: number (required)
 * - date_from: string (ISO date: 2025-01-01, required)
 * - date_to: string (ISO date: 2025-01-31, required)
 *
 * Response:
 * CSV file download with Content-Type: text/csv
 * Content-Disposition: attachment; filename="analytics-{type}-{date}.csv"
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Step 1: Validate required query parameters
    const type = searchParams.get('type')
    const tenantIdParam = searchParams.get('tenant_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    if (!type) {
      return NextResponse.json(
        { error: 'type is required (products, categories, payments, discounts)' },
        { status: 400 }
      )
    }

    const validTypes = ['products', 'categories', 'payments', 'discounts']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    if (!tenantIdParam) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      )
    }

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'date_from and date_to are required' },
        { status: 400 }
      )
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateFrom) || !dateRegex.test(dateTo)) {
      return NextResponse.json(
        { error: 'date_from and date_to must be in YYYY-MM-DD format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Step 2: Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Step 3: Resolve tenant - accept both numeric ID and slug
    const numericId = parseInt(tenantIdParam, 10)
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq(isNaN(numericId) ? 'slug' : 'id', isNaN(numericId) ? tenantIdParam : numericId)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found.' },
        { status: 404 }
      )
    }

    const isSuperadmin = user.email?.toLowerCase().trim() === 'gparrar@skywalking.dev'

    if (!isSuperadmin && tenant.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden. You do not own this tenant.' },
        { status: 403 }
      )
    }

    // Step 4: Fetch data based on type
    // Adjust dateTo to include entire end date
    const adjustedDateTo = new Date(dateTo)
    adjustedDateTo.setDate(adjustedDateTo.getDate() + 1)
    const dateToExclusive = adjustedDateTo.toISOString().split('T')[0]

    let csvData: string
    let filename: string

    switch (type) {
      case 'products': {
        const products = await getTopProducts(supabase, tenant.id, dateFrom, dateToExclusive)
        csvData = arrayToCSV(products, ['product_id', 'product_name', 'units_sold', 'revenue'])
        filename = `analytics-products-${dateFrom}-${dateTo}.csv`
        break
      }

      case 'categories': {
        const categories = await getTopCategories(supabase, tenant.id, dateFrom, dateToExclusive)
        csvData = arrayToCSV(categories, ['category', 'order_count', 'units_sold', 'revenue'])
        filename = `analytics-categories-${dateFrom}-${dateTo}.csv`
        break
      }

      case 'payments': {
        const payments = await getPaymentMethods(supabase, tenant.id, dateFrom, dateToExclusive)
        csvData = arrayToCSV(payments, ['payment_method', 'order_count', 'revenue'])
        filename = `analytics-payments-${dateFrom}-${dateTo}.csv`
        break
      }

      case 'discounts': {
        const discounts = await getDiscounts(supabase, tenant.id, dateFrom, dateToExclusive)
        csvData = arrayToCSV(discounts, [
          'discount_source',
          'discount_code',
          'usage_count',
          'total_discount_amount',
          'avg_discount_percentage'
        ])
        filename = `analytics-discounts-${dateFrom}-${dateTo}.csv`
        break
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        )
    }

    // Step 5: Return CSV file
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/analytics/export:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
