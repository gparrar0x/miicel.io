'use client'

import type { SelectedModifier } from '@/types/commerce'

interface ModifierDisplay {
  optionId: string
  name: string
  priceDelta: number
}

interface CartItemModifiersSummaryProps {
  productId: string
  modifiers: SelectedModifier[]
  // Optional enriched display data; falls back to raw optionId
  modifierDisplayMap?: Record<string, ModifierDisplay>
  currency?: string
}

export function CartItemModifiersSummary({
  productId,
  modifiers,
  modifierDisplayMap,
  currency = 'CLP',
}: CartItemModifiersSummaryProps) {
  if (!modifiers.length) return null

  return (
    <ul
      data-testid={`cart-item-modifiers-${productId}`}
      className="mt-1 space-y-0.5"
      aria-label="Modificadores seleccionados"
    >
      {modifiers.map((mod) => {
        const display = modifierDisplayMap?.[mod.modifier_option_id]
        const label = display?.name ?? mod.modifier_option_id
        const delta = display?.priceDelta

        return (
          <li
            key={mod.modifier_option_id}
            className="flex items-center gap-1 text-xs text-gray-500"
          >
            <span>+</span>
            <span>{label}</span>
            {delta !== undefined && (
              <span className="font-medium">
                {delta === 0 ? '(Gratis)' : `($${Math.abs(delta).toLocaleString('es-CL')})`}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
