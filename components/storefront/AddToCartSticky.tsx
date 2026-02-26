'use client'

/**
 * AddToCartSticky Component - Product Detail
 *
 * Features:
 * - Mobile: Sticky bottom 64px, full-width, safe area
 * - Desktop: In-flow, 56px height, centered
 * - States: Disabled, Loading, Success, Error
 * - Price display (mobile only)
 * - Quantity control inline (future)
 *
 * Accessibility: ARIA labels, disabled state, tap feedback
 */

import { useEffect, useState } from 'react'

interface SelectedOption {
  id: string
  price: number
  currency: string
}

interface AddToCartStickyProps {
  selectedOption?: SelectedOption
  isLoading?: boolean
  onAddToCart: () => void | Promise<void>
  'data-testid'?: string
}

export function AddToCartSticky({
  selectedOption,
  isLoading = false,
  onAddToCart,
  'data-testid': testId = 'add-to-cart-sticky',
}: AddToCartStickyProps) {
  const [buttonState, setButtonState] = useState<'default' | 'loading' | 'success' | 'error'>(
    'default',
  )

  useEffect(() => {
    if (isLoading) {
      setButtonState('loading')
    } else {
      setButtonState('default')
    }
  }, [isLoading])

  const handleClick = async () => {
    if (!selectedOption || isLoading) return

    try {
      setButtonState('loading')
      await onAddToCart()
      setButtonState('success')
      // Reset to default after 2s
      setTimeout(() => {
        setButtonState('default')
      }, 2000)
    } catch (_error) {
      setButtonState('error')
      // Reset to default after 2s
      setTimeout(() => {
        setButtonState('default')
      }, 2000)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price)
  }

  const isDisabled = !selectedOption || buttonState === 'loading'

  const getButtonContent = () => {
    switch (buttonState) {
      case 'loading':
        return (
          <>
            <span className="spinner" aria-hidden="true" />
            Adding...
          </>
        )
      case 'success':
        return <>✓ Added to Cart</>
      case 'error':
        return <>⚠ Try Again</>
      default:
        return (
          <>
            Add to Cart
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </>
        )
    }
  }

  const ariaLabel = selectedOption
    ? `Add to cart, ${formatPrice(selectedOption.price, selectedOption.currency)}`
    : 'Add to cart'

  return (
    <div className="add-to-cart-sticky" data-testid={testId}>
      <button
        className={`add-to-cart-btn ${buttonState}`}
        onClick={handleClick}
        disabled={isDisabled}
        aria-label={ariaLabel}
        data-testid="add-to-cart-button"
      >
        {getButtonContent()}
      </button>

      {selectedOption && (
        <span className="selected-price" data-testid="add-to-cart-price">
          {formatPrice(selectedOption.price, selectedOption.currency)}
        </span>
      )}

      <style jsx>{`
        /* Mobile: Sticky bottom */
        .add-to-cart-sticky {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          padding-bottom: calc(var(--spacing-sm) + env(safe-area-inset-bottom));
          background: var(--color-bg-primary);
          border-top: 1px solid var(--color-border-subtle);
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
        }

        /* Desktop: In-flow */
        @media (min-width: 1024px) {
          .add-to-cart-sticky {
            position: static;
            justify-content: center;
            padding: var(--spacing-md) 0;
            border-top: none;
            box-shadow: none;
          }
        }

        /* Button */
        .add-to-cart-btn {
          flex: 1;
          height: 56px;
          padding: 0 var(--spacing-lg);
          font-size: 18px;
          font-weight: var(--font-weight-medium);
          color: white;
          background: var(--color-accent-primary);
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 200ms;
        }

        @media (min-width: 1024px) {
          .add-to-cart-btn {
            flex: none;
            min-width: 320px;
          }
        }

        .add-to-cart-btn:hover:not(:disabled) {
          background: var(--color-accent-hover);
        }

        .add-to-cart-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .add-to-cart-btn:disabled {
          background: var(--color-text-muted);
          cursor: not-allowed;
          opacity: 0.6;
        }

        /* Price display (mobile only) */
        .selected-price {
          font-size: 20px;
          font-weight: var(--font-weight-bold);
          color: var(--color-accent-primary);
          white-space: nowrap;
        }

        @media (min-width: 1024px) {
          .selected-price {
            display: none;
          }
        }

        /* Arrow icon */
        .arrow {
          font-size: 24px;
          transition: transform 200ms;
        }

        .add-to-cart-btn:hover:not(:disabled) .arrow {
          transform: translateX(4px);
        }

        /* Spinner */
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 600ms linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Success state */
        .add-to-cart-btn.success {
          background: var(--color-success);
          animation: pulse 300ms;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        /* Error state */
        .add-to-cart-btn.error {
          background: var(--color-error);
          animation: shake 400ms;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-8px);
          }
          75% {
            transform: translateX(8px);
          }
        }
      `}</style>
    </div>
  )
}
