/**
 * ProductGrid - Responsive grid container for product cards
 *
 * Usage:
 * ```tsx
 * import { ProductGrid } from '@/components/storefront/ProductGrid'
 * import { useTheme } from '@/components/theme/use-theme'
 *
 * function StorefrontPage() {
 *   const theme = useTheme()
 *   const products = [...] // from API
 *
 *   return (
 *     <ProductGrid
 *       template={theme.template}
 *       products={products}
 *       loading={false}
 *       onProductClick={(product) => router.push(`/products/${product.id}`)}
 *     />
 *   )
 * }
 * ```
 *
 * Features:
 * - Accepts 'gallery' | 'detail' | 'minimal' template prop
 * - Renders appropriate card variant based on template
 * - Responsive columns from --grid-cols CSS var
 * - Loading skeleton state
 * - Empty state handling
 * - Uses useTheme() to access theme context
 *
 * Test ID: product-grid-{template}
 * Created: 2025-11-16 (Issue #4)
 */

'use client'

import { Product } from '@/types/commerce'
import { TenantTemplate } from '@/types/theme'
import { useTheme } from '@/components/theme/use-theme'
import { GalleryCard } from './GalleryCard'
import { DetailCard } from './DetailCard'
import { MinimalCard } from './MinimalCard'

interface ProductGridProps {
  template: TenantTemplate
  products: Product[]
  loading?: boolean
  onProductClick?: (product: Product) => void
}

/**
 * Responsive grid columns based on template
 * Falls back to --grid-cols CSS var from ThemeProvider
 */
const RESPONSIVE_COLS: Record<TenantTemplate, string> = {
  gallery: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  detail: 'grid-cols-1 lg:grid-cols-2',
  minimal: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  restaurant: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}

/**
 * ProductGrid - Renders product cards in responsive grid
 */
export function ProductGrid({
  template,
  products,
  loading = false,
  onProductClick,
}: ProductGridProps) {
  const theme = useTheme()

  // Determine which card component to render
  const CardComponent = {
    gallery: GalleryCard,
    detail: DetailCard,
    minimal: MinimalCard,
    restaurant: GalleryCard, // TODO: Replace with RestaurantCard in Fase 3
  }[template]

  // Loading state - show skeleton cards
  if (loading) {
    const skeletonCount = template === 'minimal' ? 8 : template === 'detail' ? 4 : 6

    return (
      <div
        data-testid={`product-grid-${template}`}
        className={`grid gap-4 md:gap-6 ${RESPONSIVE_COLS[template]}`}
        style={{
          gap: 'var(--spacing-md)',
        }}
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
        data-testid={`product-grid-${template}`}
        className="flex flex-col items-center justify-center py-16 px-4"
        style={{
          padding: 'var(--spacing-xl)',
        }}
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
          <h3
            className="mt-2 text-lg font-medium text-gray-900"
            style={{ marginTop: 'var(--spacing-sm)' }}
          >
            No products found
          </h3>
          <p
            className="mt-1 text-sm text-gray-500"
            style={{ marginTop: 'var(--spacing-xs)' }}
          >
            Check back later for new products.
          </p>
        </div>
      </div>
    )
  }

  // Product grid
  return (
    <div
      data-testid={`product-grid-${template}`}
      className={`grid ${RESPONSIVE_COLS[template]}`}
      style={{
        gap: 'var(--spacing-md)',
        // Optionally use CSS var for columns (can override responsive classes)
        // gridTemplateColumns: `repeat(var(--grid-cols, ${theme.gridCols}), minmax(0, 1fr))`,
      }}
    >
      {products.map((product) => (
        <CardComponent
          key={product.id}
          product={product}
          onClick={() => onProductClick?.(product)}
        />
      ))}
    </div>
  )
}
