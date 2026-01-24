/**
 * POST /api/dashboard/consignment-locations/[id]/artworks - Assign artwork to location
 * GET /api/dashboard/consignment-locations/[id]/artworks - List artworks at location
 *
 * Security:
 * - Auth required
 * - RLS enforces tenant isolation
 * - Prevents duplicate active assignments
 */

import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { createAssignmentSchema } from '@/lib/schemas/consignment'

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/dashboard/consignment-locations/[id]/artworks?tenant_id=123
 *
 * Returns artworks assigned to this location with details
 *
 * Response:
 * {
 *   items: Array<{
 *     id: number,
 *     work_id: number,
 *     status: string,
 *     assigned_date: string,
 *     unassigned_date: string | null,
 *     notes: string | null,
 *     work: { id, title, price, image_url }
 *   }>
 * }
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const locationId = parseInt(id)

    if (isNaN(locationId)) {
      return NextResponse.json({ error: 'Invalid location ID' }, { status: 400 })
    }

    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    // Parse tenant_id
    const { searchParams } = new URL(request.url)
    const tenantIdStr = searchParams.get('tenant_id')

    if (!tenantIdStr || isNaN(parseInt(tenantIdStr))) {
      return NextResponse.json({ error: 'Valid tenant_id required' }, { status: 400 })
    }

    const tenantId = parseInt(tenantIdStr)

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

    // Fetch assignments with product details
    const { data: assignments, error } = await (dbClient as any)
      .from('artwork_consignments')
      .select(
        `
        id,
        work_id,
        status,
        assigned_date,
        unassigned_date,
        notes,
        work:products (
          id,
          title,
          price,
          image_url
        )
      `
      )
      .eq('location_id', locationId)
      .eq('tenant_id', tenantId)
      .order('assigned_date', { ascending: false })

    if (error) {
      console.error('Error fetching assignments:', error)
      return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 })
    }

    return NextResponse.json({ items: assignments || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/.../artworks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/dashboard/consignment-locations/[id]/artworks
 *
 * Body:
 * {
 *   tenant_id: number,
 *   work_id: number,
 *   status?: 'in_gallery' | 'in_transit' | 'pending',
 *   notes?: string
 * }
 *
 * Validates:
 * - Artwork belongs to tenant
 * - No active assignment exists for same work+location
 *
 * Response: Created assignment object
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const locationId = parseInt(id)

    if (isNaN(locationId)) {
      return NextResponse.json({ error: 'Invalid location ID' }, { status: 400 })
    }

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

    if (!tenantId || isNaN(parseInt(tenantId))) {
      return NextResponse.json({ error: 'Valid tenant_id required' }, { status: 400 })
    }

    // Validate input
    const validation = createAssignmentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { work_id, status, notes } = validation.data

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

    // Verify location exists and belongs to tenant
    const { data: location, error: locationError } = await (dbClient as any)
      .from('consignment_locations')
      .select('id')
      .eq('id', locationId)
      .eq('tenant_id', tenantId)
      .maybeSingle()

    if (locationError || !location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    // Verify artwork belongs to tenant
    const { data: artwork, error: artworkError } = await dbClient
      .from('products')
      .select('id, tenant_id')
      .eq('id', work_id)
      .eq('tenant_id', tenantId)
      .maybeSingle()

    if (artworkError || !artwork) {
      return NextResponse.json({ error: 'Artwork not found or not owned by tenant' }, { status: 404 })
    }

    // Check for existing active assignment (constraint enforced at DB level too)
    const { data: existingAssignment } = await (dbClient as any)
      .from('artwork_consignments')
      .select('id')
      .eq('work_id', work_id)
      .eq('location_id', locationId)
      .is('unassigned_date', null)
      .not('status', 'in', '(sold,returned)')
      .maybeSingle()

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Artwork already assigned to this location' },
        { status: 409 }
      )
    }

    // Create assignment
    const { data: assignment, error: insertError } = await (dbClient as any)
      .from('artwork_consignments')
      .insert({
        work_id,
        location_id: locationId,
        tenant_id: tenantId,
        status,
        notes,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating assignment:', insertError)
      return NextResponse.json({ error: 'Failed to assign artwork' }, { status: 500 })
    }

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/.../artworks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
