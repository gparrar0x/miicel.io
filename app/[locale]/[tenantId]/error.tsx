'use client'

/**
 * Storefront error boundary
 * Route: /[locale]/[tenantId]
 */
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function StorefrontError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[StorefrontError]', error)
  }, [error])

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4"
      data-testid="storefront-error-boundary"
    >
      <div className="max-w-md w-full text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
          Error
        </p>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mb-3">
          Algo salió mal
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mb-8">
          {error.message || 'No pudimos cargar esta tienda. Por favor intenta de nuevo.'}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-11 px-6 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-mono text-sm uppercase tracking-wider hover:opacity-80 transition-opacity"
          data-testid="storefront-error-retry-btn"
          type="button"
        >
          Reintentar
        </button>
        {error.digest && (
          <p className="mt-4 font-mono text-xs text-[var(--color-text-muted)]">
            ID: {error.digest}
          </p>
        )}
      </div>
    </main>
  )
}
