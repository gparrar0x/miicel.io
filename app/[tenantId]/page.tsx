/**
 * Tenant Storefront Home Page
 *
 * Displays product catalog with categories, search, and tenant branding.
 * Mobile-first layout matching reference design.
 *
 * Route: /[tenantId]
 * Example: /sky
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TenantHeader } from '@/components/commerce/TenantHeader'
import { ThemeProvider } from '@/components/commerce/ThemeProvider'
import { ProductGrid as ProductGridLegacy } from '@/components/commerce/ProductGrid'
import { GalleryGridWrapper } from '@/components/storefront/GalleryGridWrapper'
import { CartBadge } from '@/components/commerce/CartBadge'
import { RestaurantLayout } from '@/components/restaurant/layouts/RestaurantLayout'
import { tenantConfigResponseSchema } from '@/lib/schemas/order'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<{ category?: string; search?: string }>
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

async function getProducts(tenantId: string, category?: string, search?: string) {
  const supabase = await createClient()

  // Get tenant ID from slug
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantId)
    .single()

  if (!tenant) return []

  let query = supabase
    .from('products')
    .select('id, name, description, price, category, image_url, stock')
    .eq('tenant_id', tenant.id)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch products:', error)
    return []
  }

  // Map DB schema to Product type (support both legacy and SKY-43 components)
  return (data || []).map(p => ({
    id: String(p.id), // Convert to string for SKY-43 ProductGrid, legacy supports both
    name: p.name,
    description: p.description,
    price: p.price,
    currency: 'CLP', // TODO: Get from tenant config
    images: p.image_url ? [p.image_url] : [],
    colors: [],
    stock: p.stock || 0,
    category: p.category,
    image_url: p.image_url, // For legacy ProductGrid compatibility
    // SKY-43 gallery fields (optional)
    artist: undefined,
    type: undefined,
    optionsCount: undefined,
    isNew: false,
    isLimited: false,
    isFeatured: false,
  }))
}

async function getCategories(tenantId: string) {
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantId)
    .single()

  if (!tenant) return []

  const { data } = await supabase
    .from('products')
    .select('category')
    .eq('tenant_id', tenant.id)
    .eq('active', true)
    .order('category')

  if (!data) return []

  // Get unique categories
  const categories = [...new Set(data.map((p) => p.category).filter(Boolean))]
  return categories as string[]
}

export default async function StorefrontPage({ params, searchParams }: PageProps) {
  const { tenantId } = await params
  const { category, search } = await searchParams

  const [config, products, categories] = await Promise.all([
    getTenantConfig(tenantId),
    getProducts(tenantId, category, search),
    getCategories(tenantId),
  ])

  if (!config) {
    notFound()
  }

  // Restaurant template: use dedicated layout
  if (config.template === 'restaurant') {
    // Icon mapping for categories
    const getCategoryIcon = (category: string): string => {
      const iconMap: Record<string, string> = {
        // SuperHotDog
        'PANCHOS': '🌭',
        'COMBOS': '🍔',
        'BEBIDAS': '🥤',
        'CERVEZA': '🍺',
        // MangoBajito
        'AREPAS': '🫓',
        'CACHAPAS': '🥞',
        'CLÁSICOS': '🍴',
        'SANDWICH': '🥪',
        // Generic fallbacks
        'HOT DOGS': '🌭',
        'HAMBURGUESAS': '🍔',
        'PIZZAS': '🍕',
        'ENSALADAS': '🥗',
        'POSTRES': '🍰',
        'CAFE': '☕',
      }
      return iconMap[category.toUpperCase()] || '🍽️'
    }

    const categoriesWithIcons = categories.map((cat) => ({
      id: cat,
      slug: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase(),
      icon: getCategoryIcon(cat),
      productCount: products.filter(p => p.category === cat).length,
    }))

    return (
      <ThemeProvider config={config}>
        <RestaurantLayout
          tenantSlug={tenantId}
          tenantName={config.businessName}
          tenantLogo={config.logoUrl}
          tenantLogoText={config.logoTextUrl}
          tenantBanner={config.bannerUrl}
          tenantSubtitle={config.subtitle || undefined}
          tenantLocation={config.location || undefined}
          products={products}
          categories={categoriesWithIcons}
          currency={config.currency}
        />
      </ThemeProvider>
    )
  }

  // Default templates: gallery/detail/minimal
  return (
    <ThemeProvider config={config}>
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <TenantHeader config={config} />

        <div className="px-4 md:px-6 max-w-[1440px] mx-auto py-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div
              className="rounded-2xl border-2 px-6 py-4 flex items-center gap-3"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: 'var(--color-text-tertiary)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar productos..."
                className="flex-1 bg-transparent outline-none text-base"
                style={{ color: 'var(--color-text-primary)' }}
                defaultValue={search}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Categorías
            </h2>
            <div className="space-y-2">
              <Link
                href={`/${tenantId}`}
                className={`block px-6 py-3 rounded-lg transition-colors ${
                  !category || category === 'all' ? 'font-medium' : ''
                }`}
                style={
                  !category || category === 'all'
                    ? {
                        backgroundColor: 'var(--color-primary-subtle)',
                        color: 'var(--color-primary)',
                      }
                    : { color: 'var(--color-text-primary)' }
                }
              >
                Todas
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/${tenantId}?category=${cat}`}
                  className={`block px-6 py-3 rounded-lg transition-colors capitalize ${
                    category === cat ? 'font-medium' : ''
                  }`}
                  style={
                    category === cat
                      ? {
                          backgroundColor: 'var(--color-primary-subtle)',
                          color: 'var(--color-primary)',
                        }
                      : { color: 'var(--color-text-primary)' }
                  }
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {config.template === 'gallery' ? (
            <GalleryGridWrapper products={products} tenantId={tenantId} />
          ) : (
            <ProductGridLegacy products={products} tenantId={tenantId} currency={config.currency} />
          )}
        </div>

        {/* Floating Cart Button */}
        <Link
          href={`/${tenantId}/cart`}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110"
          style={{ backgroundColor: 'var(--color-primary)' }}
          data-testid="cart-floating-button"
        >
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {/* Cart badge - connected to cart store */}
          <CartBadge />
        </Link>
      </main>
    </ThemeProvider>
  )
}
