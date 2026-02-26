/**
 * GET /api/dashboard/consignment-locations - List consignment locations
 * POST /api/dashboard/consignment-locations - Create new location
 *
 * Security:
 * - Authentication required
 * - RLS enforces tenant isolation
 * - Only tenant owners can manage locations
 *
 * Performance:
 * - Indexed queries on tenant_id, status
 * - Pagination (default 25, max 100)
 */

import { NextResponse } from 'next/server'
import { createLocationSchema, listLocationsQuerySchema } from '@/lib/schemas/consignment'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

/**
 * GET /api/dashboard/consignment-locations
 *
 * Query params:
 * - tenant_id: number (required)
 * - search: string (optional, searches name)
 * - city: string (optional)
 * - status: 'active' | 'inactive' | 'archived' (optional)
 * - page: number (default 1)
 * - per_page: number (default 25, max 100)
 *
 * Response:
 * {
 *   items: ConsignmentLocation[],
 *   total: number,
 *   page: number,
 *   per_page: number,
 *   has_next: boolean
 * }
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const tenantIdStr = searchParams.get('tenant_id')

    if (!tenantIdStr || Number.isNaN(parseInt(tenantIdStr, 10))) {
      return NextResponse.json({ error: 'Valid tenant_id required' }, { status: 400 })
    }

    const tenantId = parseInt(tenantIdStr, 10)

    // Validate query params (filter out null values)
    const queryValidation = listLocationsQuerySchema.safeParse({
      search: searchParams.get('search') ?? undefined,
      city: searchParams.get('city') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      per_page: searchParams.get('per_page') ?? undefined,
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.flatten() },
        { status: 400 },
      )
    }

    const { search, city, status, page, per_page } = queryValidation.data

    // Verify tenant ownership
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq('id', tenantId)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const isSuperAdmin = user.email === 'gparrar@skywalking.dev'
    if (!isSuperAdmin && tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden. Not tenant owner.' }, { status: 403 })
    }

    // Use service role client for superadmin to bypass RLS
    const dbClient = isSuperAdmin ? createServiceRoleClient() : supabase

    // Build query
    let query = (dbClient as any)
      .from('consignment_locations')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (city) {
      query = query.eq('city', city)
    }
    if (status) {
      query = query.eq('status', status)
    }

    // Pagination
    const from = (page - 1) * per_page
    const to = from + per_page - 1
    query = query.range(from, to)

    const { data: locations, error, count } = await query

    if (error) {
      console.error('Error fetching locations:', error)
      return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
    }

    return NextResponse.json({
      items: locations || [],
      total: count || 0,
      page,
      per_page,
      has_next: count ? from + per_page < count : false,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/dashboard/consignment-locations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/dashboard/consignment-locations
 *
 * Body:
 * {
 *   tenant_id: number,
 *   name: string,
 *   city: string,
 *   country: string,
 *   description?: string,
 *   address?: string,
 *   latitude?: number,
 *   longitude?: number,
 *   contact_name?: string,
 *   contact_email?: string,
 *   contact_phone?: string
 * }
 *
 * Response: Created location object
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    // Parse body
    const body = await request.json()
    const tenantId = body.tenant_id

    if (!tenantId || Number.isNaN(parseInt(tenantId, 10))) {
      return NextResponse.json({ error: 'Valid tenant_id required' }, { status: 400 })
    }

    // Validate input
    const validation = createLocationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      )
    }

    // Verify tenant ownership
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq('id', tenantId)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const isSuperAdmin = user.email === 'gparrar@skywalking.dev'
    if (!isSuperAdmin && tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden. Not tenant owner.' }, { status: 403 })
    }

    // Use service role client for superadmin to bypass RLS
    const dbClient = isSuperAdmin ? createServiceRoleClient() : supabase

    // Insert location
    const { data: location, error: insertError } = await (dbClient as any)
      .from('consignment_locations')
      .insert({
        tenant_id: tenantId,
        ...validation.data,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating location:', insertError)
      return NextResponse.json({ error: 'Failed to create location' }, { status: 500 })
    }

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/dashboard/consignment-locations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
