'use client'

/**
 * Reactive Cart Badge
 *
 * Displays total cart items count from Zustand store.
 * Syncs across all storefront pages via localStorage.
 */

import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'

export function CartBadge() {
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const [itemCount, setItemCount] = useState(0)

  // Hydration-safe: only read from store after mount
  useEffect(() => {
    setItemCount(getTotalItems())
  }, [getTotalItems])

  // Subscribe to changes
  useEffect(() => {
    const unsubscribe = useCartStore.subscribe((state) => {
      setItemCount(state.getTotalItems())
    })
    return unsubscribe
  }, [])

  if (itemCount === 0) return null

  return (
    <span
      className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
      style={{ backgroundColor: 'var(--color-accent)' }}
      data-testid="cart-badge"
    >
      {itemCount > 99 ? '99+' : itemCount}
    </span>
  )
}
