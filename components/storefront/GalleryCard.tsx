/**
 * SKY-43: GalleryCard Component (Art Gallery Variant)
 * Mobile-first product card for QR gallery experience
 *
 * Usage:
 * ```tsx
 * <GalleryCard
 *   product={product}
 *   onQuickView={(id) => setQuickViewId(id)}
 *   onWishlist={(id) => toggleWishlist(id)}
 * />
 * ```
 *
 * Features:
 * - Mobile portrait: 1 col, full width, 1:1 image
 * - 48x48px tap targets (WCAG AA)
 * - Type badges (Digital/Physical/Both)
 * - Status badges (New/Limited/Featured)
 * - Quick View button prominent
 * - Desktop hover: lift 4px, image zoom 1.03x
 * - Performance: lazy load, WebP, LQIP
 *
 * Test IDs: product-card-gallery, card-image, card-title, card-price,
 *           action-wishlist, action-quickview, badge-type-*, badge-status-*
 *
 * Created: 2025-01-17 (SKY-43 Phase 1)
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/types/commerce'
import { Badge } from '@/components/ui/Badge'

interface GalleryCardProps {
  product: Product
  onQuickView?: (productId: string) => void
  onWishlist?: (productId: string) => void
  loading?: boolean
  'data-testid'?: string
}

export function GalleryCard({
  product,
  onQuickView,
  onWishlist,
  loading = false,
  'data-testid': testId = 'product-card-gallery',
}: GalleryCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Loading skeleton
  if (loading) {
    return (
      <article
        data-testid={testId}
        className="flex flex-col overflow-hidden bg-[var(--color-bg-primary)] animate-pulse"
      >
        <div className="relative w-full aspect-square bg-gray-200" />
        <div className="p-[var(--card-padding)] space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="flex gap-2 mt-2">
            <div className="h-12 bg-gray-200 rounded w-12" />
            <div className="flex-1 h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </article>
    )
  }

  const primaryImage = product.images[0] || '/placeholder-product.jpg'
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency,
  }).format(product.price)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    onWishlist?.(product.id)
  }

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onQuickView?.(product.id)
  }

  return (
    <article
      data-testid={testId}
      className="group flex flex-col overflow-hidden bg-[var(--color-bg-primary)] transition-all duration-300 ease-out
                 hover:translate-y-[-4px] hover:shadow-[0_8px_24px_var(--color-shadow-soft)]"
    >
      {/* Image Container with Badges */}
      <div className="relative w-full aspect-square overflow-hidden" data-testid="card-image">
        <Image
          src={primaryImage}
          alt={`${product.name}${product.artist ? ` by ${product.artist}` : ''}`}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
          loading="lazy"
          quality={85}
        />

        {/* Type Badge (top-left) */}
        {product.type === 'digital' && (
          <Badge variant="digital" position="top-left">
            Digital
          </Badge>
        )}
        {product.type === 'physical' && (
          <Badge variant="physical" position="top-left">
            Physical
          </Badge>
        )}
        {product.type === 'both' && (
          <Badge variant="both" position="top-left">
            Both
          </Badge>
        )}

        {/* Status Badge (top-right) - priority: Limited > New > Featured */}
        {product.isLimited && (
          <Badge variant="limited" position="top-right">
            Limited
          </Badge>
        )}
        {!product.isLimited && product.isNew && (
          <Badge variant="new" position="top-right">
            New
          </Badge>
        )}
        {!product.isLimited && !product.isNew && product.isFeatured && (
          <Badge variant="featured" position="top-right">
            Featured
          </Badge>
        )}
      </div>

      {/* Info Section */}
      <div className="p-[var(--card-padding)] flex flex-col gap-2">
        {/* Title */}
        <h3
          data-testid="card-title"
          className="text-[var(--font-size-h4)] font-[var(--font-weight-medium)]
                     leading-[var(--line-height-normal)] text-[var(--color-text-primary)]
                     line-clamp-2 overflow-hidden"
        >
          {product.name}
        </h3>

        {/* Meta: Price + Options Count */}
        <div
          data-testid="card-meta"
          className="flex items-center gap-2 text-[var(--font-size-small)]
                     text-[var(--color-text-secondary)]"
        >
          <span
            data-testid="card-price"
            className="text-[var(--font-size-h4)] font-[var(--font-weight-bold)]
                       text-[var(--color-accent-primary)]"
          >
            {formattedPrice}
          </span>
          {product.optionsCount && product.optionsCount > 1 && (
            <>
              <span>•</span>
              <span>{product.optionsCount} formats</span>
            </>
          )}
        </div>

        {/* Actions: Wishlist + Quick View */}
        <div className="flex items-center gap-2 mt-2">
          {/* Wishlist Button (48x48px tap target) */}
          <button
            data-testid="action-wishlist"
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
            aria-pressed={isWishlisted}
            className="min-w-[var(--tap-target-min)] min-h-[var(--tap-target-min)]
                       flex items-center justify-center bg-transparent border-none
                       cursor-pointer transition-transform duration-[var(--timing-fast)]
                       active:scale-[0.98]"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={isWishlisted ? 'var(--color-accent-primary)' : 'none'}
              stroke="var(--color-text-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Quick View Button (48px height, flexible width) */}
          <button
            data-testid="action-quickview"
            onClick={handleQuickViewClick}
            className="flex-1 min-h-[var(--tap-target-min)] px-4
                       bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)]
                       text-[var(--font-size-small)] font-[var(--font-weight-medium)]
                       rounded transition-all duration-[var(--timing-normal)]
                       active:scale-[0.98] hover:bg-[var(--color-accent-hover)]
                       border-none cursor-pointer"
          >
            Quick View
          </button>
        </div>
      </div>
    </article>
  )
}
