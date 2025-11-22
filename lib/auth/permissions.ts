/**
 * Client-side permission checks for UI rendering
 */

import { createClient } from '@/lib/supabase/client'

export interface PermissionCheckResult {
  isSuperAdmin: boolean
  isOwner: boolean
  canAccessDashboard: boolean
}

/**
 * Check if current user can access dashboard for given tenant
 */
export async function checkDashboardAccess(tenantSlug: string): Promise<PermissionCheckResult> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { isSuperAdmin: false, isOwner: false, canAccessDashboard: false }
    }

    // Get tenant data
    const { data: tenant } = await supabase
      .from('tenants')
      .select('owner_id')
      .eq('slug', tenantSlug)
      .single()

    if (!tenant) {
      return { isSuperAdmin: false, isOwner: false, canAccessDashboard: false }
    }

    // Check if superadmin (via API call to avoid exposing env vars)
    const { data: superAdminCheck } = await fetch('/api/auth/check-superadmin').then(r => r.json()).catch(() => ({ data: false }))
    const isSuperAdmin = !!superAdminCheck

    const isOwner = user.id === tenant.owner_id
    const canAccessDashboard = isSuperAdmin || isOwner

    return { isSuperAdmin, isOwner, canAccessDashboard }
  } catch (error) {
    console.error('Error checking dashboard access:', error)
    return { isSuperAdmin: false, isOwner: false, canAccessDashboard: false }
  }
}

