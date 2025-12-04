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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] bg-noise px-4 py-12">
      {/* Logo Header */}
      <div className="mb-8 text-center">
        <div className="inline-block bg-gallery-gold border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
          <span className="text-4xl font-black text-black font-display">M</span>
        </div>
        <h1 className="text-3xl font-black text-gallery-black font-display">Miicel.io</h1>
      </div>

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

      {/* Footer Note */}
      <p className="mt-8 text-xs font-mono text-gray-500 uppercase tracking-wider">
        Platform Access Only
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
        <div className="text-[#1A1A1A]">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
