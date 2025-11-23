/**
 * ProductClient Component
 *
 * Client-side wrapper for interactive product controls.
 * Manages color selection, quantity state, and cart actions.
 */

'use client'

import { useState } from 'react'
import { ColorSelector } from '@/components/commerce/ColorSelector'
import { QuantityControl } from '@/components/commerce/QuantityControl'
import { AddToCartButton } from '@/components/commerce/AddToCartButton'
import type { Product } from '@/types/commerce'

interface ProductClientProps {
  product: Product
  maxQuantity: number
}

export function ProductClient({ product, maxQuantity }: ProductClientProps) {
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>(
    product.colors[0]?.id
  )
  const [quantity, setQuantity] = useState(1)

  const selectedColor = product.colors.find((c) => c.id === selectedColorId)
  const isOutOfStock = product.stock <= 0

  return (
    <div className="space-y-6">
      {/* Color Selector */}
      {product.colors.length > 0 && (
        <ColorSelector
          colors={product.colors}
          selected={selectedColorId}
          onChange={setSelectedColorId}
          disabled={isOutOfStock}
          productId={product.id}
        />
      )}

      {/* Quantity Control */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Quantity</label>
        <QuantityControl
          value={quantity}
          onChange={setQuantity}
          max={maxQuantity}
          productId={product.id}
          colorId={selectedColorId}
        />
      </div>

      {/* Add to Cart Button */}
      <AddToCartButton
        productId={product.id}
        productName={product.name}
        price={product.price}
        currency={product.currency}
        image={product.images[0] || '/placeholder.svg'}
        maxQuantity={maxQuantity}
        quantity={quantity}
        color={selectedColor}
        disabled={isOutOfStock}
      />

      {isOutOfStock && (
        <p className="text-sm text-red-600" data-testid={`product-${product.id}-out-of-stock-message`}>
          This product is currently out of stock.
        </p>
      )}
    </div>
  )
}
