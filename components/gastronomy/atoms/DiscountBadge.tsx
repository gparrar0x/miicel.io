'use client'

import { Tag } from 'lucide-react'
import type { DiscountSnapshot } from '@/types/commerce'

interface DiscountBadgeProps {
  discount: DiscountSnapshot
  discountAmount: number
  currency?: string
}

export function DiscountBadge({ discount, discountAmount, currency = 'CLP' }: DiscountBadgeProps) {
  const label =
    discount.type === 'percentage'
      ? `Desc. ${discount.value}%`
      : `Desc. $${discount.value.toLocaleString('es-CL')}`

  const saving = new Intl.NumberFormat('es-CL', { style: 'currency', currency }).format(
    discountAmount,
  )

  return (
    <span
      data-testid="discount-badge"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: 'var(--color-accent)' }}
      aria-label={`${label} — ahorro ${saving}`}
    >
      <Tag className="w-3 h-3" aria-hidden="true" />
      {label} — -{saving}
    </span>
  )
}
