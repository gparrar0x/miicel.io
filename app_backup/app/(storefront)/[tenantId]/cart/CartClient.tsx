/**
 * CartClient Component
 *
 * Client-side cart display with items list, empty state, and summary.
 */

'use client'

import { useState } from 'react'
import { Link } from '@/i18n/routing'
import { useCartStore } from '@/lib/stores/cartStore'
import { CartItem } from '@/components/commerce/CartItem'
import { CheckoutModal } from '@/components/CheckoutModal'

export function CartClient() {
  const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  if (items.length === 0) {
    return (
      <div
        className="text-center py-16 px-4 rounded-lg"
        style={{ backgroundColor: 'var(--color-bg-elevated)' }}
        data-testid="cart-empty-state"
      >
        <svg
          className="mx-auto h-16 w-16 text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>

        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Your cart is empty
        </h2>
        <p
          className="mb-6"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Add some products to get started
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}
          data-testid="cart-continue-shopping-link"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  // Get currency from first item (all items should have same currency)
  const currency = items[0]?.currency || 'USD'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items - Left side (2/3 on desktop) */}
      <div className="lg:col-span-2 space-y-4" data-testid="cart-items-list">
        {items.map((item) => (
          <CartItem
            key={`${item.productId}-${item.color?.id || 'default'}`}
            item={item}
          />
        ))}

        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-700 underline"
          data-testid="cart-clear-all"
        >
          Clear cart
        </button>
      </div>

      {/* Summary Sidebar - Right side (1/3 on desktop) */}
      <div
        className="lg:col-span-1"
        data-testid="cart-summary"
      >
        <div
          className="sticky top-8 p-6 rounded-lg space-y-4"
          style={{ backgroundColor: 'var(--color-bg-elevated)' }}
        >
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Order Summary
          </h2>

          <div className="space-y-2 py-4 border-t border-b border-gray-200">
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </span>
              <span
                className="font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
                data-testid="cart-subtotal"
              >
                {currency} {totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Shipping
              </span>
              <span style={{ color: 'var(--color-text-tertiary)' }}>
                Calculated at checkout
              </span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span style={{ color: 'var(--color-text-primary)' }}>Total</span>
            <span
              style={{ color: 'var(--color-primary)' }}
              data-testid="cart-total"
            >
              {currency} {totalPrice.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCheckoutOpen(true)}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
            data-testid="cart-checkout-button"
          >
            Proceed to Checkout
          </button>

          <Link
            href="/"
            className="block text-center text-sm underline"
            style={{ color: 'var(--color-text-secondary)' }}
            data-testid="cart-continue-shopping-link"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  )
}
