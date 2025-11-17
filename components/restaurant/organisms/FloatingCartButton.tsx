/**
 * FloatingCartButton - Sticky bottom cart CTA with animation
 *
 * States:
 * - Hidden: itemCount === 0
 * - Visible: itemCount > 0, slide-up animation
 *
 * Layout:
 * - Fixed bottom 0, full width
 * - Height 72px (safe area +16px iOS)
 * - Background primary color
 * - White text
 *
 * Test ID: floating-cart
 * Created: 2025-01-16 (SKY-42, Fase 4)
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CartSummary } from '../molecules/CartSummary'

interface FloatingCartButtonProps {
  itemCount: number
  totalAmount: number
  currency?: string
  onViewCart: () => void
  className?: string
}

export function FloatingCartButton({
  itemCount,
  totalAmount,
  currency = 'CLP',
  onViewCart,
  className = '',
}: FloatingCartButtonProps) {
  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          data-testid="floating-cart"
          className={`
            fixed bottom-0 left-0 right-0 z-50
            ${className}
          `}
        >
          <div
            className="p-4 pb-6 shadow-2xl"
            style={{
              backgroundColor: 'var(--color-primary, #E63946)',
              paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
            }}
          >
            <div className="max-w-[1280px] mx-auto">
              <div className="flex items-center justify-between mb-3 text-white">
                <CartSummary itemCount={itemCount} total={totalAmount} currency={currency} />
              </div>
              <button
                data-testid="floating-cart-cta"
                onClick={onViewCart}
                className="
                  w-full bg-white text-gray-900 font-bold py-3 px-6 rounded-lg
                  hover:bg-gray-100 active:scale-98 transition-all duration-200
                  flex items-center justify-center gap-2
                "
                style={{
                  color: 'var(--color-primary, #E63946)',
                }}
              >
                <span>Ver Carrito</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
