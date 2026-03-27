'use client'

interface DiscountBadgeProps {
  discountType: string
  discountValue: number
  currency?: string
}

export function DiscountBadge({
  discountType,
  discountValue,
  currency = 'CLP',
}: DiscountBadgeProps) {
  const label =
    discountType === 'percentage'
      ? `-${discountValue}%`
      : `-${new Intl.NumberFormat('es-CL', { style: 'currency', currency }).format(discountValue)}`

  return (
    <span
      data-testid="product-discount-badge"
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: 'var(--color-accent, #D4AF37)', color: '#0C1A27' }}
      aria-label={`Descuento: ${label}`}
    >
      {label}
    </span>
  )
}
