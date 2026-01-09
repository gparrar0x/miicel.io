'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MicelioLogo } from '@/components/icons/micelio-logo'

function LoginForm() {
  const router = useRouter()
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
      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      // Get redirect URL from API
      const res = await fetch('/api/auth/login-redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id }),
      })

      const { redirectTo } = await res.json()

      // Use returnUrl from query params, or API redirect, or home
      const returnUrl = searchParams.get('returnUrl') || redirectTo || '/'
      // Full page navigation to ensure cookies are sent with server request
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
      <header className="flex h-16 items-center border-b border-border px-6">
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
