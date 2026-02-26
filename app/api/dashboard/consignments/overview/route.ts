/**
 * GET /api/dashboard/consignments/overview - Dashboard stats for consignment system
 *
 * Returns aggregated metrics:
 * - Total works in consignment
 * - Active locations count
 * - Works in gallery (active)
 * - Works sold this month
 * - Revenue this month vs last month
 * - Top location by sales
 * - Longest work in gallery (alert)
 *
 * Security:
 * - Auth required
 * - Tenant isolation via RLS
 */

import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

/**
 * GET /api/dashboard/consignments/overview?tenant_id=123
 *
 * Response:
 * {
 *   total_works: number,
 *   active_locations: number,
 *   works_in_gallery: number,
 *   works_sold_this_month: number,
 *   revenue_this_month: number,
 *   revenue_last_month: number,
 *   top_location_by_sales?: {
 *     location_id: number,
 *     location_name: string,
 *     revenue: number
 *   },
 *   longest_in_gallery?: {
 *     work_id: number,
 *     work_title: string,
 *     days: number,
 *     location_name: string
 *   }
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

    // Use service role client for superadmin to bypass RLS
    // Cast to any because consignment tables not in generated types yet
    const dbClient = (isSuperAdmin ? createServiceRoleClient() : supabase) as any

    // Date ranges
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const lastDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    ).toISOString()

    // Metric 1: Total works ever assigned
    const { count: totalWorks } = await dbClient
      .from('artwork_consignments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)

    // Metric 2: Active locations
    const { count: activeLocations } = await dbClient
      .from('consignment_locations')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'active')

    // Metric 3: Works currently in gallery
    const { count: worksInGallery } = await dbClient
      .from('artwork_consignments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'in_gallery')
      .is('unassigned_date', null)

    // Metric 4: Works sold this month
    const { count: worksSoldThisMonth } = await dbClient
      .from('artwork_consignments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'sold')
      .gte('unassigned_date', firstDayThisMonth)

    // Metric 5: Revenue this month (requires products join)
    const { data: soldThisMonth } = await dbClient
      .from('artwork_consignments')
      .select('work_id, work:products(price)')
      .eq('tenant_id', tenantId)
      .eq('status', 'sold')
      .gte('unassigned_date', firstDayThisMonth)

    const revenueThisMonth =
      soldThisMonth?.reduce((sum: number, item: any) => {
        const price = item.work?.price || 0
        return sum + Number(price)
      }, 0) || 0

    // Metric 6: Revenue last month
    const { data: soldLastMonth } = await dbClient
      .from('artwork_consignments')
      .select('work_id, work:products(price)')
      .eq('tenant_id', tenantId)
      .eq('status', 'sold')
      .gte('unassigned_date', firstDayLastMonth)
      .lte('unassigned_date', lastDayLastMonth)

    const revenueLastMonth =
      soldLastMonth?.reduce((sum: number, item: any) => {
        const price = item.work?.price || 0
        return sum + Number(price)
      }, 0) || 0

    // Metric 7: Top location by sales this month
    const { data: locationSales } = await dbClient
      .from('artwork_consignments')
      .select('location_id, location:consignment_locations(name), work:products(price)')
      .eq('tenant_id', tenantId)
      .eq('status', 'sold')
      .gte('unassigned_date', firstDayThisMonth)

    let topLocationBySales
    if (locationSales && locationSales.length > 0) {
      type LocationRevenue = { location_id: number; location_name: string; revenue: number }
      const salesByLocation = locationSales.reduce(
        (acc: Record<number, LocationRevenue>, item: any) => {
          const locId = item.location_id
          const price = item.work?.price || 0
          const locName = item.location?.name || 'Unknown'

          if (!acc[locId]) {
            acc[locId] = { location_id: locId, location_name: locName, revenue: 0 }
          }
          acc[locId].revenue += Number(price)
          return acc
        },
        {} as Record<number, LocationRevenue>,
      )

      type LocationSale = { location_id: number; location_name: string; revenue: number }
      const sorted = (Object.values(salesByLocation) as LocationSale[]).sort(
        (a, b) => b.revenue - a.revenue,
      )
      if (sorted.length > 0) {
        topLocationBySales = sorted[0]
      }
    }

    // Metric 8: Longest work in gallery (alert for stale inventory)
    const { data: oldestWorks } = await dbClient
      .from('artwork_consignments')
      .select(
        `
        work_id,
        assigned_date,
        work:products(title),
        location:consignment_locations(name)
      `,
      )
      .eq('tenant_id', tenantId)
      .eq('status', 'in_gallery')
      .is('unassigned_date', null)
      .order('assigned_date', { ascending: true })
      .limit(1)

    let longestInGallery
    if (oldestWorks && oldestWorks.length > 0) {
      const oldest = oldestWorks[0]
      const assignedDate = new Date(oldest.assigned_date)
      const daysSince = Math.floor((now.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24))

      longestInGallery = {
        work_id: oldest.work_id,
        work_title: oldest.work?.title || 'Unknown',
        days: daysSince,
        location_name: oldest.location?.name || 'Unknown',
      }
    }

    return NextResponse.json({
      total_works: totalWorks || 0,
      active_locations: activeLocations || 0,
      works_in_gallery: worksInGallery || 0,
      works_sold_this_month: worksSoldThisMonth || 0,
      revenue_this_month: revenueThisMonth,
      revenue_last_month: revenueLastMonth,
      top_location_by_sales: topLocationBySales,
      longest_in_gallery: longestInGallery,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/dashboard/consignments/overview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
