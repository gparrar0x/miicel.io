/**
 * Dashboard Layout
 * Adds the shared sidebar + header + base styling to all admin dashboard pages.
 * Also blocks search engine indexing for admin/dashboard routes.
 */

import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
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
