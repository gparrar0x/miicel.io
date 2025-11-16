'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Package, ShoppingCart, DollarSign, Settings, Store, LogOut } from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  revenue: number
}

export default function AdminDashboard({ params }: { params: Promise<{ tenant: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0
  })
  const [tenantName, setTenantName] = useState('')
  const [tenantSlug, setTenantSlug] = useState<string | null>(null)

  // Unwrap params in useEffect
  useEffect(() => {
    params.then(({ tenant }) => setTenantSlug(tenant))
  }, [params])

  useEffect(() => {
    if (!tenantSlug) return

    const loadDashboard = async () => {
      try {
        // Get tenant info
        const { data: tenant } = await supabase
          .from('tenants')
          .select('name, config')
          .eq('slug', tenantSlug)
          .single()

        if (tenant) {
          const businessName = typeof tenant.config === 'object' && tenant.config !== null && 'business_name' in tenant.config
            ? (tenant.config.business_name as string)
            : tenant.name
          setTenantName(businessName)
        }

        // Get stats
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
          revenue
        })
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [tenantSlug, router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(`/${tenantSlug}`)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-600">{tenantName}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">¡Bienvenido a tu tienda!</h2>
          <p className="text-blue-100">
            Tu tienda está activada y lista para recibir pedidos. Aquí puedes administrar tus productos, ver pedidos y configurar tu tienda.
          </p>
        </div>

        {/* Stats Grid */}
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
                <p className="text-3xl font-bold text-gray-900 mt-2">${stats.revenue.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => tenantSlug && router.push(`/${tenantSlug}/dashboard/products`)}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
              disabled={!tenantSlug}
            >
              <Package className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                Gestionar Productos
              </span>
            </button>

            <button
              onClick={() => tenantSlug && router.push(`/${tenantSlug}/dashboard/orders`)}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
              disabled={!tenantSlug}
            >
              <ShoppingCart className="h-8 w-8 text-gray-400 group-hover:text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
                Ver Pedidos
              </span>
            </button>

            <button
              onClick={() => tenantSlug && router.push(`/${tenantSlug}/dashboard/settings`)}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
              disabled={!tenantSlug}
            >
              <Settings className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">
                Configuración
              </span>
            </button>

            <button
              onClick={() => tenantSlug && router.push(`/${tenantSlug}`)}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group"
              disabled={!tenantSlug}
            >
              <Store className="h-8 w-8 text-gray-400 group-hover:text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">
                Ver Tienda
              </span>
            </button>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Próximos Pasos</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Agrega más productos a tu catálogo para atraer clientes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Configura tus métodos de pago (Mercado Pago)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Comparte el link de tu tienda con tus clientes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Personaliza los colores y logo de tu tienda</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
