'use client'

import { createBrowserClient } from '@supabase/ssr'
import { LayoutDashboard, LogOut, Store } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { MicelioLogo } from '@/components/icons/micelio-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Tenant {
  id: number
  slug: string
  name: string
  logo: string | null
  status: string
  template: string
}

interface FeatureFlag {
  id: number
  key: string
  description: string | null
  enabled: boolean
  rules: {
    tenants?: number[]
    templates?: string[]
    users?: string[]
    percentage?: number
    environments?: string[]
  }
}

function RootPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [flags, setFlags] = useState<FeatureFlag[]>([])

  const checkAuthAndFetchTenants = useCallback(async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: isSuperAdminResult } = await supabase.rpc('is_superadmin')

      if (isSuperAdminResult) {
        setIsSuperAdmin(true)
        const [tenantsRes, flagsRes] = await Promise.all([
          fetch('/api/tenants/list', { credentials: 'include' }),
          fetch('/api/admin/flags', { credentials: 'include' }),
        ])
        if (tenantsRes.ok) {
          const tenantsData = await tenantsRes.json()
          setTenants(tenantsData)
        }
        if (flagsRes.ok) {
          const flagsData = await flagsRes.json()
          setFlags(flagsData.flags ?? [])
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
  }, [router])

  useEffect(() => {
    checkAuthAndFetchTenants()
  }, [checkAuthAndFetchTenants])

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    await supabase.auth.signOut()
    setIsSuperAdmin(false)
    setTenants([])
    setFlags([])
  }

  async function handleToggleFlag(key: string, tenantId: number, enabled: boolean) {
    try {
      const res = await fetch('/api/admin/flags/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, tenant_id: tenantId, enabled }),
        credentials: 'include',
      })
      if (!res.ok) return
      const { flag: updatedFlag } = await res.json()
      setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, ...updatedFlag } : f)))
    } catch (err) {
      console.error('Toggle flag error:', err)
    }
  }

  const tenantsByTemplate = useMemo(
    () =>
      tenants.reduce(
        (acc, tenant) => {
          const tmpl = tenant.template || 'gallery'
          if (!acc[tmpl]) acc[tmpl] = []
          acc[tmpl].push(tenant)
          return acc
        },
        {} as Record<string, Tenant[]>,
      ),
    [tenants],
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    )
  }

  if (isSuperAdmin) {
    return (
      <div className="flex min-h-screen flex-col bg-background" data-testid="landing-page">
        {/* Header */}
        <header
          className="flex h-16 items-center justify-between border-b border-border bg-background px-6"
          data-testid="landing-header"
        >
          <div className="flex items-center gap-3">
            <MicelioLogo className="h-8 w-8 text-foreground" />
            <span className="text-lg font-semibold tracking-tight text-foreground">Micelio</span>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-sign-out">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Active Tenants</h1>
              <p className="text-muted-foreground">Manage your platform tenants</p>
            </div>

            {tenants.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center p-12">
                  <p className="text-muted-foreground">No active tenants found.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {Object.entries(tenantsByTemplate).map(([template, templateTenants]) => (
                  <div key={template} className="mb-10">
                    <div className="mb-4 flex items-center gap-3">
                      <h2 className="text-lg font-semibold tracking-tight text-foreground capitalize">
                        {template}
                      </h2>
                      <span className="text-sm text-muted-foreground">
                        {templateTenants.length} tenant{templateTenants.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {templateTenants.map((tenant) => (
                        <Card
                          key={tenant.slug}
                          data-testid={`tenant-card-${tenant.slug}`}
                          className="border-border transition-shadow hover:shadow-md"
                        >
                          <CardContent className="p-6">
                            <div className="mb-4 flex items-center gap-4">
                              {tenant.logo ? (
                                <img
                                  src={tenant.logo}
                                  alt={tenant.name}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-lg font-semibold text-foreground">
                                  {tenant.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h3 className="truncate font-semibold text-foreground">
                                  {tenant.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">/{tenant.slug}</p>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button variant="outline" className="flex-1" asChild>
                                <Link
                                  href={`/es/${tenant.slug}/dashboard`}
                                  data-testid={`tenant-dashboard-link-${tenant.slug}`}
                                >
                                  <LayoutDashboard className="mr-2 h-4 w-4" />
                                  Dashboard
                                </Link>
                              </Button>
                              <Button className="flex-1" asChild>
                                <Link
                                  href={`/es/${tenant.slug}`}
                                  data-testid={`tenant-store-link-${tenant.slug}`}
                                >
                                  <Store className="mr-2 h-4 w-4" />
                                  Tienda
                                </Link>
                              </Button>
                            </div>

                            {/* Feature Flags */}
                            {flags.length > 0 && (
                              <div className="mt-4 border-t border-border pt-3">
                                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                  Feature Flags
                                </p>
                                <div className="space-y-1.5">
                                  {flags.map((flag) => {
                                    const isEnabledForTenant =
                                      flag.rules?.tenants?.includes(tenant.id) ?? false
                                    const isEnabledByTemplate =
                                      flag.rules?.templates?.includes(tenant.template) ?? false
                                    const isGlobal =
                                      flag.enabled &&
                                      !flag.rules?.tenants?.length &&
                                      !flag.rules?.templates?.length &&
                                      !flag.rules?.users?.length &&
                                      flag.rules?.percentage == null
                                    const isActive =
                                      isEnabledForTenant || isEnabledByTemplate || isGlobal

                                    return (
                                      <div
                                        key={flag.key}
                                        className="flex items-center justify-between"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm">
                                            {flag.key.replace(/_/g, ' ')}
                                          </span>
                                          {isEnabledByTemplate && (
                                            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                              template
                                            </span>
                                          )}
                                          {isGlobal && (
                                            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                              global
                                            </span>
                                          )}
                                        </div>
                                        <button
                                          onClick={() =>
                                            handleToggleFlag(
                                              flag.key,
                                              tenant.id,
                                              !isEnabledForTenant,
                                            )
                                          }
                                          disabled={isEnabledByTemplate || isGlobal}
                                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                            isActive ? 'bg-foreground' : 'bg-secondary'
                                          }`}
                                          data-testid={`flag-toggle-${flag.key}-${tenant.slug}`}
                                        >
                                          <span
                                            className={`pointer-events-none block h-3.5 w-3.5 rounded-full bg-background shadow-lg transition-transform ${
                                              isActive ? 'translate-x-4' : 'translate-x-0.5'
                                            }`}
                                          />
                                        </button>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </main>
      </div>
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
      <header
        className="flex h-16 items-center border-b border-border px-6"
        data-testid="login-header"
      >
        <div className="flex items-center gap-3">
          <MicelioLogo className="h-8 w-8 text-foreground" />
          <span className="text-lg font-semibold tracking-tight text-foreground">Micelio</span>
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
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      }
    >
      <RootPage />
    </Suspense>
  )
}
