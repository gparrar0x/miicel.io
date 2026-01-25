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
import { GalleryHeader } from '@/components/gallery-v2/GalleryHeader'
import { CartClientGallery } from '@/components/gallery-v2/CartClientGallery'
import { ThemeProvider } from '@/components/commerce/ThemeProvider'
import { CartClient } from './CartClient'
import { tenantConfigResponseSchema } from '@/lib/schemas/order'

interface PageProps {
  params: Promise<{ tenantId: string }>
}

import { createClient } from '@/lib/supabase/server'

async function getTenantConfig(tenantSlug: string) {
  const supabase = await createClient()

  try {
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, slug, name, config, template, active')
      .eq('slug', tenantSlug)
      .eq('active', true)
      .maybeSingle()

    if (error || !tenant) {
      console.error('Tenant not found or error:', error)
      return null
    }

    // Parse config JSONB
    const config = (tenant.config as any) || {}

    // Build response DTO (replicated from API route)
    const validTemplates = ['gallery', 'detail', 'minimal', 'gastronomy'] as const
    const rawTemplate = (tenant as any).template
    const template = validTemplates.includes(rawTemplate) ? rawTemplate : 'gallery'

    const tenantConfig = {
      id: tenant.slug,
      businessName: config.business_name || config.business?.name || tenant.name,
      subtitle: config.subtitle || config.business?.subtitle || null,
      location: config.location || config.business?.location || null,
      bannerUrl: config.banner_url || config.banner || null,
      logoUrl: config.logo_url || config.logo || null,
      logoTextUrl: config.logo_text_url || config.logoText || null,
      colors: {
        primary: config.colors?.primary || '#3B82F6',
        secondary: config.colors?.secondary || '#10B981',
        accent: config.colors?.accent || config.colors?.primary || '#3B82F6',
        background: config.colors?.background || '#FFFFFF',
        surface: config.colors?.surface || '#F8F8F8',
        textPrimary: config.colors?.textPrimary || config.colors?.text_primary || '#000000',
        textSecondary: config.colors?.textSecondary || config.colors?.text_secondary || '#999999',
      },
      hours: config.hours || {},
      currency: config.currency || 'USD',
      template,
    }

    return tenantConfigResponseSchema.parse(tenantConfig)
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

  // Gallery template: Use new GalleryHeader + CartClientGallery
  if (config.template === 'gallery') {
    return (
      <ThemeProvider config={config}>
        <main className="min-h-screen bg-white text-black">
          <GalleryHeader config={config} tenantId={tenantId} />

          <div className="container mx-auto px-4 py-12 max-w-6xl">
            <h1
              className="font-serif font-bold mb-10 text-black"
              style={{ fontSize: 'var(--font-size-h1)' }}
              data-testid="cart-page-title"
            >
              Carrito de Compras
            </h1>

            <CartClientGallery tenantId={tenantId} />
          </div>
        </main>
      </ThemeProvider>
    )
  }

  // Legacy templates: Use old TenantHeader
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
