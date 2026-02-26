'use client'

import { LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/client'

interface Tenant {
  slug: string
  name: string
  logo: string | null
  status: string
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  const fetchTenants = async () => {
    setLoading(true)
    setError(false)

    try {
      const res = await fetch('/api/tenants/list')

      if (!res.ok) {
        throw new Error('Failed to fetch tenants')
      }

      const data = await res.json()
      setTenants(data)
    } catch (err) {
      console.error('Error fetching tenants:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    checkUser()
    fetchTenants()
  }, [fetchTenants, supabase.auth.getSession])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.reload()
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F8F8] px-5 py-8 md:py-12">
        <header className="max-w-[1200px] mx-auto mb-8 flex justify-between items-center relative">
          <h1 className="text-[24px] md:text-[28px] font-bold text-[#1A1A1A] text-center flex-1">
            Tenant Directory
          </h1>
        </header>

        <div
          className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
          data-testid="tenant-list-loading"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E5E5] rounded-xl p-4 animate-pulse">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3"></div>
              <div className="h-5 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F8F8F8] px-5 py-8 md:py-12">
        <header className="max-w-[1200px] mx-auto mb-8 flex justify-between items-center relative">
          <h1 className="text-[24px] md:text-[28px] font-bold text-[#1A1A1A] text-center flex-1">
            Tenant Directory
          </h1>
          {user && (
            <button
              onClick={handleLogout}
              className="absolute right-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </header>

        <div
          className="max-w-[400px] mx-auto text-center py-16"
          data-testid="tenant-list-error"
          role="alert"
        >
          <div className="text-[64px] mb-4">⚠️</div>
          <h2 className="text-[24px] md:text-[28px] font-bold text-[#1A1A1A] mb-2">
            Failed to Load Tenants
          </h2>
          <p className="text-[14px] md:text-[16px] text-[#666666] mb-6">Please try again</p>
          <button
            onClick={fetchTenants}
            className="w-[200px] h-12 bg-[#FF6B35] text-white text-[14px] md:text-[16px] font-semibold rounded-lg hover:bg-[#E5602F] active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  if (tenants.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F8F8] px-5 py-8 md:py-12">
        <header className="max-w-[1200px] mx-auto mb-8 flex justify-between items-center relative">
          <h1 className="text-[24px] md:text-[28px] font-bold text-[#1A1A1A] text-center flex-1">
            Tenant Directory
          </h1>
          {user && (
            <button
              onClick={handleLogout}
              className="absolute right-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </header>

        <div
          className="max-w-[400px] mx-auto text-center py-16"
          data-testid="tenant-list-empty"
          aria-live="polite"
        >
          <div className="text-[64px] mb-4">🏪</div>
          <h2 className="text-[24px] md:text-[28px] font-bold text-[#1A1A1A] mb-2">
            No Tenants Available
          </h2>
          <p className="text-[14px] md:text-[16px] text-[#666666]">
            Check back soon or contact support to add your store.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F8F8] px-5 py-8 md:py-12">
      <header className="max-w-[1200px] mx-auto mb-8 flex justify-between items-center relative">
        <h1 className="text-[24px] md:text-[28px] font-bold text-[#1A1A1A] text-center flex-1">
          Tenant Directory
        </h1>
        {user && (
          <button
            onClick={handleLogout}
            className="absolute right-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        )}
      </header>

      <div
        className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
        data-testid="tenant-list-container"
      >
        {tenants.map((tenant) => (
          <article
            key={tenant.slug}
            className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-150"
            data-testid={`tenant-card-${tenant.slug}`}
          >
            {/* Logo */}
            <div className="flex justify-center mb-3">
              {tenant.logo ? (
                <img
                  src={tenant.logo}
                  alt={`${tenant.name} logo`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#E5E5E5]"
                  data-testid={`tenant-logo-${tenant.slug}`}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full bg-[#E5E5E5] flex items-center justify-center text-[24px] font-bold text-[#666666]"
                  data-testid={`tenant-logo-${tenant.slug}`}
                  aria-label={`${tenant.name} logo placeholder`}
                >
                  {getInitials(tenant.name)}
                </div>
              )}
            </div>

            {/* Tenant Name */}
            <h2
              className="text-[18px] md:text-[20px] font-semibold text-[#1A1A1A] text-center mb-4 overflow-hidden text-ellipsis whitespace-nowrap"
              data-testid={`tenant-name-${tenant.slug}`}
            >
              {tenant.name}
            </h2>

            {/* CTAs */}
            <div className="space-y-2">
              {/* Store Link */}
              <Link
                href={`/${tenant.slug}/`}
                className="block w-full h-10 bg-[#FF6B35] text-white text-[14px] md:text-[16px] font-semibold rounded-lg flex items-center justify-center hover:bg-[#E5602F] active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2"
                data-testid={`tenant-store-link-${tenant.slug}`}
              >
                Visit Store
              </Link>

              {/* Dashboard Link */}
              <Link
                href={`/${tenant.slug}/dashboard`}
                className="block w-full h-10 bg-transparent text-[#2C3E50] text-[14px] md:text-[16px] font-semibold border-2 border-[#2C3E50] rounded-lg flex items-center justify-center hover:bg-[#2C3E50] hover:text-white active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C3E50] focus-visible:ring-offset-2"
                data-testid={`tenant-dashboard-link-${tenant.slug}`}
              >
                Dashboard
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
