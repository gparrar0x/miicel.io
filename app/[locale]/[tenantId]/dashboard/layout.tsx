/**
 * Dashboard Layout
 * Adds the shared sidebar + header + base styling to all admin dashboard pages.
 * Also blocks search engine indexing for admin/dashboard routes.
 *
 * Auth: Requires authenticated user who is tenant owner
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import type { NavItem } from '@/components/dashboard/sidebar'
import { isEnabled, Flags } from '@/lib/flags'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ tenantId: string; locale: string }>
}

export default async function DashboardLayout({ children, params }: LayoutProps) {
  const { tenantId, locale } = await params
  const supabase = await createClient()

  // Build returnUrl from params (layout doesn't have access to full pathname)
  const dashboardPath = `/${locale}/${tenantId}/dashboard`

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    // Redirect to login with returnUrl
    const returnUrl = encodeURIComponent(dashboardPath)
    redirect(`/${locale}/login?returnUrl=${returnUrl}`)
  }

  // Verify tenant ownership
  const numericId = Number(tenantId)
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug, owner_id, template')
    .eq(Number.isNaN(numericId) ? 'slug' : 'id', Number.isNaN(numericId) ? tenantId : numericId)
    .single()

  if (!tenant) {
    redirect(`/${locale}/${tenantId}`)
  }

  // Check access: superadmin OR owner_id match OR user has owner/tenant_admin role
  const { data: isSuperAdmin } = await supabase.rpc('is_superadmin')
  let hasAccess = isSuperAdmin || tenant.owner_id === user.id

  if (!hasAccess) {
    // Check users table for role-based access (use service role to avoid RLS recursion)
    const supabaseAdmin = createServiceRoleClient()
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('role, tenant_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    hasAccess = !!(userRecord &&
      ['owner', 'tenant_admin'].includes(userRecord.role) &&
      userRecord.tenant_id === tenant.id)
  }

  if (!hasAccess) {
    redirect(`/${locale}/${tenantId}`)
  }

  const t = await getTranslations('Dashboard')

  // Check feature flags based on tenant template
  const flagContext = { tenantId: tenant.id, tenantTemplate: tenant.template }
  const showConsignments = await isEnabled(Flags.CONSIGNMENTS, flagContext)

  const navItems: NavItem[] = [
    { name: t('navDashboard') || 'Dashboard', href: `/${locale}/${tenantId}/dashboard`, icon: 'analytics' },
    { name: t('navProducts') || 'Productos', href: `/${locale}/${tenantId}/dashboard/products`, icon: 'products' },
    { name: t('navOrders') || 'Pedidos', href: `/${locale}/${tenantId}/dashboard/orders`, icon: 'orders' },
    ...(showConsignments ? [{ name: t('navConsignments') || 'Consignaciones', href: `/${locale}/${tenantId}/dashboard/consignments`, icon: 'consignments' as const }] : []),
    { name: t('navSettings') || 'Ajustes', href: `/${locale}/${tenantId}/dashboard/settings`, icon: 'settings' },
  ]

  return (
    <DashboardShell navItems={navItems}>
      {children}
    </DashboardShell>
  )
}
