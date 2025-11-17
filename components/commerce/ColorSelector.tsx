/**
 * ColorSelector Component
 *
 * Radio-style color picker with visual swatches.
 * Disabled state for out-of-stock variants.
 */

'use client'

import type { ProductColor } from '@/types/commerce'

interface ColorSelectorProps {
  colors: ProductColor[]
  selected?: string
  onChange: (colorId: string) => void
  disabled?: boolean
  productId: string
}

export function ColorSelector({
  colors,
  selected,
  onChange,
  disabled = false,
  productId,
}: ColorSelectorProps) {
  return (
    <div className="space-y-3" data-testid={`product-${productId}-color-selector`}>
      <label className="block text-sm font-medium">
        Color
        {selected && (
          <span className="ml-2 text-tenant-secondary">
            {colors.find((c) => c.id === selected)?.name}
          </span>
        )}
      </label>
      <div className="flex gap-3">
        {colors.map((color) => {
          const isSelected = selected === color.id
          const isDisabled = disabled

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => !isDisabled && onChange(color.id)}
              disabled={isDisabled}
              aria-label={`Select ${color.name}`}
              aria-pressed={isSelected}
              data-testid={`product-${productId}-color-${color.id}`}
              className={`
                relative h-10 w-10 rounded-full border-2 transition-all
                ${isSelected ? 'border-tenant-primary scale-110' : 'border-gray-300'}
                ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
              `}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-white drop-shadow-md"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
              {isDisabled && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
