/**
 * SKY-43: ProductGrid Component (Neo-Brutalist Layout)
 *
 * Layout: Asymmetric Grid
 * - Desktop: 4 columns, items span 1 or 2 cols randomly
 * - Mobile: 1 column
 */

'use client'

import type { Product } from '@/types/commerce'
import type { TenantTemplate } from '@/types/theme'
import { DetailCard } from './DetailCard'
import { GalleryCard } from './GalleryCard'
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
    gastronomy: GalleryCard,
  }[template]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[var(--container-width)] mx-auto px-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 border-y border-black">
        <h3 className="font-display text-3xl font-bold uppercase tracking-widest">
          No Artifacts Found
        </h3>
        <p className="font-mono text-sm mt-2 text-gray-500">The collection is currently empty.</p>
      </div>
    )
  }

  return (
    <div
      data-testid={testId}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-[var(--container-width)] mx-auto px-4 pb-20"
    >
      {products.map((product, index) => {
        // Editorial Layout Logic:
        // Every 5th item spans 2 columns (if not on mobile)
        const isFeatured = index % 5 === 0 && index !== 0

        return (
          <div
            key={product.id}
            className={`${isFeatured ? 'lg:col-span-2 lg:row-span-2' : 'col-span-1'}`}
          >
            <CardComponent
              product={product}
              onClick={() => onProductClick?.(product)}
              onQuickView={template === 'gallery' ? onQuickView : undefined}
              onWishlist={onWishlist}
              loading={false}
              index={index} // Pass index for staggered animation
            />
          </div>
        )
      })}
    </div>
  )
}
