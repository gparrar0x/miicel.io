/**
 * CartItemGallery Component
 * 
 * Cart item for gallery template - 1 piece per product, no quantity controls
 */

'use client'

import Image from 'next/image'
import { useCartStore } from '@/lib/stores/cartStore'
import type { CartItem as CartItemType } from '@/types/commerce'
import { Trash2 } from 'lucide-react'

interface CartItemGalleryProps {
  item: CartItemType
}

export function CartItemGallery({ item }: CartItemGalleryProps) {
  const { removeItem } = useCartStore()

  const handleRemove = () => {
    removeItem(item.productId, item.color?.id)
  }

  return (
    <div
      className="flex gap-4 pb-6 border-b border-gray-200"
      data-testid={`cart-item-${item.productId}${item.color ? `-${item.color.id}` : ''}`}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
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
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3
              className="font-medium text-black mb-1"
              style={{ fontSize: 'var(--font-size-h4)', lineHeight: 'var(--line-height-normal)' }}
              data-testid={`cart-item-${item.productId}-name`}
            >
              {item.name}
            </h3>

            {item.size && (
              <div className="space-y-0.5 mb-1">
                <p className="text-gray-600 text-sm font-medium">
                  {item.size.label} — {item.size.dimensions}
                </p>
              </div>
            )}

            <p className="text-gray-500 text-xs">
              Edición única
            </p>
          </div>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Eliminar del carrito"
            data-testid={`cart-item-${item.productId}-delete`}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Price */}
        <div className="mt-2">
          <p
            className="font-bold text-black"
            style={{ fontSize: 'var(--font-size-h3)' }}
            data-testid={`cart-item-${item.productId}-total`}
          >
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(item.price)}
          </p>
        </div>
      </div>
    </div>
  )
}

