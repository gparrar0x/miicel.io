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
      <div className="lg:pl-64 min-h-screen bg-[#FAFAFA]">
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-16 lg:mt-0">
        {/* Header Hero - Brutalist Style */}
        <div className="bg-gallery-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold font-display mb-2 text-white">{t('welcomeTitle')}</h2>
            <p className="text-gray-300 text-lg">
              {t('welcomeDesc')}
            </p>
          </div>
          {/* Accent stripe */}
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gallery-gold"></div>
        </div>

        {/* Stats Cards - High Contrast */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">{t('activeProducts')}</p>
                <p className="text-4xl font-bold text-gallery-black mt-2">{stats.totalProducts}</p>
              </div>
              <div className="bg-gallery-gold border-2 border-black p-3">
                <Package className="h-7 w-7 text-black" />
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">{t('completedOrders')}</p>
                <p className="text-4xl font-bold text-gallery-black mt-2">{stats.totalOrders}</p>
              </div>
              <div className="bg-gallery-gold border-2 border-black p-3">
                <ShoppingCart className="h-7 w-7 text-black" />
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">{t('totalRevenue')}</p>
                <p className="text-4xl font-bold text-gallery-black mt-2">${stats.revenue.toFixed(2)}</p>
              </div>
              <div className="bg-gallery-gold border-2 border-black p-3">
                <DollarSign className="h-7 w-7 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Brutalist Grid */}
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8">
          <h3 className="text-2xl font-bold font-display text-gallery-black mb-6 pb-3 border-b-4 border-gallery-gold">{t('quickActions')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push(`/${locale}/${tenantId}/dashboard/settings/appearance`)}
              className="flex flex-col items-center justify-center p-8 border-4 border-black bg-white hover:bg-gallery-gold hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group"
            >
              <Settings className="h-10 w-10 text-gallery-black mb-3" />
              <span className="text-sm font-bold font-mono uppercase tracking-wide text-gallery-black">
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
