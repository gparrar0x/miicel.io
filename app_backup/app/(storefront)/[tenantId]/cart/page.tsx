/**
 * Shopping Cart Page
 *
 * Displays cart items with quantities, prices, and summary.
 * Empty state when no items in cart.
 *
 * Route: /shop/[tenant]/cart
 */

import { notFound } from 'next/navigation'
import { TenantHeader } from '@/components/commerce/TenantHeader'
import { ThemeProvider } from '@/components/commerce/ThemeProvider'
import { CartClient } from './CartClient'
import { tenantConfigResponseSchema } from '@/lib/schemas/order'

interface PageProps {
  params: Promise<{ tenantId: string }>
}

async function getTenantConfig(tenantId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const res = await fetch(`${baseUrl}/api/tenant/${tenantId}/config`, {
      cache: 'no-store',
    })

    if (!res.ok) return null

    const data = await res.json()
    return tenantConfigResponseSchema.parse(data)
  } catch (error) {
    console.error('Failed to load tenant config:', error)
    return null
  }
}

export default async function CartPage({ params }: PageProps) {
  const { tenantId } = await params
  const config = await getTenantConfig(tenantId)

  if (!config) {
    notFound()
  }

  return (
    <ThemeProvider config={config}>
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <TenantHeader config={config} />

        <div className="px-4 md:px-6 max-w-[1440px] mx-auto py-8">
          <h1
            className="text-2xl md:text-3xl font-bold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
            data-testid="cart-page-title"
          >
            Shopping Cart
          </h1>

          <CartClient />
        </div>
      </main>
    </ThemeProvider>
  )
}
