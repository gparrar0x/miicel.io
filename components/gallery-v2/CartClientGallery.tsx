/**
 * CartClientGallery Component
 *
 * Cart page client for gallery template
 */

'use client'

import { ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { CheckoutModal } from '@/components/CheckoutModal'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { useCartStore } from '@/lib/stores/cartStore'
import { CartItemGallery } from './CartItemGallery'

interface CartClientGalleryProps {
  tenantId: string
}

export function CartClientGallery({ tenantId }: CartClientGalleryProps) {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const totalPrice = getTotalPrice()

  if (items.length === 0) {
    return (
      <div className="text-center py-16" data-testid="cart-empty-state">
        <ShoppingBag className="mx-auto h-20 w-20 text-gray-300 mb-6" />

        <h2 className="text-2xl font-serif font-bold mb-3 text-black">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-8" style={{ fontSize: 'var(--font-size-body)' }}>
          Explora nuestra colección y encuentra tu próxima obra favorita
        </p>

        <Link href={`/${tenantId}`}>
          <Button
            className="rounded-full text-white font-medium px-8"
            style={{
              backgroundColor: 'var(--color-accent-primary)',
              height: '56px',
              fontSize: 'var(--font-size-h4)',
            }}
            data-testid="cart-continue-shopping-link"
          >
            Explorar Galería
          </Button>
        </Link>
      </div>
    )
  }

  const currency = items[0]?.currency || 'USD'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Cart Items - Left side (2/3 on desktop) */}
      <div className="lg:col-span-2 space-y-6" data-testid="cart-items-list">
        {items.map((item) => (
          <CartItemGallery key={`${item.productId}-${item.color?.id || 'default'}`} item={item} />
        ))}

        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-gray-500 hover:text-red-500 underline transition-colors"
          data-testid="cart-clear-all"
        >
          Vaciar carrito
        </button>
      </div>

      {/* Summary Sidebar - Right side (1/3 on desktop) */}
      <div className="lg:col-span-1" data-testid="cart-summary">
        <div className="sticky top-24 p-6 rounded-xl bg-gray-50 border border-gray-200">
          <h2 className="text-2xl font-serif font-bold mb-6 text-black">Resumen</h2>

          <div className="space-y-4 py-6 border-t border-b border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Subtotal ({items.length} {items.length === 1 ? 'obra' : 'obras'})
              </span>
              <span className="font-semibold text-black" data-testid="cart-subtotal">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(totalPrice)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Envío</span>
              <span className="text-gray-500 text-sm">A calcular</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline py-6">
            <span className="text-xl font-serif font-bold text-black">Total</span>
            <span className="text-3xl font-serif font-bold text-black" data-testid="cart-total">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(totalPrice)}
            </span>
          </div>

          <Button
            onClick={() => setCheckoutOpen(true)}
            className="w-full rounded-full text-white font-medium mb-4"
            style={{
              backgroundColor: 'var(--color-accent-primary)',
              height: '56px',
              fontSize: 'var(--font-size-h4)',
            }}
            data-testid="cart-checkout-button"
          >
            Proceder al Pago
          </Button>

          <Link
            href={`/${tenantId}`}
            className="block text-center text-sm text-gray-600 hover:text-black underline transition-colors"
            data-testid="cart-continue-shopping-link"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  )
}
