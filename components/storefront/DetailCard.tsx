/**
 * DetailCard - Product card with image and detailed specifications grid
 *
 * Usage:
 * ```tsx
 * <DetailCard product={product} loading={false} />
 * ```
 *
 * Features:
 * - Image + expanded description
 * - Specifications grid (category, colors, stock)
 * - Hover elevation effect
 * - Consumes theme CSS vars (--image-aspect, --spacing-*, --color-*)
 *
 * Test ID: product-card-detail
 * Created: 2025-11-16 (Issue #4)
 */

'use client'

import Image from 'next/image'
import type { Product } from '@/types/commerce'

interface DetailCardProps {
  product: Product
  loading?: boolean
  onClick?: () => void
}

/**
 * DetailCard - Image + specs grid with expanded description
 */
export function DetailCard({ product, loading = false, onClick }: DetailCardProps) {
  // Loading skeleton state
  if (loading) {
    return (
      <div
        data-testid="product-card-detail"
        className="rounded-lg border border-gray-200 bg-white overflow-hidden animate-pulse"
        style={{
          padding: 'var(--spacing-md)',
        }}
      >
        <div
          className="bg-gray-200 rounded-lg mb-4"
          style={{
            aspectRatio: 'var(--image-aspect)',
          }}
        />
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="h-8 bg-gray-200 rounded" />
            <div className="h-8 bg-gray-200 rounded" />
          </div>
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
      data-testid="product-card-detail"
      onClick={onClick}
      className="group rounded-lg border border-gray-200 bg-white overflow-hidden cursor-pointer
                 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      style={{
        padding: 'var(--spacing-md)',
      }}
    >
      {/* Product Image */}
      <div
        className="relative rounded-lg overflow-hidden mb-4"
        style={{
          aspectRatio: 'var(--image-aspect)',
        }}
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div className="space-y-2">
        {/* Title & Price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2 flex-1">{product.name}</h3>
          <p
            className="font-bold text-lg whitespace-nowrap"
            style={{ color: 'var(--color-primary, #3B82F6)' }}
          >
            {formattedPrice}
          </p>
        </div>

        {/* Description */}
        {product.description && (
          <p
            className="text-sm text-gray-600 line-clamp-3"
            style={{
              marginTop: 'var(--spacing-xs)',
            }}
          >
            {product.description}
          </p>
        )}

        {/* Specs Grid */}
        <div
          className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100"
          style={{
            marginTop: 'var(--spacing-sm)',
          }}
        >
          {/* Category */}
          {product.category && (
            <div className="text-sm">
              <span className="text-gray-500 font-medium">Category:</span>
              <p className="text-gray-900 truncate">{product.category}</p>
            </div>
          )}

          {/* Stock Status */}
          <div className="text-sm">
            <span className="text-gray-500 font-medium">Stock:</span>
            <p
              className={`font-semibold ${
                product.stock === 0
                  ? 'text-red-600'
                  : product.stock < 5
                    ? 'text-amber-600'
                    : 'text-green-600'
              }`}
            >
              {product.stock === 0
                ? 'Out of Stock'
                : product.stock < 5
                  ? `${product.stock} left`
                  : 'In Stock'}
            </p>
          </div>

          {/* Colors Available */}
          {product.colors.length > 0 && (
            <div className="text-sm col-span-2">
              <span className="text-gray-500 font-medium">Colors:</span>
              <div className="flex gap-1 mt-1">
                {product.colors.slice(0, 5).map((color) => (
                  <div
                    key={color.id}
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
                {product.colors.length > 5 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                    +{product.colors.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
