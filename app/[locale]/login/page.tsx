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
    <div className="min-h-screen flex flex-col items-center justify-center bg-clean-light px-4 py-12">
      {/* Logo Header */}
      <div className="mb-12 text-center">
        <div className="inline-block bg-clean-black w-16 h-16 rounded-clean-lg mb-6 flex items-center justify-center shadow-clean-md">
          <span className="text-3xl font-bold text-white">M</span>
        </div>
        <h1 className="text-2xl font-bold text-clean-black mb-1">Miicel.io</h1>
        <p className="text-sm text-clean-gray">Platform Access</p>
      </div>

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

      {/* Footer Note */}
      <p className="mt-8 text-xs text-clean-gray">
        Platform Access Only
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-clean-light">
        <div className="text-clean-black">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
