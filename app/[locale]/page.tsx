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
      <div className="min-h-screen flex items-center justify-center bg-clean-light">
        <div className="text-clean-black">Loading...</div>
      </div>
    )
  }

  if (isSuperAdmin) {
    return (
      <main className="min-h-screen bg-clean-light" data-testid="landing-page">
        <header className="w-full px-6 py-5 border-b border-clean-border bg-white" data-testid="landing-header">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-clean-black rounded-lg flex items-center justify-center text-white font-bold text-lg">
                M
              </div>
              <h1 className="text-xl font-bold text-clean-black">
                Miicel.io
              </h1>
            </div>
            <button
              onClick={handleLogout}
              data-testid="button-sign-out"
              className="px-4 py-2 border border-clean-border rounded-lg text-sm font-medium text-clean-black hover:bg-gray-50 transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-clean-black mb-2">
              Active Tenants
            </h2>
            <p className="text-clean-gray">Manage your platform tenants</p>
          </div>

          {tenants.length === 0 ? (
            <div className="bg-white rounded-clean-lg shadow-clean-lg p-12 text-center">
              <p className="text-clean-gray">No active tenants found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tenants.map((tenant) => (
                <div
                  key={tenant.slug}
                  data-testid={`tenant-card-${tenant.slug}`}
                  className="bg-white rounded-clean-lg shadow-clean-md hover:shadow-clean-hover transition-all duration-200 p-6"
                >
                  <div className="flex items-center gap-4 mb-5">
                    {tenant.logo ? (
                      <img
                        src={tenant.logo}
                        alt={tenant.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-clean-gray font-semibold text-lg">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-clean-black truncate">{tenant.name}</h3>
                      <p className="text-sm text-clean-gray">/{tenant.slug}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/es/${tenant.slug}/dashboard`}
                      data-testid={`tenant-dashboard-link-${tenant.slug}`}
                      className="flex-1 px-4 py-2 border border-clean-border rounded-lg text-sm font-medium text-clean-black hover:bg-gray-50 transition-all duration-200 text-center"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={`/es/${tenant.slug}`}
                      data-testid={`tenant-store-link-${tenant.slug}`}
                      className="flex-1 px-4 py-2 bg-clean-black rounded-lg text-sm font-medium text-white hover:bg-gray-800 transition-all duration-200 text-center"
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
    <main className="min-h-screen bg-clean-light flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-5 border-b border-clean-border bg-white" data-testid="login-header">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-clean-black rounded-lg flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <h1 className="text-xl font-bold text-clean-black">
            Miicel.io
          </h1>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-clean-lg p-10 rounded-clean-lg" data-testid="login-form">
            <h2 className="text-2xl font-bold text-clean-black mb-8">
              Sign In
            </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-clean-black mb-2"
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
                    className="w-full px-4 py-3 border border-clean-border rounded-lg focus:outline-none focus:ring-2 focus:ring-clean-black focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 text-clean-black transition-all duration-200"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-clean-black mb-2"
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
                    className="w-full px-4 py-3 border border-clean-border rounded-lg focus:outline-none focus:ring-2 focus:ring-clean-black focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 text-clean-black transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div
                    data-testid="login-error-message"
                    className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  data-testid="login-submit-button"
                  className="w-full py-3 px-6 bg-clean-black rounded-lg text-white font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clean-black shadow-clean-md hover:shadow-clean-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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

      {/* Footer Note */}
      <p className="text-xs text-clean-gray text-center pb-8">
        Platform Access Only
      </p>
    </main>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-clean-light">
        <div className="text-clean-black">Loading...</div>
      </div>
    }>
      <RootPage />
    </Suspense>
  )
}
