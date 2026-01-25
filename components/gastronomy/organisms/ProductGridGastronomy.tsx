/**
 * ProductGridGastronomy - Responsive grid wrapper for gastronomy cards
 *
 * Grid: 1 col (mobile), 2 col (tablet), 3 col (desktop)
 * Max width: 1280px centered
 *
 * Test ID: product-grid-gastronomy
 * Created: 2025-01-16 (SKY-42, Fase 4)
 */

'use client'

import { Product } from '@/types/commerce'
import { BadgeType } from '@/lib/themes/gastronomy'
import { ProductCardGastronomy } from '../molecules/ProductCardGastronomy'

interface ProductGridGastronomyProps {
  products: Product[]
  onAddToCart: (productId: string) => void | Promise<void>
  onProductClick?: (product: Product) => void
  currency?: string
  className?: string
}

/**
 * Helper to determine badges for a product
 * TODO: Move to product metadata or database field
 */
function getProductBadges(product: Product): BadgeType[] {
  const badges: BadgeType[] = []

  // Example logic (replace with real metadata)
  if (product.name.toLowerCase().includes('nuevo')) badges.push('nuevo')
  if (product.name.toLowerCase().includes('promo')) badges.push('promo')
  if (product.name.toLowerCase().includes('picante')) badges.push('spicy-hot')
  if (product.name.toLowerCase().includes('veggie') || product.name.toLowerCase().includes('vegetariano')) {
    badges.push('veggie')
  }
  if (product.name.toLowerCase().includes('vegano')) badges.push('vegan')

  return badges
}

export function ProductGridGastronomy({
  products,
  onAddToCart,
  onProductClick,
  currency = 'CLP',
  className = '',
}: ProductGridGastronomyProps) {
  if (products.length === 0) {
    return (
      <div
        data-testid="product-grid-gastronomy-empty"
        className="text-center py-12 text-gray-500 dark:text-gray-400"
      >
        No hay productos en esta categoría
      </div>
    )
  }

  return (
    <div
      data-testid="product-grid-gastronomy"
      className={`py-1 ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {products.map((product) => (
          <ProductCardGastronomy
            key={product.id}
            product={product}
            badges={getProductBadges(product)}
            onAddToCart={onAddToCart}
            onClick={onProductClick ? () => onProductClick(product) : undefined}
            currency={currency}
          />
        ))}
      </div>
    </div>
  )
}
