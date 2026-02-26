'use client'

import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FloatingCartButtonProps {
  itemCount: number
  totalAmount: number
  currency?: string
  onViewCart: () => void
  className?: string
}

export function FloatingCartButton({
  itemCount,
  totalAmount,
  currency = 'CLP',
  onViewCart,
  className = '',
}: FloatingCartButtonProps) {
  if (itemCount === 0) return null

  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
  }).format(totalAmount)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500 pointer-events-none">
      <div className="container mx-auto px-4 pb-4 pointer-events-auto">
        <Button
          onClick={onViewCart}
          className="w-full text-white font-bold py-6 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          size="lg"
          style={{
            background: `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`,
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px color-mix(in srgb, var(--color-primary) 20%, transparent)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(to right, color-mix(in srgb, var(--color-primary) 85%, black), color-mix(in srgb, var(--color-primary) 70%, black))`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`
          }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span
                  className="absolute -top-2 -right-2 bg-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {itemCount}
                </span>
              </div>
              <span className="text-lg">Ver Pedido</span>
            </div>
            <span className="text-xl font-bold">{formattedPrice}</span>
          </div>
        </Button>
      </div>
    </div>
  )
}
