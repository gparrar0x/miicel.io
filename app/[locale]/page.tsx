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
      <div className="min-h-screen flex items-center justify-center bg-alabaster">
        <div className="text-charcoal font-medium">Loading...</div>
      </div>
    )
  }

  if (isSuperAdmin) {
    return (
      <main className="min-h-screen bg-alabaster bg-noise" data-testid="landing-page">
        <header className="w-full px-6 py-4 border-b-2 border-gray-200 bg-white shadow-elegant" data-testid="landing-header">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gold border-2 border-gold-dark rounded-sm flex items-center justify-center text-white font-semibold text-xl shadow-elegant">
                M
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-charcoal font-display tracking-tight">
                Miicel.io
              </h1>
            </div>
            <button
              onClick={handleLogout}
              data-testid="button-sign-out"
              className="px-5 py-2.5 border-2 border-gray-300 rounded-sm text-sm font-medium text-charcoal hover:bg-stone hover:border-gold/50 transition-all duration-200 focus:outline-none focus:shadow-gold-glow"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-4xl font-semibold text-charcoal font-display mb-2 tracking-tight inline-block">
              Active Tenants
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold to-gold-light rounded-full"></div>
          </div>

          {tenants.length === 0 ? (
            <div className="bg-white border-2 border-gray-200 rounded-sm shadow-elegant p-12 text-center">
              <p className="text-slate">No active tenants found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenants.map((tenant) => (
                <div
                  key={tenant.slug}
                  data-testid={`tenant-card-${tenant.slug}`}
                  className="bg-white border-2 border-gray-200 rounded-sm shadow-elegant hover:shadow-elegant-hover hover:-translate-y-0.5 hover:border-gold/30 transition-all duration-200 p-6 group"
                >
                  <div className="flex items-center gap-4 mb-6">
                    {tenant.logo ? (
                      <img
                        src={tenant.logo}
                        alt={tenant.name}
                        className="w-14 h-14 rounded-sm object-cover border-2 border-stone"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-sm bg-stone border-2 border-gray-300 flex items-center justify-center text-slate font-semibold text-lg">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-charcoal truncate">{tenant.name}</h3>
                      <p className="text-sm text-slate-blue">/{tenant.slug}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/es/${tenant.slug}/dashboard`}
                      data-testid={`tenant-dashboard-link-${tenant.slug}`}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-sm text-sm font-medium text-charcoal bg-white hover:bg-stone hover:border-slate-blue transition-all duration-200 text-center focus:outline-none focus:shadow-gold-glow"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={`/es/${tenant.slug}`}
                      data-testid={`tenant-store-link-${tenant.slug}`}
                      className="flex-1 px-4 py-2.5 border-2 border-gold-dark rounded-sm text-sm font-medium text-white bg-gold hover:bg-gold-light hover:border-gold hover:-translate-y-0.5 transition-all duration-200 text-center focus:outline-none focus:shadow-gold-glow shadow-elegant hover:shadow-elegant-lg"
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
    <main className="min-h-screen bg-alabaster bg-noise flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b-2 border-gray-200 bg-white shadow-elegant" data-testid="login-header">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3">
          <div className="w-12 h-12 bg-gold border-2 border-gold-dark rounded-sm flex items-center justify-center text-white font-semibold text-xl shadow-elegant">
            M
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-charcoal font-display tracking-tight">
            Miicel.io
          </h1>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border-2 border-gray-200 shadow-elegant-lg p-8 rounded-sm relative overflow-hidden" data-testid="login-form">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-gold-light to-gold"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-semibold text-charcoal font-display mb-2 text-center tracking-tight">
                Sign In
              </h2>
              <p className="text-sm text-slate-blue text-center mb-8">Enter your credentials to continue</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-charcoal mb-2 tracking-wide"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    data-testid="login-email-input"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-sm focus:outline-none focus:border-gold focus:shadow-gold-glow disabled:opacity-50 disabled:bg-stone text-charcoal font-medium transition-all duration-200 hover:border-gray-400"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-charcoal mb-2 tracking-wide"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-sm focus:outline-none focus:border-gold focus:shadow-gold-glow disabled:opacity-50 disabled:bg-stone text-charcoal font-medium transition-all duration-200 hover:border-gray-400"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div
                    data-testid="login-error-message"
                    className="p-4 bg-coral/10 border-2 border-coral rounded-sm text-coral text-sm font-medium"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  data-testid="login-submit-button"
                  className="w-full py-3.5 px-6 bg-gold border-2 border-gold-dark rounded-sm text-white font-semibold text-sm tracking-wide hover:bg-gold-light hover:border-gold hover:-translate-y-0.5 focus:outline-none focus:shadow-gold-glow shadow-elegant hover:shadow-elegant-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
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
      </div>

      {/* Footer Note */}
      <p className="text-xs text-slate text-center pb-8 uppercase tracking-wider font-medium">
        Platform Access Only
      </p>
    </main>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-alabaster">
        <div className="text-charcoal font-medium">Loading...</div>
      </div>
    }>
      <RootPage />
    </Suspense>
  )
}
