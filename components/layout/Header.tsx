/**
 * SKY-43: Header Component
 * Minimal sticky header for gallery template
 *
 * Usage:
 * ```tsx
 * <Header
 *   storeName="Gallery Name"
 *   cartItemsCount={3}
 *   onCartClick={() => setCartOpen(true)}
 * />
 * ```
 *
 * Features:
 * - Sticky on scroll (shadow appears)
 * - 64px height mobile, 72px desktop
 * - Centered logo/store name
 * - Search + Cart icons right (48x48px tap targets)
 * - Minimal nav (optional: Shop, About, Contact)
 *
 * Test ID: site-header
 * Created: 2025-01-17 (SKY-43 Phase 1)
 */

'use client'

import { useEffect, useState } from 'react'

interface HeaderProps {
  storeName?: string
  cartItemsCount?: number
  onCartClick?: () => void
  onSearchClick?: () => void
  showNav?: boolean
  'data-testid'?: string
}

export function Header({
  storeName = 'Gallery',
  cartItemsCount = 0,
  onCartClick,
  onSearchClick,
  showNav = false,
  'data-testid': testId = 'site-header',
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      data-testid={testId}
      className={`sticky top-0 z-40 bg-[var(--color-bg-primary)] transition-shadow duration-[var(--timing-normal)]
                  ${isScrolled ? 'shadow-md' : ''}`}
    >
      <div className="h-16 md:h-18 px-[var(--spacing-sm)] max-w-[1200px] mx-auto flex items-center justify-between">
        {/* Logo / Store Name (Centered on mobile) */}
        <div className="flex-1 flex justify-center md:justify-start">
          <a
            href="/"
            className="text-[var(--font-size-h3)] font-[var(--font-weight-bold)]
                       text-[var(--color-text-primary)] no-underline
                       hover:text-[var(--color-accent-primary)] transition-colors
                       duration-[var(--timing-normal)]"
          >
            {storeName}
          </a>
        </div>

        {/* Nav (Desktop only, optional) */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <a
              href="/shop"
              className="text-[var(--font-size-body)] text-[var(--color-text-secondary)]
                         hover:text-[var(--color-text-primary)] no-underline
                         transition-colors duration-[var(--timing-normal)]"
            >
              Shop
            </a>
            <a
              href="/about"
              className="text-[var(--font-size-body)] text-[var(--color-text-secondary)]
                         hover:text-[var(--color-text-primary)] no-underline
                         transition-colors duration-[var(--timing-normal)]"
            >
              About
            </a>
            <a
              href="/contact"
              className="text-[var(--font-size-body)] text-[var(--color-text-secondary)]
                         hover:text-[var(--color-text-primary)] no-underline
                         transition-colors duration-[var(--timing-normal)]"
            >
              Contact
            </a>
          </nav>
        )}

        {/* Actions: Search + Cart */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Search Button (optional) */}
          {onSearchClick && (
            <button
              onClick={onSearchClick}
              aria-label="Search products"
              className="min-w-[var(--tap-target-min)] min-h-[var(--tap-target-min)]
                         flex items-center justify-center bg-transparent border-none
                         cursor-pointer transition-transform duration-[var(--timing-fast)]
                         active:scale-[0.98]"
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          )}

          {/* Cart Button */}
          {onCartClick && (
            <button
              onClick={onCartClick}
              aria-label={`Shopping cart with ${cartItemsCount} items`}
              className="relative min-w-[var(--tap-target-min)] min-h-[var(--tap-target-min)]
                         flex items-center justify-center bg-transparent border-none
                         cursor-pointer transition-transform duration-[var(--timing-fast)]
                         active:scale-[0.98]"
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
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>

              {/* Cart Badge (item count) */}
              {cartItemsCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5
                             bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)]
                             text-[11px] font-[var(--font-weight-bold)]
                             rounded-full flex items-center justify-center"
                >
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
