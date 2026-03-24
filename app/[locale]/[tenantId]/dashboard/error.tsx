'use client'

/**
 * Dashboard error boundary
 * Route: /[locale]/[tenantId]/dashboard
 */
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[DashboardError]', error)
  }, [error])

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4"
      data-testid="dashboard-error-boundary"
    >
      <div className="max-w-md w-full text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
          Error
        </p>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mb-3">
          Error en el dashboard
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mb-8">
          {error.message || 'No pudimos cargar el dashboard. Por favor intenta de nuevo.'}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-11 px-6 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-mono text-sm uppercase tracking-wider hover:opacity-80 transition-opacity"
          data-testid="dashboard-error-retry-btn"
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
    </div>
  )
}
