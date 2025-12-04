'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
    <div className="min-h-screen flex flex-col bg-mii-white">
      {/* Header */}
      <header className="w-full px-mii-page py-4 border-b border-mii-gray-200">
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
