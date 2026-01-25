/**
 * Product Detail Page
 *
 * Server component that fetches tenant config + product data.
 * Layout: Image carousel | Product details (desktop), stacked (mobile)
 *
 * Route: /[locale]/[tenantId]/p/[id]
 * Example: /en/artmonkeys/p/19
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { TenantHeader } from '@/components/commerce/TenantHeader'
import { ThemeProvider } from '@/components/commerce/ThemeProvider'
import { ProductImageCarousel } from '@/components/commerce/ProductImageCarousel'
import { ColorSelector } from '@/components/commerce/ColorSelector'
import { QuantityControl } from '@/components/commerce/QuantityControl'
import { AddToCartButton } from '@/components/commerce/AddToCartButton'
import { ProductClient } from './ProductClient'
import { ArtworkDetail } from '@/components/gallery-v2/ArtworkDetail'
import { GalleryHeader } from '@/components/gallery-v2/GalleryHeader'
import { ProductStructuredData } from '@/components/seo/StructuredData'
import { tenantConfigResponseSchema } from '@/lib/schemas/order'
import { createClient } from '@/lib/supabase/server'
import type { Product, ProductColor } from '@/types/commerce'

interface PageProps {
  params: Promise<{ locale: string; tenantId: string; id: string }>
}

// Mock colors until product_variants table is built
const mockColors: ProductColor[] = [
  { id: 'red', name: 'Rojo', hex: '#dc2626' },
  { id: 'blue', name: 'Azul', hex: '#2563eb' },
  { id: 'gray', name: 'Gris', hex: '#6b7280' },
]

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

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, stock, category, image_url, metadata')
    .eq('id', parseInt(id, 10))
    .single()

  if (error || !data) {
    console.error('Failed to fetch product:', error)
    return null
  }

  // Transform DB response to Product type
  // MVP: DB has image_url (string), we adapt to images array
  return {
    id: String(data.id),
    name: data.name,
    description: data.description,
    price: data.price,
    currency: '', // Will be set from tenant config
    images: data.image_url ? [data.image_url] : ['/placeholder.svg'],
    colors: mockColors, // MVP: static colors
    stock: data.stock ?? 0,
    category: data.category,
    metadata: data.metadata,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tenantId: string; id: string }>
}): Promise<Metadata> {
  const { locale, tenantId, id } = await params

  const [config, product] = await Promise.all([
    getTenantConfig(tenantId),
    getProduct(id),
  ])

  if (!config || !product) {
    return {}
  }

  const baseUrl = `https://miicel.io/${locale}/${tenantId}/p/${id}`
  const price = `${config.currency} ${product.price.toFixed(2)}`

  const description = product.description
    ? `${product.description}. Compra a ${price} en ${config.businessName}.`
    : `${product.name}. Disponible a ${price} en ${config.businessName}.`

  return {
    title: `${product.name} | ${config.businessName}`,
    description,
    metadataBase: new URL('https://miicel.io'),
    openGraph: {
      title: product.name,
      description: `${product.name} - ${price}`,
      type: 'website',
      url: baseUrl,
      images: product.images[0]
        ? [
            {
              url: product.images[0],
              width: 600,
              height: 600,
              alt: product.name,
            },
          ]
        : [],
    },
    alternates: {
      canonical: baseUrl,
      languages: {
        'es-ES': `https://miicel.io/es/${tenantId}/p/${id}`,
        'en-US': `https://miicel.io/en/${tenantId}/p/${id}`,
      },
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  // Force rebuild: Fix 404 on production
  const { tenantId, id, locale } = await params
  const [config, product] = await Promise.all([
    getTenantConfig(tenantId),
    getProduct(id),
  ])

  if (!config || !product) {
    notFound()
  }

  // Set currency from tenant config
  product.currency = config.currency

  // Restaurant template: Ignore stock (assume infinite)
  if (config.template === 'gastronomy') {
    product.stock = 999
  }

  // Gallery template: Use new ArtworkDetail (v0 design)
  if (config.template === 'gallery') {
    // Parse sizes from metadata or use default (disabled)
    const metadataSizes = product.metadata?.sizes || []
    const sizes = metadataSizes.length > 0
      ? metadataSizes
      : [{
        id: 'default',
        dimensions: 'Standard',
        price: product.price,
        stock: 0, // Disabled - requires explicit metadata.sizes configuration
        label: 'Standard'
      }]

    const artwork = {
      id: product.id,
      title: product.name,
      artist: product.artist || 'Unknown Artist',
      year: new Date().getFullYear(),
      description: product.description || '',
      technique: 'Mixed Media',
      collection: product.category || 'All Works',
      image: product.images[0] || '/placeholder.svg',
      price: product.price,
      currency: product.currency,
      sizes,
      isLimitedEdition: product.isLimited || false
    }

    return (
      <ThemeProvider config={config}>
        <ProductStructuredData
          product={product}
          tenant={{ slug: tenantId, businessName: config.businessName }}
          locale={locale}
        />
        <main className="min-h-screen bg-white text-black">
          <GalleryHeader config={config} tenantId={tenantId} />
          <ArtworkDetail artwork={artwork} relatedArtworks={[]} tenantId={tenantId} />
        </main>
      </ThemeProvider>
    )
  }

  // Legacy templates: Use existing ProductClient layout
  return (
    <ThemeProvider config={config}>
      <ProductStructuredData
        product={product}
        tenant={{ slug: tenantId, businessName: config.businessName }}
        locale={locale}
      />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <TenantHeader config={config} />

        <div className="px-4 md:px-6 max-w-[1440px] mx-auto py-8">
          <div
            className="rounded-lg p-6 md:p-8"
            style={{ backgroundColor: 'var(--color-bg-elevated)' }}
            data-testid={`product-${product.id}-container`}
          >
            {/* Desktop: 2-col layout, Mobile: stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left: Image Carousel */}
              <div>
                <ProductImageCarousel
                  images={product.images}
                  productName={product.name}
                  productId={product.id}
                />
              </div>

              {/* Right: Product Details */}
              <div className="space-y-6">
                <div>
                  <h1
                    className="text-2xl md:text-3xl font-bold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                    data-testid={`product-${product.id}-title`}
                  >
                    {product.name}
                  </h1>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: 'var(--color-primary)' }}
                    data-testid={`product-${product.id}-price`}
                  >
                    {product.currency} {product.price.toFixed(2)}
                  </p>
                </div>

                {product.description && (
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                    data-testid={`product-${product.id}-description`}
                  >
                    {product.description}
                  </p>
                )}

                {/* Stock indicator */}
                {config.template !== 'gastronomy' && (
                  <div
                    className="text-sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                    data-testid={`product-${product.id}-stock`}
                  >
                    {product.stock > 0 ? (
                      <span className="text-green-600">
                        In stock ({product.stock} available)
                      </span>
                    ) : (
                      <span className="text-red-600">Out of stock</span>
                    )}
                  </div>
                )}

                {/* Client-side interactive components */}
                <ProductClient
                  product={product}
                  maxQuantity={Math.min(product.stock, 99)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </ThemeProvider>
  )
}
