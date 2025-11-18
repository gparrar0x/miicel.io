/**
 * SKY-43: ProductGrid Component
 * Responsive grid container for product cards (mobile-first)
 *
 * Usage:
 * ```tsx
 * import { ProductGrid } from '@/components/storefront/ProductGrid'
 *
 * function StorefrontPage() {
 *   const products = [...] // from API
 *
 *   return (
 *     <ProductGrid
 *       template="gallery"
 *       products={products}
 *       loading={false}
 *       onProductClick={(product) => router.push(`/products/${product.id}`)}
 *       onQuickView={(id) => setQuickViewId(id)}
 *     />
 *   )
 * }
 * ```
 *
 * Features:
 * - Mobile portrait: 1 col (<640px)
 * - Mobile landscape: 2 cols (640-900px)
 * - Tablet/Desktop: 3 cols (>900px)
 * - Gallery template: GalleryCard with Quick View support
 * - Loading skeleton state
 * - Empty state handling
 *
 * Test ID: product-grid
 * Created: 2025-01-17 (SKY-43 Phase 1)
 */

'use client'

import { Product } from '@/types/commerce'
import { TenantTemplate } from '@/types/theme'
import { GalleryCard } from './GalleryCard'
import { DetailCard } from './DetailCard'
import { MinimalCard } from './MinimalCard'

interface ProductGridProps {
  template: TenantTemplate
  products: Product[]
  loading?: boolean
  onProductClick?: (product: Product) => void
  onQuickView?: (productId: string) => void
  onWishlist?: (productId: string) => void
  'data-testid'?: string
}

/**
 * ProductGrid - Renders product cards in responsive grid
 * Mobile-first: 1 col portrait, 2 cols landscape, 3 cols desktop
 */
export function ProductGrid({
  template,
  products,
  loading = false,
  onProductClick,
  onQuickView,
  onWishlist,
  'data-testid': testId = 'product-grid',
}: ProductGridProps) {
  // Determine which card component to render
  const CardComponent = {
    gallery: GalleryCard,
    detail: DetailCard,
    minimal: MinimalCard,
    restaurant: GalleryCard, // TODO: Replace with RestaurantCard
  }[template]

  // Loading state - show skeleton cards
  if (loading) {
    const skeletonCount = template === 'minimal' ? 8 : template === 'detail' ? 4 : 6

    return (
      <div
        data-testid={testId}
        className="flex flex-col gap-[var(--card-gap-mobile)]
                   sm:grid sm:grid-cols-2 sm:gap-[var(--card-gap-mobile)]
                   md:grid-cols-3 md:gap-[var(--card-gap-tablet)]
                   lg:gap-[var(--card-gap-desktop)]
                   px-[var(--spacing-sm)] max-w-[1200px] mx-auto"
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <CardComponent
            key={`skeleton-${i}`}
            product={{} as Product}
            loading={true}
          />
        ))}
      </div>
    )
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div
        data-testid={testId}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-[var(--color-text-primary)]">
            No products found
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Check back later for new products.
          </p>
        </div>
      </div>
    )
  }

  // Product grid - Mobile-first responsive
  return (
    <div
      data-testid={testId}
      className="flex flex-col gap-[var(--card-gap-mobile)]
                 sm:grid sm:grid-cols-2 sm:gap-[var(--card-gap-mobile)]
                 md:grid-cols-3 md:gap-[var(--card-gap-tablet)]
                 lg:gap-[var(--card-gap-desktop)]
                 px-[var(--spacing-sm)] max-w-[1200px] mx-auto"
    >
      {products.map((product, index) => (
        <CardComponent
          key={product.id}
          product={product}
          onClick={() => onProductClick?.(product)}
          onQuickView={template === 'gallery' ? onQuickView : undefined}
          onWishlist={onWishlist}
          // First 2 cards: eager load (above fold), rest lazy
          loading={false}
        />
      ))}
    </div>
  )
}
