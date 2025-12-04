'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Store, Package, ShoppingCart, DollarSign, Settings } from 'lucide-react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { useTranslations } from 'next-intl'

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
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push(`/${locale}/login`)
          return
        }

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
  }, [tenantId, router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(`/${tenantId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gallery-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AdminSidebar tenant={tenantId} tenantName={tenantName} />
      <div className="lg:pl-64 min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-16 lg:mt-0">
        <div className="bg-gallery-black rounded-none shadow-brutal p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold font-display mb-2">{t('welcomeTitle')}</h2>
          <p className="text-gray-200">
            {t('welcomeDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-none shadow-brutal p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('activeProducts')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
              </div>
              <div className="bg-gallery-gold/10 rounded-full p-3">
                <Package className="h-6 w-6 text-gallery-gold" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-none shadow-brutal p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('completedOrders')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              </div>
              <div className="bg-gallery-gold/10 rounded-full p-3">
                <ShoppingCart className="h-6 w-6 text-gallery-gold" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-none shadow-brutal p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalRevenue')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${stats.revenue.toFixed(2)}</p>
              </div>
              <div className="bg-gallery-gold/10 rounded-full p-3">
                <DollarSign className="h-6 w-6 text-gallery-gold" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-none shadow-brutal p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push(`/${tenantId}/dashboard/settings/appearance`)}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-none hover:border-gallery-gold hover:bg-gallery-gold/5 transition-colors group"
            >
              <Settings className="h-8 w-8 text-gray-400 group-hover:text-gallery-gold mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gallery-gold">
                {t('settings')}
              </span>
            </button>
          </div>
        </div>
        </main>
      </div>
    </>
  )
}
