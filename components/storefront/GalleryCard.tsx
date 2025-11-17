/**
 * GalleryCard - Large image product card with hover zoom effect
 *
 * Usage:
 * ```tsx
 * <GalleryCard product={product} loading={false} />
 * ```
 *
 * Features:
 * - Large image display with lazy loading
 * - Hover zoom animation
 * - Minimal text overlay
 * - Consumes theme CSS vars (--image-aspect, --spacing-*, --color-*)
 *
 * Test ID: product-card-gallery
 * Created: 2025-11-16 (Issue #4)
 */

'use client'

import Image from 'next/image'
import { Product } from '@/types/commerce'

interface GalleryCardProps {
  product: Product
  loading?: boolean
  onClick?: () => void
}

/**
 * GalleryCard - Large image with minimal text, hover zoom
 */
export function GalleryCard({ product, loading = false, onClick }: GalleryCardProps) {
  // Loading skeleton state
  if (loading) {
    return (
      <div
        data-testid="product-card-gallery"
        className="group relative overflow-hidden rounded-lg bg-gray-100 animate-pulse"
        style={{
          aspectRatio: 'var(--image-aspect)',
        }}
      >
        <div className="absolute inset-0 bg-gray-200" />
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <div className="h-5 bg-gray-300 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
        </div>
      </div>
    )
  }

  const primaryImage = product.images[0] || '/placeholder-product.jpg'
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency,
  }).format(product.price)

  return (
    <div
      data-testid="product-card-gallery"
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg cursor-pointer"
      style={{
        aspectRatio: 'var(--image-aspect)',
      }}
    >
      {/* Image with hover zoom */}
      <div className="relative w-full h-full">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
      </div>

      {/* Text overlay - fades in on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent
                   transition-opacity duration-300"
        style={{
          padding: 'var(--spacing-md)',
        }}
      >
        <h3
          className="text-white font-semibold text-lg line-clamp-1"
          style={{
            marginBottom: 'var(--spacing-xs)',
          }}
        >
          {product.name}
        </h3>
        <p
          className="text-white/90 font-medium"
          style={{ color: 'var(--color-accent, #F59E0B)' }}
        >
          {formattedPrice}
        </p>
      </div>

      {/* Stock indicator */}
      {product.stock === 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          Out of Stock
        </div>
      )}
      {product.stock > 0 && product.stock < 5 && (
        <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
          Low Stock
        </div>
      )}
    </div>
  )
}
