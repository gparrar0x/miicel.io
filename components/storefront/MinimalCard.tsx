/**
 * MinimalCard - Compact product card with small image and product name only
 *
 * Usage:
 * ```tsx
 * <MinimalCard product={product} loading={false} />
 * ```
 *
 * Features:
 * - Small image display
 * - Product name and price only
 * - Compact spacing for high-density grids
 * - Subtle hover effect
 * - Consumes theme CSS vars (--image-aspect, --spacing-*, --color-*)
 *
 * Test ID: product-card-minimal
 * Created: 2025-11-16 (Issue #4)
 */

'use client'

import Image from 'next/image'
import { Product } from '@/types/commerce'

interface MinimalCardProps {
  product: Product
  loading?: boolean
  onClick?: () => void
}

/**
 * MinimalCard - Small image + product name only, compact layout
 */
export function MinimalCard({ product, loading = false, onClick }: MinimalCardProps) {
  // Loading skeleton state
  if (loading) {
    return (
      <div
        data-testid="product-card-minimal"
        className="group cursor-pointer animate-pulse"
      >
        <div
          className="bg-gray-200 rounded-lg mb-2"
          style={{
            aspectRatio: 'var(--image-aspect)',
          }}
        />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
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
      data-testid="product-card-minimal"
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* Product Image */}
      <div
        className="relative rounded-lg overflow-hidden bg-gray-100
                   transition-opacity duration-200 group-hover:opacity-90"
        style={{
          aspectRatio: 'var(--image-aspect)',
          marginBottom: 'var(--spacing-xs)',
        }}
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          loading="lazy"
        />

        {/* Stock badge - minimal version */}
        {product.stock === 0 && (
          <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
            Out
          </div>
        )}
      </div>

      {/* Product Info - compact */}
      <div style={{ padding: 'var(--spacing-xs)' }}>
        {/* Product Name */}
        <h3
          className="text-sm font-medium text-gray-900 line-clamp-2 mb-1
                     group-hover:text-gray-700 transition-colors"
        >
          {product.name}
        </h3>

        {/* Price */}
        <p
          className="text-sm font-semibold"
          style={{ color: 'var(--color-primary, #3B82F6)' }}
        >
          {formattedPrice}
        </p>

        {/* Color dots - if available */}
        {product.colors.length > 0 && (
          <div className="flex gap-1 mt-1.5">
            {product.colors.slice(0, 3).map((color) => (
              <div
                key={color.id}
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 3 && (
              <div className="w-3 h-3 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-[8px] text-gray-600">+{product.colors.length - 3}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
