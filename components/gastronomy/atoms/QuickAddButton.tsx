/**
 * QuickAddButton - One-click add-to-cart button
 *
 * States:
 * 1. Default: "+ Agregar" (success green)
 * 2. Loading: "..." (disabled, spinner)
 * 3. Added: "✓ Agregado" (1s feedback, then default)
 *
 * Test ID: quick-add-{productId}
 * Created: 2025-01-16 (SKY-42, Fase 2)
 */

'use client'

import { useEffect, useState } from 'react'

interface QuickAddButtonProps {
  productId: string
  onClick: () => void | Promise<void>
  className?: string
  disabled?: boolean
}

export function QuickAddButton({
  productId,
  onClick,
  className = '',
  disabled = false,
}: QuickAddButtonProps) {
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (added) {
      const timer = setTimeout(() => setAdded(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [added])

  const handleClick = async () => {
    if (loading || added || disabled) return

    setLoading(true)
    try {
      await onClick()
      setAdded(true)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      data-testid={`quick-add-${productId}`}
      onClick={handleClick}
      disabled={loading || added || disabled}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm
        min-h-[48px]
        transition-all duration-200
        ${
          loading || disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : added
              ? 'bg-green-500 text-white'
              : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
        }
        ${className}
      `}
      aria-label={loading ? 'Agregando...' : added ? 'Agregado al carrito' : 'Agregar al carrito'}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      ) : added ? (
        <span className="inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Agregado
        </span>
      ) : (
        <span className="inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar
        </span>
      )}
    </button>
  )
}
