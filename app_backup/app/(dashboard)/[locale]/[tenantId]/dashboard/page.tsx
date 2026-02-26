'use client'

import { DollarSign, Package, Settings, ShoppingCart, Store } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/AdminSidebar'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  revenue: number
}

export default function AdminDashboard({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
  })
  const [tenantName, setTenantName] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        const { data: tenantData } = await supabase
          .from('tenants')
          .select('name, config')
          .eq('slug', tenantId)
          .single()

        if (tenantData) {
          const config = tenantData.config as { business_name?: string } | null
          setTenantName(config?.business_name || tenantData.name)
        }

        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('active', true)

        const { data: orders } = await supabase
          .from('orders')
          .select('total')
          .eq('status', 'completed')

        const revenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0

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
  }, [tenantId, router, supabase])

  const _handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(`/${tenantId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AdminSidebar tenant={tenantId} tenantName={tenantName} />
      <div className="lg:pl-64 min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-16 lg:mt-0">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 mb-8 text-white">
            <h2 className="text-3xl font-bold mb-2">¡Bienvenido a tu tienda!</h2>
            <p className="text-blue-100">Tu tienda está activada y lista para recibir pedidos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Productos Activos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pedidos Completados</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${stats.revenue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push(`/${tenantId}/dashboard/settings/appearance`)}
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
              >
                <Settings className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">
                  Configuración
                </span>
              </button>

              <button
                onClick={() => router.push(`/${tenantId}`)}
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group"
              >
                <Store className="h-8 w-8 text-gray-400 group-hover:text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">
                  Ver Tienda
                </span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
