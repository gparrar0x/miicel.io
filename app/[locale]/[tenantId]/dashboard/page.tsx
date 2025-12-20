'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import { ChartCard } from '@/components/dashboard/chart-card'
import { DataTable, StatusBadge } from '@/components/dashboard/data-table'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  revenue: number
}

export default function AdminDashboard({ params }: { params: Promise<{ tenantId: string; locale: string }> }) {
  const { tenantId, locale } = use(params)
  const supabase = createClient()
  const t = useTranslations('Dashboard')

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({ totalProducts: 0, totalOrders: 0, totalUsers: 0, revenue: 0 })
  const [salesChart, setSalesChart] = useState<{ name: string; value: number }[]>([])
  const [usersChart, setUsersChart] = useState<{ name: string; value: number }[]>([])
  const [recentOrders, setRecentOrders] = useState<Array<{ id: string; cliente: string; total: string; estado: string; fecha: string }>>([])

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

        // Products count
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('active', true)
          .eq('tenant_id', tenantData.id)

        // Orders this month
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const { data: orders } = await supabase
          .from('orders')
          .select('id, total, status, created_at')
          .in('status', ['paid', 'preparing', 'ready', 'delivered'])
          .eq('tenant_id', tenantData.id)
          .gte('created_at', firstDayOfMonth)
          .order('created_at', { ascending: false })

        const revenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0

        // Build sales chart data (monthly pattern like DS)
        const salesData = [
          { name: 'Ene', value: 4000 },
          { name: 'Feb', value: 3000 },
          { name: 'Mar', value: 5000 },
          { name: 'Abr', value: 4500 },
          { name: 'May', value: 6000 },
          { name: 'Jun', value: 5500 },
          { name: 'Jul', value: 7000 },
        ]

        // Users chart (same as DS)
        const usersData = [
          { name: 'Ene', value: 120 },
          { name: 'Feb', value: 180 },
          { name: 'Mar', value: 150 },
          { name: 'Abr', value: 220 },
          { name: 'May', value: 280 },
          { name: 'Jun', value: 320 },
          { name: 'Jul', value: 400 },
        ]

        // Format recent orders for table (exactly like DS format)
        const formattedOrders = (orders || []).slice(0, 5).map((order, idx) => ({
          id: `ORD-${String(idx + 1).padStart(3, '0')}`,
          cliente: 'Cliente',
          total: currencyFormatter.format(order.total),
          estado: order.status === 'paid' || order.status === 'delivered' ? 'Completado' : order.status === 'preparing' ? 'En proceso' : order.status === 'ready' ? 'Enviado' : 'Pendiente',
          fecha: order.created_at ? getRelativeTime(new Date(order.created_at)) : '',
        }))

        setStats({
          totalProducts: productCount || 0,
          totalOrders: orders?.length || 0,
          totalUsers: 2847, // Mock like DS
          revenue,
        })
        setSalesChart(salesData)
        setUsersChart(usersData)
        setRecentOrders(formattedOrders)
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [tenantId, locale, currencyFormatter])

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
      {/* Page header - exactly like DS */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido de nuevo. Aquí tienes un resumen de tu negocio.</p>
      </div>

      {/* Stats grid - exactly like DS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Productos"
          value={stats.totalProducts.toLocaleString()}
          change="+12% vs mes anterior"
          changeType="positive"
          icon={Package}
        />
        <StatCard
          title="Pedidos Activos"
          value={stats.totalOrders.toLocaleString()}
          change="+8% vs mes anterior"
          changeType="positive"
          icon={ShoppingCart}
        />
        <StatCard
          title="Usuarios Registrados"
          value={stats.totalUsers.toLocaleString()}
          change="+23% vs mes anterior"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Ingresos"
          value={currencyFormatter.format(stats.revenue)}
          change="+15% vs mes anterior"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Charts section - 2 charts 50/50 like DS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Ventas Mensuales" data={salesChart} />
        <ChartCard title="Nuevos Usuarios" data={usersChart} />
      </div>

      {/* Recent orders - exactly like DS */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Pedidos Recientes</h2>
        <DataTable
          data={recentOrders}
          columns={[
            { key: 'id', header: 'ID Pedido' },
            { key: 'cliente', header: 'Cliente' },
            { key: 'total', header: 'Total' },
            {
              key: 'estado',
              header: 'Estado',
              render: (item) => (
                <StatusBadge
                  status={item.estado}
                  variant={item.estado === 'Completado' ? 'default' : item.estado === 'En proceso' ? 'secondary' : 'outline'}
                />
              ),
            },
            { key: 'fecha', header: 'Fecha' },
          ]}
        />
      </div>
    </div>
  )
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return 'Hace unos minutos'
  if (diffHours < 24) return `Hace ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `Hace ${diffDays}d`
}
