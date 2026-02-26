/**
 * Zustand Cart Store with LocalStorage Persistence
 *
 * Manages shopping cart state across tenant storefronts.
 * Persists to localStorage with tenant-scoped keys.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartStore } from '@/types/commerce'

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const items = get().items
        const existingIndex = items.findIndex(
          (item) => item.productId === newItem.productId && item.color?.id === newItem.color?.id,
        )

        if (existingIndex > -1) {
          // Update quantity if same product+color combo exists
          const updated = [...items]
          const current = updated[existingIndex]
          const requestedQty = (newItem.quantity ?? 1) + current.quantity
          updated[existingIndex] = {
            ...current,
            quantity: Math.min(requestedQty, current.maxQuantity),
          }
          set({ items: updated })
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                ...newItem,
                quantity: Math.min(newItem.quantity ?? 1, newItem.maxQuantity),
              },
            ],
          })
        }
      },

      removeItem: (productId, colorId) => {
        set({
          items: get().items.filter(
            (item) => !(item.productId === productId && item.color?.id === colorId),
          ),
        })
      },

      updateQuantity: (productId, colorId, quantity) => {
        const items = get().items
        const index = items.findIndex(
          (item) => item.productId === productId && item.color?.id === colorId,
        )
        if (index === -1) return

        const updated = [...items]
        const item = updated[index]

        if (quantity <= 0) {
          // Remove if quantity is 0 or negative
          set({ items: items.filter((_, i) => i !== index) })
        } else {
          // Update quantity (capped at maxQuantity)
          updated[index] = {
            ...item,
            quantity: Math.min(quantity, item.maxQuantity),
          }
          set({ items: updated })
        }
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'sw-cart-storage', // localStorage key
      // Only persist items array
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
