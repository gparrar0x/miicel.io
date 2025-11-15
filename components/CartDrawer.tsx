'use client'

import { useCartStore } from '@/lib/store/cart'
import { X, Trash2 } from 'lucide-react'
import { CheckoutModal } from './CheckoutModal'
import { useState } from 'react'

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const items = useCartStore(state => state.items)
  const removeItem = useCartStore(state => state.removeItem)
  const updateQuantity = useCartStore(state => state.updateQuantity)
  const getTotal = useCartStore(state => state.getTotal)

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Cerrar carrito"
      />
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Carrito</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">Tu carrito está vacío</p>
          ) : (
            items.map(item => (
              <div key={item.product_id} className="flex gap-4 mb-4 border-b pb-4">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">${item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="px-2 py-1 border rounded"
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </button>
                    <span className="mx-2" aria-label={`Cantidad: ${item.quantity}`}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="px-2 py-1 border rounded"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.product_id)}>
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-between mb-4">
            <span className="font-bold">Total:</span>
            <span className="font-bold">${getTotal()}</span>
          </div>
          <button
            onClick={() => setCheckoutOpen(true)}
            disabled={items.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Finalizar Compra
          </button>
        </div>
      </div>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  )
}
