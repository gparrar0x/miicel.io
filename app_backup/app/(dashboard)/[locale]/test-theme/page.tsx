/**
 * Theme Test Page (No Middleware)
 *
 * Direct test of ThemeProvider + TenantHeader without tenant slug routing
 * Hardcoded to 'sky' tenant for Phase 1 validation
 *
 * Access: http://localhost:3001/test-theme
 */

import { TenantHeader } from '@/components/commerce/TenantHeader'
import { ThemeProvider } from '@/components/commerce/ThemeProvider'
import { tenantConfigResponseSchema } from '@/lib/schemas/order'

async function getTenantConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

  try {
    const res = await fetch(`${baseUrl}/api/tenant/sky/config`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`)
    }

    const data = await res.json()
    return tenantConfigResponseSchema.parse(data)
  } catch (error) {
    console.error('Failed to load tenant config:', error)
    return null
  }
}

export default async function TestThemePage() {
  const config = await getTenantConfig()

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Failed to Load Tenant Config</h1>
          <p className="text-gray-600">Check API endpoint: /api/tenant/sky/config</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider config={config}>
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <TenantHeader config={config} />

        {/* Phase 1 Test Content */}
        <div className="px-4 md:px-6 max-w-[1440px] mx-auto py-8">
          <div
            className="p-6 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-elevated)' }}
            data-testid="test-content"
          >
            <h2
              className="text-[20px] md:text-[24px] font-bold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Phase 1: Foundation Complete ✅
            </h2>
            <ul
              className="space-y-2 text-[14px] md:text-[16px]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <li>✅ Tenant config loaded from API</li>
              <li>✅ CSS variables injected dynamically</li>
              <li>✅ TenantHeader renders with logo + banner</li>
              <li>
                ✅ Colors applied: Primary <span style={{ color: 'var(--color-primary)' }}>●</span>{' '}
                Secondary <span style={{ color: 'var(--color-secondary)' }}>●</span> Accent{' '}
                <span style={{ color: 'var(--color-accent)' }}>●</span>
              </li>
            </ul>

            <div className="mt-6 p-4 rounded" style={{ backgroundColor: 'var(--color-bg-base)' }}>
              <p className="text-sm font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                Tenant: {config.id}
              </p>
              <p className="text-sm font-mono mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                Business: {config.businessName}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Next: Phase 2 → Product page components
              </p>
            </div>

            {/* Color Samples */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className="p-4 rounded"
                style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
              >
                <p className="text-sm font-semibold">Primary</p>
                <p className="text-xs font-mono">{config.colors.primary}</p>
              </div>
              <div
                className="p-4 rounded"
                style={{ backgroundColor: 'var(--color-secondary)', color: 'white' }}
              >
                <p className="text-sm font-semibold">Secondary</p>
                <p className="text-xs font-mono">{config.colors.secondary}</p>
              </div>
              <div
                className="p-4 rounded"
                style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
              >
                <p className="text-sm font-semibold">Accent</p>
                <p className="text-xs font-mono">{config.colors.accent}</p>
              </div>
              <div
                className="p-4 rounded border"
                style={{
                  backgroundColor: 'var(--color-bg-base)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <p className="text-sm font-semibold">Surface</p>
                <p className="text-xs font-mono">{config.colors.surface}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ThemeProvider>
  )
}
