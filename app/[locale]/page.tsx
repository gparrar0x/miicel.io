'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

interface Tenant {
  slug: string
  name: string
  logo: string | null
  status: string
}

function RootPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])

  useEffect(() => {
    checkAuthAndFetchTenants()
  }, [])

  async function checkAuthAndFetchTenants() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check if superadmin
      const { data: isSuperAdminResult } = await supabase.rpc('is_superadmin')

      if (isSuperAdminResult) {
        setIsSuperAdmin(true)
        // Fetch tenants list
        const response = await fetch('/api/tenants/list')
        if (response.ok) {
          const tenantsData = await response.json()
          setTenants(tenantsData)
        }
      } else {
        // Not superadmin, redirect to their tenant dashboard
        const { data: tenant } = await supabase
          .from('tenants')
          .select('slug')
          .eq('owner_id', user.id)
          .single()

        if (tenant) {
          router.push(`/es/${tenant.slug}/dashboard`)
          return
        }
      }
    }

    setIsLoading(false)
  }

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    setIsSuperAdmin(false)
    setTenants([])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
        <div className="text-[#1A1A1A]">Loading...</div>
      </div>
    )
  }

  if (isSuperAdmin) {
    return (
      <main className="min-h-screen bg-[#F8F8F8] bg-noise">
        <header className="w-full px-6 py-4 border-b border-[#E5E5E5] bg-white">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gallery-gold flex items-center justify-center text-white font-bold text-lg">
                M
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-[#1A1A1A] font-display">
                Miicel.io - Admin
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-[#1A1A1A] hover:text-gallery-gold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-8">Active Tenants</h2>

          {tenants.length === 0 ? (
            <p className="text-[#666] text-center py-12">No active tenants found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenants.map((tenant) => (
                <div
                  key={tenant.slug}
                  className="bg-white rounded-none shadow-brutal hover:shadow-brutal-hover transition-shadow p-6"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {tenant.logo ? (
                      <img
                        src={tenant.logo}
                        alt={tenant.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#E5E5E5] flex items-center justify-center text-[#666] font-bold text-xl">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#1A1A1A]">{tenant.name}</h3>
                      <p className="text-sm text-[#666]">/{tenant.slug}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/es/${tenant.slug}/dashboard`}
                      className="flex-1 px-4 py-2 text-sm font-medium text-[#1A1A1A] bg-[#F8F8F8] rounded-md hover:bg-[#E5E5E5] transition-colors text-center"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={`/es/${tenant.slug}`}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gallery-gold rounded-md hover:bg-gallery-gold-hover transition-colors text-center"
                    >
                      Tienda
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    )
  }

  return <LoginForm />
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Login successful
      const data = await res.json()
      console.log('Login successful:', data)

      // Redirect to return URL or root (tenant list)
      // Redirect to return URL or root (tenant list)
      const returnUrl = searchParams.get('returnUrl') || data.redirectTo || '/'
      window.location.href = returnUrl
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F8F8] bg-noise flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b border-[#E5E5E5] bg-white" data-testid="login-header">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3">
          {/* Logo placeholder - puedes reemplazar con una imagen si tienes logo */}
          <div className="w-10 h-10 rounded-full bg-gallery-gold flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1A1A] font-display">
            Miicel.io
          </h1>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-none shadow-brutal p-8" data-testid="login-form">
            <h2 className="text-2xl font-bold text-[#1A1A1A] font-display mb-6 text-center">
              Sign In
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#1A1A1A] mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  data-testid="login-email-input"
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md focus:outline-none focus:ring-2 focus:ring-gallery-gold disabled:opacity-50 text-[#1A1A1A]"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#1A1A1A] mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  data-testid="login-password-input"
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md focus:outline-none focus:ring-2 focus:ring-gallery-gold disabled:opacity-50 text-[#1A1A1A]"
                />
              </div>

              {error && (
                <div
                  data-testid="login-error-message"
                  className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit-button"
                className="w-full py-2 px-4 bg-gallery-gold text-white font-medium rounded-md hover:bg-gallery-gold-hover focus:outline-none focus:ring-2 focus:ring-gallery-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span data-testid="login-loading-state">Signing in...</span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
        <div className="text-[#1A1A1A]">Loading...</div>
      </div>
    }>
      <RootPage />
    </Suspense>
  )
}
