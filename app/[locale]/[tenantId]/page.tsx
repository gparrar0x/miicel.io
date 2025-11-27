/**
 * Tenant Storefront Home Page (Neo-Brutalist Editorial)
 *
 * Route: /[tenantId]
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { TenantHeader } from '@/components/commerce/TenantHeader'
import { ThemeProvider } from '@/components/commerce/ThemeProvider'
import { ProductGrid as ProductGridLegacy } from '@/components/commerce/ProductGrid'
import { GalleryGrid } from '@/components/gallery-v2/GalleryGrid'
import { GalleryHeader } from '@/components/gallery-v2/GalleryHeader'
import { CartBadge } from '@/components/commerce/CartBadge'
import { RestaurantLayout } from '@/components/restaurant/layouts/RestaurantLayout'
import { tenantConfigResponseSchema, type TenantConfigResponse } from '@/lib/schemas/order'
import { createClient } from '@/lib/supabase/server'
import { GalleryGridWrapper } from '@/components/storefront/GalleryGridWrapper'
import { DashboardAccessButton } from '@/components/DashboardAccessButton'

interface PageProps {
  params: Promise<{ locale: string; tenantId: string }>
  searchParams: Promise<{ category?: string; search?: string }>
}

async function getTenantConfig(tenantId: string): Promise<TenantConfigResponse | null> {
  const supabase = await createClient()

  try {
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('config, template')
      .eq('slug', tenantId)
      .single()

    if (error || !tenant) {
      console.error('Error fetching tenant config:', error)
      return null
    }

    const config = (tenant.config as any) || {}

    console.log(`[getTenantConfig] Raw config from DB:`, JSON.stringify(config, null, 2))
    console.log(`[getTenantConfig] config.template value:`, config.template)

    // Map DB config to schema expected format
    const mappedConfig = {
      id: tenantId,
      businessName: config.business_name || config.businessName || 'Store',
      subtitle: config.subtitle || null,
      location: config.location || null,
      bannerUrl: config.banner || config.bannerUrl || null,
      logoUrl: config.logo || config.logoUrl || null,
      logoTextUrl: config.logoText || config.logoTextUrl || null,
      colors: {
        primary: config.colors?.primary || '#000000',
        secondary: config.colors?.secondary || '#ffffff',
        accent: config.colors?.accent || config.colors?.primary || '#000000',
        background: config.colors?.background || '#ffffff',
        surface: config.colors?.surface || '#f8f8f8',
        textPrimary: config.colors?.textPrimary || config.colors?.text_primary || '#000000',
        textSecondary: config.colors?.textSecondary || config.colors?.text_secondary || '#666666',
      },
      hours: config.hours || {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '14:00' },
        sunday: { open: '00:00', close: '00:00' },
      },
      currency: config.currency || 'USD',
      template: (tenant as any).template || config.template || 'gallery',
    }

    return tenantConfigResponseSchema.parse(mappedConfig)
  } catch (error) {
    console.error('Failed to parse tenant config:', error)
    return null
  }
}

async function getProducts(tenantId: string, category?: string, search?: string) {
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantId)
    .single()

  if (!tenant) return []

  let query = supabase
    .from('products')
    .select('id, name, description, price, category, image_url, stock, metadata')
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

  return (data || []).map(p => ({
    id: String(p.id),
    name: p.name,
    description: p.description,
    price: p.price,
    currency: 'CLP',
    images: p.image_url ? [p.image_url] : [],
    colors: [],
    stock: p.stock || 0,
    category: p.category,
    image_url: p.image_url,
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

  const categories = [...new Set(data.map((p) => p.category).filter(Boolean))]
  return categories as string[]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tenantId: string }>
}): Promise<Metadata> {
  const { locale, tenantId } = await params
  const config = await getTenantConfig(tenantId)

  if (!config) {
    return {
      title: 'Tienda | Miicel.io',
      description: 'Descubre nuestra tienda online en Miicel.io',
    }
  }

  const baseUrl = `https://miicel.io/${locale}/${tenantId}`

  const description = config.subtitle
    ? `${config.businessName}. ${config.subtitle}. Ordena online ahora.`
    : `Tienda online de ${config.businessName}. Descubre nuestros productos en Miicel.io.`

  return {
    title: `${config.businessName} - Tienda Online | Miicel.io`,
    description,
    metadataBase: new URL('https://miicel.io'),
    openGraph: {
      title: config.businessName,
      description: config.subtitle || 'Tienda online en Miicel.io',
      type: 'website',
      url: baseUrl,
      images: config.logoUrl
        ? [{ url: config.logoUrl, width: 200, height: 200 }]
        : config.bannerUrl
        ? [{ url: config.bannerUrl, width: 1200, height: 630 }]
        : [],
    },
    alternates: {
      canonical: baseUrl,
      languages: {
        'es-ES': `https://miicel.io/es/${tenantId}`,
        'en-US': `https://miicel.io/en/${tenantId}`,
      },
    },
  }
}

export default async function StorefrontPage({ params, searchParams }: PageProps) {
  const { tenantId } = await params
  const { category } = await searchParams

  const [config, products, categories] = await Promise.all([
    getTenantConfig(tenantId),
    getProducts(tenantId, category),
    getCategories(tenantId),
  ])

  if (!config) {
    notFound()
  }

  console.log(`[${tenantId}] Template from config:`, config.template)
  console.log(`[${tenantId}] Template type:`, typeof config.template)
  console.log(`[${tenantId}] Template === 'restaurant':`, config.template === 'restaurant')
  console.log(`[${tenantId}] Full config:`, JSON.stringify(config, null, 2))

  if (config.template === 'restaurant') {
    console.log(`[${tenantId}] ✓ RENDERING RESTAURANT LAYOUT`)
    
    const getCategoryIcon = (category: string): string => {
      const iconMap: Record<string, string> = {
        'PANCHOS': '🌭', 'COMBOS': '🍔', 'BEBIDAS': '🥤', 'CERVEZA': '🍺',
        'AREPAS': '🫓', 'CACHAPAS': '🥞', 'CLÁSICOS': '🍴', 'SANDWICH': '🥪',
        'HOT DOGS': '🌭', 'HAMBURGUESAS': '🍔', 'PIZZAS': '🍕', 'ENSALADAS': '🥗',
        'POSTRES': '🍰', 'CAFE': '☕',
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
          hours={config.hours}
          products={products}
          categories={categoriesWithIcons}
          currency={config.currency}
        />
        <DashboardAccessButton tenantId={tenantId} />
      </ThemeProvider>
    )
  }

  if (config.template === 'gallery') {
    console.log(`[${tenantId}] ✓ RENDERING GALLERY LAYOUT`)
    // Transform products to Artwork format for new GalleryGrid
    const artworks = products.map(p => {
      // Check if product has custom sizes in metadata
      const metadataSizes = (p as any).metadata?.sizes

      // Default sizes for gallery template (disabled if no metadata.sizes)
      // Products without metadata.sizes configured will have all sizes disabled (stock: 0)
      const defaultSizes = [
        {
          id: 'small',
          dimensions: '30 × 40 cm',
          price: p.price,
          stock: 0, // Disabled - requires explicit metadata.sizes configuration
          label: 'Small'
        },
        {
          id: 'medium',
          dimensions: '50 × 70 cm',
          price: Math.round(p.price * 1.5),
          stock: 0, // Disabled - requires explicit metadata.sizes configuration
          label: 'Medium'
        },
        {
          id: 'large',
          dimensions: '100 × 140 cm',
          price: Math.round(p.price * 2.5),
          stock: 0, // Disabled - requires explicit metadata.sizes configuration
          label: 'Large'
        }
      ]

      return {
        id: String(p.id),
        title: p.name,
        artist: p.artist || 'Unknown Artist',
        year: new Date().getFullYear(),
        description: p.description || '',
        technique: 'Mixed Media',
        collection: p.category || 'All Works',
        image: p.images[0] || '/placeholder.svg',
        price: p.price,
        currency: config.currency,
        sizes: metadataSizes || defaultSizes,
        isLimitedEdition: p.isLimited || false
      }
    })

    return (
      <ThemeProvider config={config}>
        <main className="min-h-screen bg-white text-black">
          <GalleryHeader config={config} tenantId={tenantId} />
          <div className="container mx-auto px-4 py-8">
             <GalleryGrid artworks={artworks} collections={categories} tenantId={tenantId} />
          </div>
        </main>
        <DashboardAccessButton tenantId={tenantId} />
      </ThemeProvider>
    )
  }

  // Default templates: detail/minimal (Legacy)
  return (
    <ThemeProvider config={config}>
      <main className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
        <TenantHeader config={config} />

        {/* Hero / Categories Section */}
        <div className="max-w-[var(--container-width)] mx-auto px-4 py-8 mb-8 border-b border-black/10">
          <div className="flex flex-wrap gap-6 items-baseline">
            <h2 className="font-display text-4xl font-bold italic">
              {category ? category.toUpperCase() : 'ALL WORKS'}
            </h2>

            {/* Minimal Category Links */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <Link
                href={`/${tenantId}`}
                className={`font-mono text-sm uppercase tracking-wider hover:underline decoration-2 underline-offset-4 ${!category || category === 'all' ? 'underline font-bold' : 'text-gray-500'}`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/${tenantId}?category=${cat}`}
                  className={`font-mono text-sm uppercase tracking-wider hover:underline decoration-2 underline-offset-4 whitespace-nowrap ${category === cat ? 'underline font-bold' : 'text-gray-500'}`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="animate-reveal">
          {(config.template as string) === 'gallery' ? (
            <GalleryGridWrapper products={products} tenantId={tenantId} />
          ) : (
            <ProductGridLegacy products={products} tenantId={tenantId} currency={config.currency} />
          )}
        </div>

        {/* Floating Cart Button - Brutalist Style */}
        <Link
          href={`/${tenantId}/cart`}
          className="fixed bottom-8 right-8 w-16 h-16 bg-black text-white flex items-center justify-center z-50 shadow-[4px_4px_0px_0px_rgba(255,255,255,1),8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1),10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
          data-testid="cart-floating-button"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <CartBadge />
        </Link>

        <DashboardAccessButton tenantId={tenantId} />
      </main>
    </ThemeProvider>
  )
}
