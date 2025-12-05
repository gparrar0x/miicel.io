'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Package, ShoppingCart, DollarSign, Settings } from 'lucide-react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/components/ui/dashboard-header'
import { Container } from '@/components/ui/container'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  revenue: number
}

export default function AdminDashboard({ params }: { params: Promise<{ tenantId: string; locale: string }> }) {
  const { tenantId, locale } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('Dashboard')
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0
  })
  const [tenantName, setTenantName] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('id, name, config')
          .eq('id', parseInt(tenantId))
          .single()

        if (!tenantData) {
          console.error('Tenant not found')
          return
        }

        const config = tenantData.config as { business_name?: string } | null
        setTenantName(config?.business_name || tenantData.name)

        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('active', true)
          .eq('tenant_id', tenantData.id)

        // Get first day of current month
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const { data: orders } = await supabase
          .from('orders')
          .select('total, created_at')
          .in('status', ['paid', 'preparing', 'ready', 'delivered'])
          .eq('tenant_id', tenantData.id)
          .gte('created_at', firstDayOfMonth)

        const revenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0

        setStats({
          totalProducts: productCount || 0,
          totalOrders: orders?.length || 0,
          revenue
        })
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [tenantId, locale])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(`/${locale}/${tenantId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mii-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-mii-blue border-t-transparent" />
          <p className="text-mii-gray-700 text-sm">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(value)

  return (
    <>
      <AdminSidebar tenant={tenantId} tenantName={tenantName} />
      <div className="lg:pl-mii-sidebar min-h-screen bg-mii-gray-50">
        <DashboardHeader
          title={t('welcomeTitle')}
          subtitle={t('welcomeDesc')}
          actions={
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push(`/${locale}/${tenantId}/dashboard/settings`)}
              data-testid="button-settings"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          }
        />

        <Container className="py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-mii-gap">
            <Card data-testid="stat-card-products" className="gap-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[12px] font-semibold text-mii-gray-600 uppercase tracking-wide">
                    {t('activeProducts')}
                  </p>
                  <p className="text-[28px] font-semibold text-mii-gray-900">{stats.totalProducts}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-mii-blue/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-mii-blue" />
                </div>
              </div>
            </Card>

            <Card data-testid="stat-card-orders" className="gap-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[12px] font-semibold text-mii-gray-600 uppercase tracking-wide">
                    {t('completedOrders')}
                  </p>
                  <p className="text-[28px] font-semibold text-mii-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-mii-blue/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-mii-blue" />
                </div>
              </div>
            </Card>

            <Card data-testid="stat-card-revenue" className="gap-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[12px] font-semibold text-mii-gray-600 uppercase tracking-wide">
                    {t('totalRevenue')}
                  </p>
                  <p className="text-[28px] font-semibold text-mii-gray-900">{formatCurrency(stats.revenue)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-mii-blue/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-mii-blue" />
                </div>
              </div>
            </Card>
          </div>

          <Card data-testid="quick-actions" className="gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-mii-gray-900">{t('quickActions')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-mii-gap">
              <Button
                variant="secondary"
                className="justify-start gap-3"
                onClick={() => router.push(`/${locale}/${tenantId}/dashboard/products`)}
              >
                <Package className="h-5 w-5" />
                {t('products')}
              </Button>
              <Button
                variant="secondary"
                className="justify-start gap-3"
                onClick={() => router.push(`/${locale}/${tenantId}/dashboard/orders`)}
              >
                <ShoppingCart className="h-5 w-5" />
                {t('orders')}
              </Button>
              <Button
                variant="secondary"
                className="justify-start gap-3"
                onClick={() => router.push(`/${locale}/${tenantId}/dashboard/settings`)}
              >
                <Settings className="h-5 w-5" />
                {t('settings')}
              </Button>
              <Button
                variant="secondary"
                className="justify-start gap-3"
                onClick={() => router.push(`/${locale}/${tenantId}`)}
              >
                {t('viewStore')}
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    </>
  )
}
