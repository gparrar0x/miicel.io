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

interface StatsChanges {
  products: { value: number; type: 'positive' | 'negative' | 'neutral' }
  orders: { value: number; type: 'positive' | 'negative' | 'neutral' }
  users: { value: number; type: 'positive' | 'negative' | 'neutral' }
  revenue: { value: number; type: 'positive' | 'negative' | 'neutral' }
}

export default function AdminDashboard({ params }: { params: Promise<{ tenantId: string; locale: string }> }) {
  const { tenantId, locale } = use(params)
  const supabase = createClient()
  const t = useTranslations('Dashboard')

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({ totalProducts: 0, totalOrders: 0, totalUsers: 0, revenue: 0 })
  const [changes, setChanges] = useState<StatsChanges>({
    products: { value: 0, type: 'neutral' },
    orders: { value: 0, type: 'neutral' },
    users: { value: 0, type: 'neutral' },
    revenue: { value: 0, type: 'neutral' },
  })
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

        // Customers count
        const { count: customerCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantData.id)

        // Date ranges
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

        // Orders this month
        const { data: orders } = await supabase
          .from('orders')
          .select('id, total, status, created_at')
          .in('status', ['paid', 'preparing', 'ready', 'delivered'])
          .eq('tenant_id', tenantData.id)
          .gte('created_at', firstDayOfMonth)
          .order('created_at', { ascending: false })

        const revenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0

        // Orders last month (for comparison)
        const { data: lastMonthOrders } = await supabase
          .from('orders')
          .select('id, total')
          .in('status', ['paid', 'preparing', 'ready', 'delivered'])
          .eq('tenant_id', tenantData.id)
          .gte('created_at', firstDayOfLastMonth)
          .lte('created_at', lastDayOfLastMonth)

        const lastMonthRevenue = lastMonthOrders?.reduce((sum, order) => sum + order.total, 0) || 0
        const lastMonthOrderCount = lastMonthOrders?.length || 0

        // Customers last month (for comparison)
        const { count: lastMonthCustomerCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantData.id)
          .gte('created_at', firstDayOfLastMonth)
          .lte('created_at', lastDayOfLastMonth)

        // New customers this month
        const { count: thisMonthCustomerCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantData.id)
          .gte('created_at', firstDayOfMonth)

        // Products created this month vs last month
        const { count: thisMonthProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('active', true)
          .eq('tenant_id', tenantData.id)
          .gte('created_at', firstDayOfMonth)

        const { count: lastMonthProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('active', true)
          .eq('tenant_id', tenantData.id)
          .gte('created_at', firstDayOfLastMonth)
          .lte('created_at', lastDayOfLastMonth)

        // Calculate percentage changes
        const calcChange = (current: number, previous: number): { value: number; type: 'positive' | 'negative' | 'neutral' } => {
          if (previous === 0) {
            return current > 0 ? { value: 100, type: 'positive' } : { value: 0, type: 'neutral' }
          }
          const pct = Math.round(((current - previous) / previous) * 100)
          return { value: Math.abs(pct), type: pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral' }
        }

        const statsChanges: StatsChanges = {
          products: calcChange(thisMonthProducts || 0, lastMonthProducts || 0),
          orders: calcChange(orders?.length || 0, lastMonthOrderCount),
          users: calcChange(thisMonthCustomerCount || 0, lastMonthCustomerCount || 0),
          revenue: calcChange(revenue, lastMonthRevenue),
        }

        // Get orders from last 7 months for sales chart
        const sevenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString()
        const { data: allOrders } = await supabase
          .from('orders')
          .select('total, created_at')
          .in('status', ['paid', 'preparing', 'ready', 'delivered'])
          .eq('tenant_id', tenantData.id)
          .gte('created_at', sevenMonthsAgo)

        // Get customers from last 7 months for users chart
        const { data: allCustomers } = await supabase
          .from('customers')
          .select('created_at')
          .eq('tenant_id', tenantData.id)
          .gte('created_at', sevenMonthsAgo)

        // Build monthly data for charts
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const salesByMonth: Record<string, number> = {}
        const customersByMonth: Record<string, number> = {}

        // Initialize last 7 months
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const key = `${d.getFullYear()}-${d.getMonth()}`
          salesByMonth[key] = 0
          customersByMonth[key] = 0
        }

        // Aggregate sales by month
        allOrders?.forEach(order => {
          if (order.created_at) {
            const d = new Date(order.created_at)
            const key = `${d.getFullYear()}-${d.getMonth()}`
            if (key in salesByMonth) {
              salesByMonth[key] += order.total || 0
            }
          }
        })

        // Aggregate customers by month
        allCustomers?.forEach(customer => {
          if (customer.created_at) {
            const d = new Date(customer.created_at)
            const key = `${d.getFullYear()}-${d.getMonth()}`
            if (key in customersByMonth) {
              customersByMonth[key] += 1
            }
          }
        })

        // Convert to chart format
        const salesData = Object.entries(salesByMonth).map(([key, value]) => {
          const [, month] = key.split('-')
          return { name: monthNames[parseInt(month)], value }
        })

        const usersData = Object.entries(customersByMonth).map(([key, value]) => {
          const [, month] = key.split('-')
          return { name: monthNames[parseInt(month)], value }
        })

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
          totalUsers: customerCount || 0,
          revenue,
        })
        setChanges(statsChanges)
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
          change={formatChange(changes.products)}
          changeType={changes.products.type}
          icon={Package}
        />
        <StatCard
          title="Pedidos Activos"
          value={stats.totalOrders.toLocaleString()}
          change={formatChange(changes.orders)}
          changeType={changes.orders.type}
          icon={ShoppingCart}
        />
        <StatCard
          title="Usuarios Registrados"
          value={stats.totalUsers.toLocaleString()}
          change={formatChange(changes.users)}
          changeType={changes.users.type}
          icon={Users}
        />
        <StatCard
          title="Ingresos"
          value={currencyFormatter.format(stats.revenue)}
          change={formatChange(changes.revenue)}
          changeType={changes.revenue.type}
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

function formatChange(change: { value: number; type: 'positive' | 'negative' | 'neutral' }): string {
  if (change.type === 'neutral' && change.value === 0) return 'Sin cambios vs mes anterior'
  const sign = change.type === 'positive' ? '+' : change.type === 'negative' ? '-' : ''
  return `${sign}${change.value}% vs mes anterior`
}
