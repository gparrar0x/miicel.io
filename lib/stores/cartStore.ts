/**
 * Zustand Cart Store with LocalStorage Persistence
 *
 * Manages shopping cart state across tenant storefronts.
 * Persists to localStorage with tenant-scoped keys derived from the URL,
 * so each tenant has its own independent cart.
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CartStore } from '@/types/commerce'

const STORAGE_PREFIX = 'sw-cart'
const LEGACY_STORAGE_KEY = 'sw-cart-storage'

// One-time cleanup of the legacy global cart key (pre tenant-scoping).
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    // ignore (SSR safety / private mode)
  }
}

function getTenantSlug(): string {
  if (typeof window === 'undefined') return 'ssr'
  // URL pattern: /{locale}/{tenantSlug}/...
  const segments = window.location.pathname.split('/').filter(Boolean)
  return segments[1] ?? 'default'
}

const tenantScopedStorage = createJSONStorage(() => {
  const makeKey = (name: string) => `${name}:${getTenantSlug()}`
  return {
    getItem: (name) => localStorage.getItem(makeKey(name)),
    setItem: (name, value) => localStorage.setItem(makeKey(name), value),
    removeItem: (name) => localStorage.removeItem(makeKey(name)),
  }
})

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const items = get().items
        // Key: productId + sorted modifier option IDs (separate rows for different modifiers)
        const modifierKey = newItem.modifiers?.length
          ? newItem.modifiers
              .map((m) => m.modifier_option_id)
              .sort()
              .join('|')
          : ''
        const existingIndex = items.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.color?.id === newItem.color?.id &&
            (item.modifiers?.length
              ? item.modifiers
                  .map((m) => m.modifier_option_id)
                  .sort()
                  .join('|')
              : '') === modifierKey,
        )

        if (existingIndex > -1) {
          // Update quantity if same product+color+modifiers combo exists
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
        return get().items.reduce(
          (sum, item) => sum + (item.price + (item.modifiersTotalDelta ?? 0)) * item.quantity,
          0,
        )
      },
    }),
    {
      name: STORAGE_PREFIX, // Final localStorage key = `${STORAGE_PREFIX}:${tenantSlug}`
      storage: tenantScopedStorage,
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
