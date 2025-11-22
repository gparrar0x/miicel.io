/**
 * GET /api/orders/list - List Orders with Filters and Pagination
 *
 * Lists orders with customer details, supporting filters for:
 * - Status (pending, paid, preparing, ready, delivered, cancelled)
 * - Date range (date_from, date_to)
 * - Pagination (limit, offset)
 *
 * Joins with customers table for complete data.
 * RLS policies enforce tenant isolation.
 *
 * Performance: <100ms target with proper indexing
 * Security: Tenant ownership verified, RLS enforced
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { orderListQuerySchema } from '@/lib/schemas/order'

/**
 * GET /api/orders/list - List orders with filters
 *
 * Query params:
 * - tenant_id: number (required)
 * - status: string (filter by status)
 * - date_from: string (ISO date: 2025-01-01)
 * - date_to: string (ISO date: 2025-01-31)
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 *
 * Response:
 * {
 *   orders: Order[],
 *   total_count: number,
 *   page: number,
 *   per_page: number
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Step 1: Validate query parameters
    const queryParams = {
      tenant_id: searchParams.get('tenant_id'),
      status: searchParams.get('status') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    }

    if (!queryParams.tenant_id) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      )
    }

    const validationResult = orderListQuerySchema.safeParse(queryParams)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const {
      tenant_id,
      status,
      date_from,
      date_to,
      limit = 50,
      offset = 0
    } = validationResult.data

    const supabase = await createClient()

    // Step 2: Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Step 3: Verify user owns the tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq('id', tenant_id)
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

    // Step 4: Build query with JOIN to customers
    let query = supabase
      .from('orders')
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone
        )
      `, { count: 'exact' })
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Step 5: Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (date_from) {
      query = query.gte('created_at', date_from)
    }

    if (date_to) {
      // Add one day to include entire end date
      const endDate = new Date(date_to)
      endDate.setDate(endDate.getDate() + 1)
      query = query.lt('created_at', endDate.toISOString())
    }

    // Step 6: Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders. Please try again.' },
        { status: 500 }
      )
    }

    // Step 7: Transform data to flatten customer object
    const orders = (data || []).map(order => ({
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
      updated_at: order.updated_at
    }))

    // Step 8: Return paginated response
    return NextResponse.json({
      orders,
      total_count: count || 0,
      page: Math.floor(offset / limit) + 1,
      per_page: limit
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/orders/list:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
