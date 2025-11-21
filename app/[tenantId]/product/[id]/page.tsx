/**
 * Product Detail Page
 *
 * Server component that fetches tenant config + product data.
 * Layout: Image carousel | Product details (desktop), stacked (mobile)
 *
 * Route: /shop/[tenant]/product/[id]
 * Example: /shop/sky/product/1
 */

import { notFound } from 'next/navigation'
import { TenantHeader } from '@/components/commerce/TenantHeader'
import { ThemeProvider } from '@/components/commerce/ThemeProvider'
import { ProductImageCarousel } from '@/components/commerce/ProductImageCarousel'
import { ColorSelector } from '@/components/commerce/ColorSelector'
import { QuantityControl } from '@/components/commerce/QuantityControl'
import { AddToCartButton } from '@/components/commerce/AddToCartButton'
import { ProductClient } from './ProductClient'
import { ProductDetailWrapper } from '@/components/storefront/ProductDetailWrapper'
import { tenantConfigResponseSchema } from '@/lib/schemas/order'
import { createClient } from '@/lib/supabase/server'
import type { Product, ProductColor } from '@/types/commerce'

interface PageProps {
  params: Promise<{ tenantId: string; id: string }>
}

// Mock colors until product_variants table is built
const mockColors: ProductColor[] = [
  { id: 'red', name: 'Rojo', hex: '#dc2626' },
  { id: 'blue', name: 'Azul', hex: '#2563eb' },
  { id: 'gray', name: 'Gris', hex: '#6b7280' },
]

async function getTenantConfig(tenant: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const res = await fetch(`${baseUrl}/api/tenant/${tenant}/config`, {
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

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, stock, category, image_url')
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
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { tenantId, id } = await params
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
  if (config.template === 'restaurant') {
    product.stock = 999
  }

  // Gallery template: Use new ProductDetailWrapper (SKY-43)
  if (config.template === 'gallery') {
    // Transform product data for ProductDetailWrapper
    const productDetail = {
      id: product.id,
      name: product.name,
      artist: product.artist
        ? {
            id: product.artist,
            name: product.artist,
            slug: product.artist.toLowerCase().replace(/\s+/g, '-'),
          }
        : undefined,
      price: product.price,
      currency: product.currency,
      priceType: 'fixed' as const, // MVP: fixed price, future: 'from' if options
      description: product.description || '',
      images: product.images.map((url, idx) => ({
        id: `${product.id}-${idx}`,
        url,
        alt: product.name,
        width: 800,
        height: 800,
      })),
      options: [
        // MVP: Single option (physical product)
        {
          id: `${product.id}-default`,
          type: 'physical' as const,
          title: 'Standard',
          specs: ['In stock', `${product.stock} available`],
          price: product.price,
          currency: product.currency,
          stock: product.stock,
          sku: product.id,
        },
      ],
    }

    return (
      <ThemeProvider config={config}>
        <main
          className="min-h-screen"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <TenantHeader config={config} />
          <ProductDetailWrapper
            product={productDetail}
            tenantId={tenantId}
          />
        </main>
      </ThemeProvider>
    )
  }

  // Legacy templates: Use existing ProductClient layout
  return (
    <ThemeProvider config={config}>
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
                {config.template !== 'restaurant' && (
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
