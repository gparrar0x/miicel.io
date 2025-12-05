'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Container } from '@/components/ui/container'

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
      // Use client-side Supabase to ensure cookies are set
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
      console.log('Login successful:', { user: data.user, redirectTo })

      // Redirect using router to maintain session
      const returnUrl = searchParams.get('returnUrl') || redirectTo || '/'
      router.push(returnUrl)
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full border-b border-mii-gray-200 bg-white/90 backdrop-blur">
        <Container className="flex items-center gap-3 py-4">
          <div className="w-10 h-10 bg-mii-blue rounded-[8px] flex items-center justify-center shadow-mii">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-[20px] font-semibold text-mii-gray-900">Miicel.io</span>
        </Container>
      </header>

      <div className="flex-1 flex items-center justify-center px-mii-page py-12 bg-mii-gray-50">
        <div className="w-full max-w-md">
          <Card data-testid="login-form" className="p-8 shadow-mii">
            <h1 className="text-[32px] font-bold text-mii-gray-900 mb-2">Sign In</h1>
            <p className="text-[14px] text-mii-gray-700 mb-8">Access your dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-[14px] font-semibold text-mii-gray-700 mb-2">
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
                  className="w-full rounded-[4px] border border-mii-gray-200 bg-white px-4 py-3 text-[14px] text-mii-gray-900 placeholder:text-mii-gray-500 focus-visible:border-mii-blue focus-visible:ring-2 focus-visible:ring-mii-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 disabled:bg-mii-gray-100 transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[14px] font-semibold text-mii-gray-700 mb-2">
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
                  className="w-full rounded-[4px] border border-mii-gray-200 bg-white px-4 py-3 text-[14px] text-mii-gray-900 placeholder:text-mii-gray-500 focus-visible:border-mii-blue focus-visible:ring-2 focus-visible:ring-mii-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 disabled:bg-mii-gray-100 transition"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div
                  data-testid="login-error-message"
                  className="p-4 bg-red-50 border border-red-200 rounded-[4px] text-mii-gray-900 text-[14px]"
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
                {loading ? <span data-testid="login-loading-state">Signing in...</span> : 'Sign In'}
              </Button>
            </form>
          </Card>

          <p className="mt-6 text-[12px] text-mii-gray-600 text-center">
            Platform access only
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-mii-white">
        <div className="text-mii-gray-500">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
