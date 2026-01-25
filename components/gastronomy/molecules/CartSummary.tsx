/**
 * CartSummary - Inline cart count + total display
 *
 * Shows: "🛒 3 items | Total $12,500"
 * Used in FloatingCartButton and cart drawer header.
 *
 * Test ID: cart-summary
 * Created: 2025-01-16 (SKY-42, Fase 3)
 */

'use client'

interface CartSummaryProps {
  itemCount: number
  total: number
  currency?: string
  className?: string
}

export function CartSummary({ itemCount, total, currency = 'CLP', className = '' }: CartSummaryProps) {
  const formattedTotal = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
  }).format(total)

  return (
    <div
      data-testid="cart-summary"
      className={`flex items-center gap-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
        <span className="font-semibold" data-testid="cart-item-count">
          {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
        </span>
      </div>
      <span className="text-gray-400 dark:text-gray-600">|</span>
      <div className="flex flex-col">
        <span className="text-xs opacity-80">Total</span>
        <span className="font-bold text-lg" data-testid="cart-total">
          {formattedTotal}
        </span>
      </div>
    </div>
  )
}
