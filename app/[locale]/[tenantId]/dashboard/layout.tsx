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
import { Sidebar, type NavItem } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

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
    .select('id, slug, owner_id')
    .eq(Number.isNaN(numericId) ? 'slug' : 'id', Number.isNaN(numericId) ? tenantId : numericId)
    .single()

  if (!tenant) {
    redirect(`/${locale}/${tenantId}`)
  }

  // Check access: owner_id match OR user has owner/tenant_admin role for this tenant
  let hasAccess = tenant.owner_id === user.id

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

  const navItems: NavItem[] = [
    { name: t('navDashboard') || 'Dashboard', href: `/${locale}/${tenantId}/dashboard`, icon: 'dashboard' },
    { name: t('navProducts') || 'Productos', href: `/${locale}/${tenantId}/dashboard/products`, icon: 'products' },
    { name: t('navOrders') || 'Pedidos', href: `/${locale}/${tenantId}/dashboard/orders`, icon: 'orders' },
    { name: t('navSettings') || 'Ajustes', href: `/${locale}/${tenantId}/dashboard/settings`, icon: 'settings' },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar brand="Miicel" navItems={navItems} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
