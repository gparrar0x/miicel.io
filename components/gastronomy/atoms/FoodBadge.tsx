/**
 * FoodBadge - Visual indicator for product attributes
 *
 * Displays badges like: Nuevo, Promo, Picante, Vegetariano, etc.
 * Positioned absolute on product card images.
 *
 * Test ID: badge-{type}
 * Created: 2025-01-16 (SKY-42, Fase 2)
 */

'use client'

import { BadgeType, BADGE_CONFIG } from '@/lib/themes/gastronomy'

interface FoodBadgeProps {
  type: BadgeType
  className?: string
}

export function FoodBadge({ type, className = '' }: FoodBadgeProps) {
  const config = BADGE_CONFIG[type]

  return (
    <span
      data-testid={`badge-${type}`}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full
        text-xs font-bold uppercase tracking-wide
        ${className}
      `}
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      <span className="text-sm" aria-hidden="true">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}
