'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MicelioLogo } from '@/components/icons/micelio-logo'

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
        const response = await fetch('/api/tenants/list', { credentials: 'include' })
        if (response.ok) {
          const tenantsData = await response.json()
          setTenants(tenantsData)
        }
      } else {
        // Not superadmin, get redirect URL from API (uses service role to avoid RLS recursion)
        const redirectRes = await fetch('/api/auth/login-redirect', { credentials: 'include' })
        if (redirectRes.ok) {
          const { redirectTo } = await redirectRes.json()
          if (redirectTo && redirectTo !== '/') {
            router.push(redirectTo)
            return
          }
        }

        // Fallback: check tenants.owner_id (legacy)
        const { data: tenant } = await supabase
          .from('tenants')
          .select('slug')
          .eq('owner_id', user.id)
          .maybeSingle()

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    )
  }

  if (isSuperAdmin) {
    return (
      <main className="min-h-screen bg-mii-white" data-testid="landing-page">
        {/* Header */}
        <header className="w-full px-mii-page py-4 border-b border-mii-gray-200" data-testid="landing-header">
          <div className="max-w-mii-content mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-mii-black rounded-mii flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-mii-h3 text-mii-black">Miicel.io</span>
            </div>
            <button
              onClick={handleLogout}
              data-testid="button-sign-out"
              className="px-4 py-2 border border-mii-gray-200 rounded-mii-sm text-mii-body text-mii-gray-700 hover:bg-mii-gray-50 transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-mii-content mx-auto px-mii-page py-mii-page">
          <div className="mb-8">
            <h1 className="text-mii-h1 text-mii-black mb-2">Active Tenants</h1>
            <p className="text-mii-body text-mii-gray-500">Manage your platform tenants</p>
          </div>

          {tenants.length === 0 ? (
            <div className="bg-mii-white border border-mii-gray-200 rounded-mii shadow-mii p-12 text-center">
              <p className="text-mii-body text-mii-gray-500">No active tenants found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-mii-gap">
              {tenants.map((tenant) => (
                <div
                  key={tenant.slug}
                  data-testid={`tenant-card-${tenant.slug}`}
                  className="bg-mii-white border border-mii-gray-200 rounded-mii shadow-mii hover:shadow-mii-md transition-all duration-200 p-mii-card"
                >
                  <div className="flex items-center gap-4 mb-5">
                    {tenant.logo ? (
                      <img
                        src={tenant.logo}
                        alt={tenant.name}
                        className="w-12 h-12 rounded-mii object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-mii bg-mii-gray-100 flex items-center justify-center text-mii-gray-500 font-semibold text-lg">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-mii-h3 text-mii-black truncate">{tenant.name}</h3>
                      <p className="text-mii-small text-mii-gray-500">/{tenant.slug}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/es/${tenant.slug}/dashboard`}
                      data-testid={`tenant-dashboard-link-${tenant.slug}`}
                      className="flex-1 px-4 py-2 border border-mii-gray-200 rounded-mii-sm text-mii-label text-mii-gray-700 hover:bg-mii-gray-50 transition-all duration-200 text-center"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={`/es/${tenant.slug}`}
                      data-testid={`tenant-store-link-${tenant.slug}`}
                      className="flex-1 px-4 py-2 bg-mii-blue rounded-mii-sm text-mii-label text-white hover:bg-mii-blue-hover transition-all duration-200 text-center"
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
  const searchParams = useSearchParams()
  const t = useTranslations('Login')
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
        credentials: 'include',
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
    } catch (err: unknown) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 items-center border-b border-border px-6" data-testid="login-header">
        <div className="flex items-center gap-3">
          <MicelioLogo className="h-8 w-8 text-foreground" />
          <span className="text-lg font-semibold tracking-tight text-foreground">Miicel.io</span>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md" data-testid="login-form">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">{t('title')}</CardTitle>
            <CardDescription>{t('subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  data-testid="login-email-input"
                  placeholder={t('emailPlaceholder')}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  data-testid="login-password-input"
                  placeholder={t('passwordPlaceholder')}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div
                  data-testid="login-error-message"
                  className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                data-testid="login-submit-button"
                className="w-full"
              >
                {loading ? (
                  <span data-testid="login-loading-state">{t('submitting')}</span>
                ) : (
                  t('submit')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="flex h-12 items-center justify-center border-t border-border">
        <p className="text-sm text-muted-foreground">{t('platformOnly')}</p>
      </footer>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    }>
      <RootPage />
    </Suspense>
  )
}
