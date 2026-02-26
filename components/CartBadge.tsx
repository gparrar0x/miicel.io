'use client'

import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { CartDrawer } from './CartDrawer'

export function CartBadge() {
  const [open, setOpen] = useState(false)
  const items = useCartStore((state) => state.items)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-30"
        aria-label={`Carrito de compras, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
