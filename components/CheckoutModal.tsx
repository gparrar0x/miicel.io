'use client'

import { X } from 'lucide-react'

export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white rounded-lg p-6 w-full max-w-md pointer-events-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Checkout</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600">Checkout form coming in Sprint 1 Week 2...</p>
        </div>
      </div>
    </>
  )
}
