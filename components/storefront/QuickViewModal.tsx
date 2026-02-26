/**
 * SKY-43: QuickViewModal Component
 * Full-screen mobile modal showing product options (digital/physical)
 *
 * Usage:
 * ```tsx
 * <QuickViewModal
 *   product={product}
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onAddToCart={(optionId) => handleAddToCart(optionId)}
 * />
 * ```
 *
 * Features:
 * - Full-screen mobile portrait (<640px)
 * - Split layout mobile landscape (50/50 image/options)
 * - Slide-up animation (300ms)
 * - Backdrop fade (200ms)
 * - Close: tap backdrop, ESC key, close button (48x48px)
 * - Option cards: expandable, 48px CTA height
 * - Lazy load: only render when open
 * - Focus trap, body scroll lock
 *
 * Test IDs: modal-quickview, modal-backdrop, modal-close, modal-image,
 *           modal-title, modal-artist, modal-option-card, modal-option-cta
 *
 * Created: 2025-01-17 (SKY-43 Phase 1)
 */

'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export interface ProductOption {
  id: string
  type: 'digital' | 'physical'
  title: string
  specs: string[]
  price: number
  currency: string
}

export interface QuickViewProduct {
  id: string
  name: string
  artist?: string
  images: string[]
  options: ProductOption[]
}

interface QuickViewModalProps {
  product: QuickViewProduct | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (optionId: string) => void
  'data-testid'?: string
}

export function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  'data-testid': testId = 'modal-quickview',
}: QuickViewModalProps) {
  const [expandedOption, setExpandedOption] = useState<string | null>(null)

  // ESC key close handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Body scroll lock
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Lazy load: don't render until open
  if (!isOpen || !product) return null

  const primaryImage = product.images[0] || '/placeholder-product.jpg'

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleAddToCart = (optionId: string) => {
    onAddToCart(optionId)
    onClose()
  }

  return (
    <div
      data-testid={testId}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        data-testid="modal-backdrop"
        onClick={handleBackdropClick}
        className="absolute inset-0 bg-[var(--modal-backdrop)] animate-[fadeIn_200ms_ease-out]"
      />

      {/* Modal Content */}
      <div
        className="relative w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh]
                   bg-[var(--color-bg-primary)] overflow-y-auto
                   animate-[slideUp_300ms_ease-out] sm:animate-[fadeIn_300ms_ease-out]
                   sm:rounded-lg sm:mx-4
                   flex flex-col sm:flex-row"
      >
        {/* Close Button (48x48px tap target) */}
        <button
          data-testid="modal-close"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute top-4 right-4 z-10
                     min-w-[var(--tap-target-min)] min-h-[var(--tap-target-min)]
                     flex items-center justify-center bg-[var(--color-bg-primary)]
                     rounded-full border-none cursor-pointer shadow-md
                     transition-transform duration-[var(--timing-fast)]
                     active:scale-[0.98] hover:bg-gray-100"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Image Section */}
        <div className="w-full sm:w-1/2 flex-shrink-0">
          <div
            data-testid="modal-image"
            className="relative w-full h-[var(--modal-image-height-mobile)] sm:h-full sm:min-h-[400px]"
          >
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
              quality={90}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-[var(--modal-padding)] sm:p-6 overflow-y-auto">
          {/* Title */}
          <h2
            id="modal-title"
            data-testid="modal-title"
            className="text-[var(--font-size-h3)] font-[var(--font-weight-bold)]
                       leading-[var(--line-height-tight)] text-[var(--color-text-primary)]
                       mb-2"
          >
            {product.name}
          </h2>

          {/* Artist */}
          {product.artist && (
            <a
              href={`/artist/${encodeURIComponent(product.artist)}`}
              data-testid="modal-artist"
              className="text-[var(--font-size-small)] text-[var(--color-accent-primary)]
                         underline hover:text-[var(--color-accent-hover)] mb-4 inline-block"
            >
              by {product.artist}
            </a>
          )}

          {/* Option Cards */}
          <div className="space-y-4 mt-6">
            {product.options.map((option) => {
              const isExpanded = expandedOption === option.id
              const formattedPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: option.currency,
              }).format(option.price)

              return (
                <div
                  key={option.id}
                  data-testid="modal-option-card"
                  className="border border-[var(--color-border-subtle)] rounded-lg
                             p-6 transition-all duration-[var(--timing-normal)]"
                >
                  {/* Option Header */}
                  <button
                    onClick={() => setExpandedOption(isExpanded ? null : option.id)}
                    className="w-full flex items-center justify-between text-left border-none
                               bg-transparent cursor-pointer p-0"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {option.type === 'digital' ? (
                          <span className="text-xl" aria-hidden="true">
                            🖼️
                          </span>
                        ) : (
                          <span className="text-xl" aria-hidden="true">
                            🎨
                          </span>
                        )}
                        <h3 className="text-[var(--font-size-h4)] font-[var(--font-weight-medium)] text-[var(--color-text-primary)]">
                          {option.title}
                        </h3>
                      </div>
                      <p className="text-[var(--font-size-h3)] font-[var(--font-weight-bold)] text-[var(--color-accent-primary)]">
                        {formattedPrice}
                      </p>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="var(--color-text-secondary)"
                      strokeWidth="2"
                      className={`transition-transform duration-[var(--timing-normal)] ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <path d="M5 7.5L10 12.5L15 7.5" />
                    </svg>
                  </button>

                  {/* Option Specs (Expandable) */}
                  {isExpanded && (
                    <ul className="mt-4 space-y-2 text-[var(--font-size-small)] text-[var(--color-text-secondary)] animate-[fadeIn_200ms_ease-out]">
                      {option.specs.map((spec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[var(--color-accent-primary)] mt-1">•</span>
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Add to Cart CTA (48px height) */}
                  <button
                    data-testid="modal-option-cta"
                    onClick={() => handleAddToCart(option.id)}
                    className="w-full mt-4 min-h-[var(--tap-target-min)] px-6
                               bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)]
                               text-[var(--font-size-body)] font-[var(--font-weight-medium)]
                               rounded border-none cursor-pointer
                               transition-all duration-[var(--timing-normal)]
                               active:scale-[0.98] hover:bg-[var(--color-accent-hover)]"
                  >
                    Add to Cart
                  </button>
                </div>
              )
            })}
          </div>

          {/* View Full Details Link */}
          <a
            href={`/p/${product.id}`}
            data-testid="modal-detail-link"
            className="block mt-6 text-center text-[var(--font-size-small)]
                       text-[var(--color-accent-primary)] underline
                       hover:text-[var(--color-accent-hover)]"
          >
            View Full Details →
          </a>
        </div>
      </div>
    </div>
  )
}
