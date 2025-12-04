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
    <div className="min-h-screen flex flex-col items-center justify-center bg-alabaster bg-noise px-4 py-12">
      {/* Logo Header */}
      <div className="mb-10 text-center">
        <div className="inline-block bg-gold border-2 border-charcoal p-5 shadow-elegant-lg mb-4 rounded-sm transition-all duration-300 hover:shadow-elegant-hover hover:-translate-y-0.5">
          <span className="text-4xl font-semibold text-white font-display">M</span>
        </div>
        <h1 className="text-3xl font-semibold text-charcoal font-display tracking-tight">Miicel.io</h1>
        <p className="text-sm text-slate mt-2 font-medium">Platform Access</p>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-gray-200 shadow-elegant-lg p-8 rounded-sm relative overflow-hidden transition-all duration-300 hover:shadow-elegant-hover hover:border-gold/30" data-testid="login-form">
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

      {/* Footer Note */}
      <p className="mt-8 text-xs text-slate uppercase tracking-wider font-medium">
        Platform Access Only
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-alabaster">
        <div className="text-charcoal font-medium">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
