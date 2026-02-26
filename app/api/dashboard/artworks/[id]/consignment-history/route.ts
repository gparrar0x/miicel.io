/**
 * GET /api/dashboard/artworks/[id]/consignment-history - Full history for single artwork
 *
 * Returns chronological list of all consignment assignments for an artwork
 * Includes active and inactive assignments for audit trail
 *
 * Security:
 * - Auth required
 * - Tenant isolation via RLS
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/dashboard/artworks/[id]/consignment-history?tenant_id=123
 *
 * Response:
 * {
 *   work: {
 *     id: number,
 *     title: string,
 *     price: number,
 *     image_url: string | null
 *   },
 *   assignments: Array<{
 *     id: number,
 *     location_id: number,
 *     location_name: string,
 *     city: string,
 *     status: string,
 *     assigned_date: string,
 *     unassigned_date: string | null,
 *     days_at_location: number | null,
 *     notes: string | null
 *   }>
 * }
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const workId = parseInt(id, 10)

    if (Number.isNaN(workId)) {
      return NextResponse.json({ error: 'Invalid artwork ID' }, { status: 400 })
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

    // Fetch artwork details
    const { data: work, error: workError } = await (supabase as any)
      .from('products')
      .select('id, title, price, image_url')
      .eq('id', workId)
      .eq('tenant_id', tenantId)
      .maybeSingle()

    if (workError || !work) {
      return NextResponse.json(
        { error: 'Artwork not found or not owned by tenant' },
        { status: 404 },
      )
    }

    // Fetch all assignments (active + historical)
    const { data: assignments, error: assignmentsError } = await (supabase as any)
      .from('artwork_consignments')
      .select(`
        id,
        location_id,
        status,
        assigned_date,
        unassigned_date,
        notes,
        location:consignment_locations (
          name,
          city
        )
      `)
      .eq('work_id', workId)
      .eq('tenant_id', tenantId)
      .order('assigned_date', { ascending: false })

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }

    // Calculate days at location for each assignment
    const enrichedAssignments =
      assignments?.map((assignment: any) => {
        const assignedDate = new Date(assignment.assigned_date)
        let daysAtLocation: number | null = null

        if (assignment.unassigned_date) {
          const unassignedDate = new Date(assignment.unassigned_date)
          daysAtLocation = Math.floor(
            (unassignedDate.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24),
          )
        } else {
          // Still active, calculate days since assignment
          const now = new Date()
          daysAtLocation = Math.floor(
            (now.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24),
          )
        }

        return {
          id: assignment.id,
          location_id: assignment.location_id,
          location_name: assignment.location?.name || 'Unknown',
          city: assignment.location?.city || 'Unknown',
          status: assignment.status,
          assigned_date: assignment.assigned_date,
          unassigned_date: assignment.unassigned_date,
          days_at_location: daysAtLocation,
          notes: assignment.notes,
        }
      }) || []

    return NextResponse.json({
      work: {
        id: work.id,
        title: work.title,
        price: work.price,
        image_url: work.image_url,
      },
      assignments: enrichedAssignments,
    })
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/dashboard/artworks/[id]/consignment-history:',
      error,
    )
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
