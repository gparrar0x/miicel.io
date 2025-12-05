'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Card } from '@/components/ui/card'

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-mii-gray-500">Loading...</div>
      </div>
    )
  }

  if (isSuperAdmin) {
    return (
      <main className="min-h-screen bg-mii-gray-50" data-testid="landing-page">
        <header
          className="w-full border-b border-mii-gray-200 bg-white/90 backdrop-blur"
          data-testid="landing-header"
        >
          <Container className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-mii-blue flex items-center justify-center shadow-mii">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-[20px] font-semibold text-mii-gray-900">Miicel.io</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              data-testid="button-sign-out"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </Container>
        </header>

        <Container className="py-10 space-y-8">
          <div className="space-y-2">
            <h1 className="text-[32px] font-bold text-mii-gray-900">Active Tenants</h1>
            <p className="text-[14px] text-mii-gray-700">Manage your platform tenants</p>
          </div>

          {tenants.length === 0 ? (
            <Card className="text-center">
              <p className="text-mii-gray-700 text-[14px]">No active tenants found.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-mii-gap">
              {tenants.map((tenant) => (
                <Card
                  key={tenant.slug}
                  data-testid={`tenant-card-${tenant.slug}`}
                  className="h-full"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {tenant.logo ? (
                      <img
                        src={tenant.logo}
                        alt={tenant.name}
                        className="w-12 h-12 rounded-[8px] object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-[8px] bg-mii-gray-100 flex items-center justify-center text-mii-gray-700 font-semibold text-lg">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[18px] font-semibold text-mii-gray-900 truncate">
                        {tenant.name}
                      </h3>
                      <p className="text-[12px] text-mii-gray-500">/{tenant.slug}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/es/${tenant.slug}/dashboard`}
                      data-testid={`tenant-dashboard-link-${tenant.slug}`}
                      className="flex-1"
                    >
                      <Button variant="secondary" className="w-full" data-testid={`tenant-dashboard-link-${tenant.slug}`}>
                        Dashboard
                      </Button>
                    </Link>
                    <Link
                      href={`/es/${tenant.slug}`}
                      data-testid={`tenant-store-link-${tenant.slug}`}
                      className="flex-1"
                    >
                      <Button className="w-full" variant="primary" data-testid={`tenant-store-link-${tenant.slug}`}>
                        Tienda
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
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
      const returnUrl = searchParams.get('returnUrl') || data.redirectTo || '/'
      window.location.href = returnUrl
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-mii-white flex flex-col">
      {/* Header */}
      <header className="w-full px-mii-page py-4 border-b border-mii-gray-200" data-testid="login-header">
        <div className="max-w-mii-content mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-mii-black rounded-mii flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-mii-h3 text-mii-black">Miicel.io</span>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-mii-page py-12">
        <div className="w-full max-w-md">
          <div className="bg-mii-white border border-mii-gray-200 shadow-mii p-8 rounded-mii" data-testid="login-form">
            <h1 className="text-mii-h1 text-mii-black mb-2">Sign In</h1>
            <p className="text-mii-body text-mii-gray-500 mb-8">
              Access your dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-mii-gap">
              <div>
                <label
                  htmlFor="email"
                  className="block text-mii-label text-mii-gray-700 mb-2"
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
                  className="w-full px-4 py-3 border border-mii-gray-200 rounded-mii-sm text-mii-body text-mii-gray-900 placeholder:text-mii-gray-400 focus:outline-none focus:ring-2 focus:ring-mii-blue focus:border-transparent disabled:opacity-50 disabled:bg-mii-gray-50 transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-mii-label text-mii-gray-700 mb-2"
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
                  className="w-full px-4 py-3 border border-mii-gray-200 rounded-mii-sm text-mii-body text-mii-gray-900 placeholder:text-mii-gray-400 focus:outline-none focus:ring-2 focus:ring-mii-blue focus:border-transparent disabled:opacity-50 disabled:bg-mii-gray-50 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div
                  data-testid="login-error-message"
                  className="p-4 bg-red-50 border border-mii-error/20 rounded-mii-sm text-mii-error text-mii-body"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit-button"
                className="w-full py-3 px-6 bg-mii-blue rounded-mii-sm text-white text-mii-label hover:bg-mii-blue-hover focus:outline-none focus:ring-2 focus:ring-mii-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span data-testid="login-loading-state">Signing in...</span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-mii-small text-mii-gray-500 text-center">
            Platform access only
          </p>
        </div>
      </div>
    </main>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-mii-white">
        <div className="text-mii-gray-500">Loading...</div>
      </div>
    }>
      <RootPage />
    </Suspense>
  )
}
