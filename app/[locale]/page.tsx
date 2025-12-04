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
      <main className="min-h-screen bg-[#FAFAFA] bg-noise">
        <header className="w-full px-6 py-4 border-b-4 border-black bg-white shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gallery-gold border-2 border-black flex items-center justify-center text-black font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                M
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gallery-black font-display">
                Miicel.io
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border-2 border-black font-mono text-xs uppercase font-bold text-gallery-black hover:bg-gallery-gold hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <h2 className="text-4xl font-black text-gallery-black font-display mb-8 pb-4 border-b-4 border-gallery-gold inline-block">Active Tenants</h2>

          {tenants.length === 0 ? (
            <p className="text-[#666] text-center py-12">No active tenants found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenants.map((tenant) => (
                <div
                  key={tenant.slug}
                  className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200 p-6"
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

                  <div className="flex gap-3">
                    <Link
                      href={`/es/${tenant.slug}/dashboard`}
                      className="flex-1 px-4 py-3 border-2 border-black font-mono text-xs uppercase font-bold text-gallery-black bg-white hover:bg-gray-100 hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-center"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={`/es/${tenant.slug}`}
                      className="flex-1 px-4 py-3 border-2 border-black font-mono text-xs uppercase font-bold text-black bg-gallery-gold hover:bg-gallery-gold-hover hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all text-center"
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
    <main className="min-h-screen bg-[#FAFAFA] bg-noise flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b-4 border-black bg-white shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]" data-testid="login-header">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3">
          <div className="w-12 h-12 bg-gallery-gold border-2 border-black flex items-center justify-center text-black font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            M
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gallery-black font-display">
            Miicel.io
          </h1>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 relative overflow-hidden" data-testid="login-form">
            <div className="absolute top-0 left-0 w-full h-2 bg-gallery-gold"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-gallery-black font-display mb-8 text-center">
                Sign In
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-mono uppercase tracking-wider font-bold text-gallery-black mb-2"
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
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-gallery-gold focus:shadow-[2px_2px_0px_0px_rgba(184,134,11,0.3)] disabled:opacity-50 text-gallery-black font-medium transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-mono uppercase tracking-wider font-bold text-gallery-black mb-2"
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
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:border-gallery-gold focus:shadow-[2px_2px_0px_0px_rgba(184,134,11,0.3)] disabled:opacity-50 text-gallery-black font-medium transition-all"
                  />
                </div>

                {error && (
                  <div
                    data-testid="login-error-message"
                    className="p-4 bg-red-100 border-2 border-red-600 text-red-900 text-sm font-medium"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  data-testid="login-submit-button"
                  className="w-full py-4 px-6 bg-gallery-gold border-2 border-black text-black font-mono uppercase font-bold text-sm tracking-wider hover:bg-gallery-gold-hover hover:-translate-y-1 focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
