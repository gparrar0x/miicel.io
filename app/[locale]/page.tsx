'use client'

import { createBrowserClient } from '@supabase/ssr'
import { LogOut } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { TenantMatrix } from '@/components/admin/TenantMatrix'
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
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Feature Flags
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tenants.length} tenant{tenants.length !== 1 ? 's' : ''} · {flags.length} flag
                {flags.length !== 1 ? 's' : ''}
              </p>
            </div>

            {tenants.length === 0 ? (
              <div className="flex items-center justify-center rounded-md border border-border py-16">
                <p className="text-muted-foreground text-sm">No active tenants found.</p>
              </div>
            ) : (
              <TenantMatrix tenants={tenants} flags={flags} onToggleFlag={handleToggleFlag} />
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
