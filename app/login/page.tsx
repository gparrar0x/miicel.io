'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
      const returnUrl = searchParams.get('returnUrl') || '/'
      window.location.href = returnUrl
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8" data-testid="login-form">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6 text-center">
            Sign In
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#1A1A1A] mb-1"
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
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#1A1A1A] mb-1"
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
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-50"
              />
            </div>

            {error && (
              <div
                data-testid="login-error-message"
                className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit-button"
              className="w-full py-2 px-4 bg-[#FF6B35] text-white font-medium rounded-md hover:bg-[#E55A2B] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
