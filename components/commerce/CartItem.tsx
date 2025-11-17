/**
 * CartItem Component
 *
 * Displays single cart item with thumbnail, details, quantity controls, delete.
 */

'use client'

import Image from 'next/image'
import { QuantityControl } from './QuantityControl'
import { useCartStore } from '@/lib/stores/cartStore'
import type { CartItem as CartItemType } from '@/types/commerce'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.productId, item.color?.id, newQuantity)
  }

  const handleRemove = () => {
    removeItem(item.productId, item.color?.id)
  }

  const itemTotal = item.price * item.quantity

  return (
    <div
      className="flex gap-4 p-4 rounded-lg border border-gray-200"
      data-testid={`cart-item-${item.productId}${item.color ? `-${item.color.id}` : ''}`}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          data-testid={`cart-item-${item.productId}-image`}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h3
              className="font-semibold text-base truncate"
              style={{ color: 'var(--color-text-primary)' }}
              data-testid={`cart-item-${item.productId}-name`}
            >
              {item.name}
            </h3>

            {item.color && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: item.color.hex }}
                  data-testid={`cart-item-${item.productId}-color-swatch`}
                />
                <span
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                  data-testid={`cart-item-${item.productId}-color-name`}
                >
                  {item.color.name}
                </span>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove item"
            data-testid={`cart-item-${item.productId}-delete`}
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Quantity + Price */}
        <div className="mt-3 flex items-center justify-between gap-4">
          <QuantityControl
            value={item.quantity}
            onChange={handleQuantityChange}
            max={item.maxQuantity}
            productId={item.productId}
            colorId={item.color?.id}
          />

          <div className="text-right">
            <p
              className="text-lg font-bold"
              style={{ color: 'var(--color-primary)' }}
              data-testid={`cart-item-${item.productId}-total`}
            >
              {item.currency} {itemTotal.toFixed(2)}
            </p>
            {item.quantity > 1 && (
              <p
                className="text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {item.currency} {item.price.toFixed(2)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
