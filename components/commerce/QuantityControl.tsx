/**
 * QuantityControl Component
 *
 * Increment/decrement controls with manual input.
 * Min/max validation.
 */

'use client'

import { useState, useEffect } from 'react'

interface QuantityControlProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  productId: string
  colorId?: string
}

export function QuantityControl({
  value,
  onChange,
  min = 1,
  max = 99,
  productId,
  colorId,
}: QuantityControlProps) {
  const [inputValue, setInputValue] = useState(String(value))

  useEffect(() => {
    setInputValue(String(value))
  }, [value])

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)

    // Validate on blur, not on every keystroke
    if (val === '') return

    const num = parseInt(val, 10)
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num))
      onChange(clamped)
    }
  }

  const handleBlur = () => {
    // Ensure valid value on blur
    if (inputValue === '' || isNaN(parseInt(inputValue, 10))) {
      setInputValue(String(value))
    } else {
      const num = parseInt(inputValue, 10)
      const clamped = Math.max(min, Math.min(max, num))
      setInputValue(String(clamped))
      if (clamped !== value) {
        onChange(clamped)
      }
    }
  }

  const testIdBase = colorId
    ? `product-${productId}-color-${colorId}-quantity`
    : `product-${productId}-quantity`

  return (
    <div className="flex items-center gap-3" data-testid={testIdBase}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label="Decrease quantity"
        data-testid={`${testIdBase}-minus`}
        className="h-10 w-10 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span className="text-lg">−</span>
      </button>

      <input
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        aria-label="Quantity"
        data-testid={`${testIdBase}-input`}
        className="h-10 w-16 rounded-lg border border-gray-300 text-center text-base font-medium focus:outline-none focus:ring-2 focus:ring-tenant-primary"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label="Increase quantity"
        data-testid={`${testIdBase}-plus`}
        className="h-10 w-10 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span className="text-lg">+</span>
      </button>
    </div>
  )
}
