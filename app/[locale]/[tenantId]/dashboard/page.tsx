'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DollarSign, Package, Settings, ShoppingCart } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import { ChartCard } from '@/components/dashboard/chart-card'
import { DataTable, StatusBadge } from '@/components/dashboard/data-table'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  revenue: number
}

interface OrderRow {
  id: number
  total: number
  status: string
  created_at: string | null
}

export default function AdminDashboard({ params }: { params: Promise<{ tenantId: string; locale: string }> }) {
  const { tenantId, locale } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('Dashboard')

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({ totalProducts: 0, totalOrders: 0, revenue: 0 })
  const [tenantName, setTenantName] = useState('')
  const [ordersChart, setOrdersChart] = useState<{ name: string; value: number }[]>([])
  const [recentOrders, setRecentOrders] = useState<Array<{ id: number; total: number; status: string; created_at: string }>>([])

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [locale],
  )

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const numericId = Number(tenantId)
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('id, name, config, slug')
          .eq(Number.isNaN(numericId) ? 'slug' : 'id', Number.isNaN(numericId) ? tenantId : numericId)
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

        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const { data: orders } = await supabase
          .from('orders')
          .select('id,total,status,created_at')
          .in('status', ['paid', 'preparing', 'ready', 'delivered'])
          .eq('tenant_id', tenantData.id)
          .gte('created_at', firstDayOfMonth)

        const revenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0

        const sortedOrders = (orders || [])
          .filter((o): o is typeof o & { created_at: string } => o.created_at !== null)
          .sort((a, b) => new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf())

        const buckets = new Map<string, number>()
        sortedOrders.forEach((order) => {
          const label = new Date(order.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
          buckets.set(label, (buckets.get(label) || 0) + 1)
        })

        setOrdersChart(Array.from(buckets.entries()).map(([name, value]) => ({ name, value })).slice(-10))
        setRecentOrders(sortedOrders.slice(0, 6))

        setStats({
          totalProducts: productCount || 0,
          totalOrders: orders?.length || 0,
          revenue,
        })
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [tenantId, locale])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-border border-t-foreground" />
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{tenantName || t('welcomeTitle')}</h1>
        <p className="text-muted-foreground">{t('welcomeDesc')}</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t('activeProducts') || 'Productos activos'}
          value={stats.totalProducts.toString()}
          icon={Package}
        />
        <StatCard
          title={t('completedOrders') || 'Pedidos completados'}
          value={stats.totalOrders.toString()}
          change={t('monthlyOrders') || 'Mes actual'}
          icon={ShoppingCart}
        />
        <StatCard
          title={t('totalRevenue') || 'Ingresos'}
          value={currencyFormatter.format(stats.revenue)}
          change={t('monthRevenue') || 'Ingresos mes'}
          icon={DollarSign}
        />
        <StatCard
          title={t('settings') || 'Ajustes'}
          value={t('navDashboard') || 'En línea'}
          icon={Settings}
        />
      </div>

      {/* Charts section */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title={t('ordersTrend') || 'Pedidos por día'} data={ordersChart} />
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground">{t('quickActions')}</h3>
          <div className="mt-4 space-y-3">
            <Button
              className="w-full justify-between"
              variant="secondary"
              onClick={() => router.push(`/${locale}/${tenantId}/dashboard/settings`)}
            >
              {t('settings') || 'Ajustes'}
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              className="w-full justify-between"
              variant="outline"
              onClick={() => router.push(`/${locale}/${tenantId}/dashboard/products`)}
            >
              {t('addProduct') || 'Gestionar productos'}
              <Package className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t('recentOrders') || 'Pedidos recientes'}</h2>
            <p className="text-sm text-muted-foreground">{t('recentOrdersHint') || 'Últimos movimientos del mes'}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/${locale}/${tenantId}/dashboard/orders`)}>
            {t('viewAll') || 'Ver todo'}
          </Button>
        </div>

        <DataTable
          data={recentOrders}
          columns={[
            { key: 'id', header: 'ID', render: (item) => `#${item.id}` },
            {
              key: 'status',
              header: t('status') || 'Estado',
              render: (item) => (
                <StatusBadge
                  status={item.status}
                  variant={item.status === 'delivered' || item.status === 'paid' ? 'default' : 'secondary'}
                />
              ),
            },
            {
              key: 'total',
              header: t('total') || 'Total',
              render: (item) => currencyFormatter.format(item.total),
            },
            {
              key: 'created_at',
              header: t('date') || 'Fecha',
              render: (item) =>
                new Date(item.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'short' }),
            },
          ]}
        />
      </div>
    </div>
  )
}
