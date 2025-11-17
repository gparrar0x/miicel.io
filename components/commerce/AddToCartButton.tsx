/**
 * AddToCartButton Component
 *
 * Client component that triggers cart store actions.
 * Handles loading states and feedback.
 */

'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'
import type { ProductColor } from '@/types/commerce'

interface AddToCartButtonProps {
  productId: string
  productName: string
  price: number
  currency: string
  image: string
  maxQuantity: number
  quantity: number
  color?: ProductColor
  disabled?: boolean
}

export function AddToCartButton({
  productId,
  productName,
  price,
  currency,
  image,
  maxQuantity,
  quantity,
  color,
  disabled = false,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)

    addItem({
      productId,
      name: productName,
      price,
      currency,
      image,
      color,
      maxQuantity,
      quantity,
    })

    // Brief loading state for UX feedback
    setTimeout(() => {
      setIsAdding(false)
    }, 300)
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      data-testid={`product-${productId}-add-to-cart`}
      className={`
        w-full py-3 px-6 rounded-lg font-semibold text-white
        transition-all duration-200
        ${
          disabled || isAdding
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-tenant-primary hover:opacity-90 active:scale-95'
        }
      `}
    >
      {isAdding ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}
