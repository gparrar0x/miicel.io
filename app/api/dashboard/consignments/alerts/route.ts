/**
 * GET /api/dashboard/consignments/alerts - Get artworks with long gallery stays
 *
 * Returns artworks that have been in a gallery for extended periods
 * Helps artists identify stale inventory that may need repositioning
 *
 * Security:
 * - Auth required
 * - Tenant isolation via RLS
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/dashboard/consignments/alerts?tenant_id=123&min_days=60
 *
 * Query params:
 * - tenant_id: number (required)
 * - min_days: number (default 60, minimum days in gallery to trigger alert)
 *
 * Response:
 * {
 *   items: Array<{
 *     assignment_id: number,
 *     work_id: number,
 *     work_title: string,
 *     work_price: number,
 *     work_image_url: string | null,
 *     location_id: number,
 *     location_name: string,
 *     city: string,
 *     assigned_date: string,
 *     days_in_gallery: number,
 *     status: string
 *   }>
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
    const minDaysStr = searchParams.get('min_days') || '60'

    if (!tenantIdStr || Number.isNaN(parseInt(tenantIdStr, 10))) {
      return NextResponse.json({ error: 'Valid tenant_id required' }, { status: 400 })
    }

    const tenantId = parseInt(tenantIdStr, 10)
    const minDays = parseInt(minDaysStr, 10)

    if (Number.isNaN(minDays) || minDays < 1) {
      return NextResponse.json({ error: 'min_days must be >= 1' }, { status: 400 })
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

    // Calculate cutoff date
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - minDays)
    const cutoffISO = cutoffDate.toISOString()

    // Fetch artworks assigned before cutoff and still active
    const { data: assignments, error } = await (supabase as any)
      .from('artwork_consignments')
      .select(
        `
        id,
        work_id,
        location_id,
        assigned_date,
        status,
        work:products (
          title,
          price,
          image_url
        ),
        location:consignment_locations (
          name,
          city
        )
      `,
      )
      .eq('tenant_id', tenantId)
      .eq('status', 'in_gallery')
      .is('unassigned_date', null)
      .lte('assigned_date', cutoffISO)
      .order('assigned_date', { ascending: true })

    if (error) {
      console.error('Error fetching alerts:', error)
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
    }

    // Calculate days for each item
    const now = new Date()
    const items =
      assignments?.map((assignment: any) => {
        const assignedDate = new Date(assignment.assigned_date)
        const daysInGallery = Math.floor(
          (now.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24),
        )

        return {
          assignment_id: assignment.id,
          work_id: assignment.work_id,
          work_title: assignment.work?.title || 'Unknown',
          work_price: assignment.work?.price || 0,
          work_image_url: assignment.work?.image_url || null,
          location_id: assignment.location_id,
          location_name: assignment.location?.name || 'Unknown',
          city: assignment.location?.city || 'Unknown',
          assigned_date: assignment.assigned_date,
          days_in_gallery: daysInGallery,
          status: assignment.status,
        }
      }) || []

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Unexpected error in GET /api/dashboard/consignments/alerts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
