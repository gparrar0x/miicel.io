import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = 'https://miicel.io'
const LOCALES = ['es', 'en'] as const

/**
 * Dynamic sitemap for miicel.io multi-tenant storefronts
 *
 * Auto-discovers:
 * - All active tenant storefronts (/{locale}/{tenant})
 * - Top 50 tenants' products (/{locale}/{tenant}/products/p/{id})
 *
 * SEO Strategy:
 * - Storefront pages: priority 0.8, daily refresh (high traffic)
 * - Product pages: priority 0.6, weekly refresh (stable inventory)
 *
 * Performance:
 * - Limits to 50 tenants × 100 products = ~10k URLs max
 * - Uses tenant.updated_at for smart caching
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Fetch all active tenants, sorted by recent updates
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, slug, updated_at')
    .eq('active', true)
    .order('updated_at', { ascending: false })

  if (!tenants || tenants.length === 0) {
    return []
  }

  const routes: MetadataRoute.Sitemap = []

  // 1. Add storefront pages for all active tenants (all locales)
  for (const locale of LOCALES) {
    for (const tenant of tenants) {
      routes.push({
        url: `${BASE_URL}/${locale}/${tenant.slug}`,
        lastModified: new Date(tenant.updated_at || Date.now()),
        changeFrequency: 'daily',
        priority: 0.8,
      })
    }
  }

  // 2. Add product pages (top 50 tenants, max 100 products each)
  // Prevents sitemap bloat while covering high-traffic stores
  const topTenants = tenants.slice(0, 50)

  for (const locale of LOCALES) {
    for (const tenant of topTenants) {
      const { data: products } = await supabase
        .from('products')
        .select('id, updated_at')
        .eq('tenant_id', tenant.id)
        .eq('active', true)
        .order('display_order', { ascending: true })
        .limit(100)

      if (products && products.length > 0) {
        products.forEach(product => {
          routes.push({
            url: `${BASE_URL}/${locale}/${tenant.slug}/products/p/${product.id}`,
            lastModified: new Date(product.updated_at || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.6,
          })
        })
      }
    }
  }

  return routes
}
