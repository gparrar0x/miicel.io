/**
 * GET /api/dashboard/consignment-locations/[id] - Get single location
 * PATCH /api/dashboard/consignment-locations/[id] - Update location
 * DELETE /api/dashboard/consignment-locations/[id] - Delete location
 *
 * Security:
 * - Authentication required
 * - RLS enforces tenant isolation
 * - Cascade delete removes all artwork_consignments
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateLocationSchema } from '@/lib/schemas/consignment'

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/dashboard/consignment-locations/[id]?tenant_id=123
 *
 * Response: ConsignmentLocation object
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

    // Fetch location
    const { data: location, error } = await (supabase as any)
      .from('consignment_locations')
      .select('*')
      .eq('id', locationId)
      .eq('tenant_id', tenantId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching location:', error)
      return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 })
    }

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error('Unexpected error in GET /api/dashboard/consignment-locations/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/dashboard/consignment-locations/[id]
 *
 * Body: Partial<CreateLocationInput> + tenant_id
 *
 * Response: Updated location object
 */
export async function PATCH(request: Request, { params }: RouteParams) {
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
    const validation = updateLocationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
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

    // Update location
    const { data: location, error: updateError } = await (supabase as any)
      .from('consignment_locations')
      .update(validation.data)
      .eq('id', locationId)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating location:', updateError)
      return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
    }

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error('Unexpected error in PATCH /api/dashboard/consignment-locations/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/dashboard/consignment-locations/[id]?tenant_id=123
 *
 * Cascade deletes all artwork_consignments for this location
 *
 * Response: { success: true }
 */
export async function DELETE(request: Request, { params }: RouteParams) {
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

    // Delete location (cascade deletes consignments)
    const { error: deleteError } = await (supabase as any)
      .from('consignment_locations')
      .delete()
      .eq('id', locationId)
      .eq('tenant_id', tenantId)

    if (deleteError) {
      console.error('Error deleting location:', deleteError)
      return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/dashboard/consignment-locations/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
