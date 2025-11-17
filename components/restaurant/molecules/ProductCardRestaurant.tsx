/**
 * ProductCardRestaurant - Menu item card for restaurant template
 *
 * Layout:
 * - Image 16:9 aspect (hover zoom)
 * - Badge stack top-left absolute
 * - Title 18px bold
 * - Description 14px gray (2 lines clamp)
 * - Price 20px bold primary
 * - Quick add button full width
 *
 * Test ID: product-card-{productId}
 * Created: 2025-01-16 (SKY-42, Fase 3)
 */

'use client'

import Image from 'next/image'
import { Product } from '@/types/commerce'
import { BadgeType } from '@/lib/themes/restaurant'
import { FoodBadge } from '../atoms/FoodBadge'
import { QuickAddButton } from '../atoms/QuickAddButton'

interface ProductCardRestaurantProps {
  product: Product
  badges?: BadgeType[]
  onAddToCart: (productId: string) => void | Promise<void>
  onClick?: () => void
  currency?: string
}

export function ProductCardRestaurant({
  product,
  badges = [],
  onAddToCart,
  onClick,
  currency = 'CLP',
}: ProductCardRestaurantProps) {
  const imageUrl = product.images[0] || '/placeholder-food.jpg'
  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
  }).format(product.price)

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="
        bg-white rounded-lg overflow-hidden border border-gray-200
        hover:shadow-lg transition-shadow duration-200
        flex flex-col
      "
    >
      {/* Image 16:9 */}
      <div
        className="relative w-full overflow-hidden cursor-pointer bg-gray-100"
        style={{ aspectRatio: '16/9' }}
        onClick={onClick}
        data-testid={`product-image-${product.id}`}
      >
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Badges stack */}
        {badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {badges.map((type) => (
              <FoodBadge key={type} type={type} />
            ))}
          </div>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Agotado</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3
          className="text-lg font-bold text-gray-900 mb-1 cursor-pointer hover:text-gray-700"
          onClick={onClick}
          data-testid={`product-title-${product.id}`}
        >
          {product.name}
        </h3>

        {product.description && (
          <p
            className="text-sm text-gray-600 mb-3 line-clamp-2"
            data-testid={`product-description-${product.id}`}
          >
            {product.description}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xl font-bold"
              style={{ color: 'var(--color-primary, #E63946)' }}
              data-testid={`product-price-${product.id}`}
            >
              {formattedPrice}
            </span>
            {product.stock > 0 && product.stock < 5 && (
              <span className="text-xs text-orange-600 font-medium">
                Quedan {product.stock}
              </span>
            )}
          </div>

          <QuickAddButton
            productId={product.id}
            onClick={() => onAddToCart(product.id)}
            disabled={product.stock === 0}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
