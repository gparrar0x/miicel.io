/**
 * DELETE /api/dashboard/consignment-locations/[id]/artworks/[artworkId]
 *
 * Removes artwork from location by setting unassigned_date
 * Does not delete record (audit trail preservation)
 *
 * Security:
 * - Auth required
 * - Tenant ownership verified
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteParams = {
  params: Promise<{ id: string; artworkId: string }>
}

/**
 * DELETE /api/dashboard/consignment-locations/[id]/artworks/[artworkId]?tenant_id=123
 *
 * Sets unassigned_date to NOW() to mark assignment as inactive
 *
 * Response: { success: true, assignment: { ... } }
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id, artworkId } = await params
    const locationId = parseInt(id, 10)
    const workId = parseInt(artworkId, 10)

    if (Number.isNaN(locationId) || Number.isNaN(workId)) {
      return NextResponse.json({ error: 'Invalid location or artwork ID' }, { status: 400 })
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

    if (!tenantIdStr || Number.isNaN(parseInt(tenantIdStr, 10))) {
      return NextResponse.json({ error: 'Valid tenant_id required' }, { status: 400 })
    }

    const tenantId = parseInt(tenantIdStr, 10)

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

    // Find active assignment
    const { data: existingAssignment, error: findError } = await (supabase as any)
      .from('artwork_consignments')
      .select('*')
      .eq('work_id', workId)
      .eq('location_id', locationId)
      .eq('tenant_id', tenantId)
      .is('unassigned_date', null)
      .maybeSingle()

    if (findError) {
      console.error('Error finding assignment:', findError)
      return NextResponse.json({ error: 'Failed to find assignment' }, { status: 500 })
    }

    if (!existingAssignment) {
      return NextResponse.json({ error: 'Active assignment not found' }, { status: 404 })
    }

    // Update assignment to mark as unassigned
    const { data: assignment, error: updateError } = await (supabase as any)
      .from('artwork_consignments')
      .update({
        unassigned_date: new Date().toISOString(),
        status: 'returned', // Default status when unassigning
      })
      .eq('id', existingAssignment.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error removing assignment:', updateError)
      return NextResponse.json({ error: 'Failed to remove artwork' }, { status: 500 })
    }

    return NextResponse.json({ success: true, assignment })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/.../artworks/[artworkId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
