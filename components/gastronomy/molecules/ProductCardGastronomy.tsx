'use client'

import { useState } from 'react'
import { DiscountBadge } from '@/components/gastronomy/atoms/DiscountBadge'
import { ProductModifierSheet } from '@/components/gastronomy/organisms/ProductModifierSheet'
import type { BadgeType } from '@/lib/themes/gastronomy'
import { BADGE_CONFIG, BADGE_PRIORITY } from '@/lib/themes/gastronomy'
import { cn } from '@/lib/utils'
import type { ModifierGroup, Product, SelectedModifier } from '@/types/commerce'

interface ProductCardGastronomyProps {
  product: Product
  badges?: BadgeType[]
  onAddToCart: (productId: string) => void | Promise<void>
  onAddToCartWithModifiers?: (
    productId: string,
    modifiers: SelectedModifier[],
    qty: number,
    modifiersTotalDelta: number,
  ) => void
  modifierGroups?: ModifierGroup[]
  onClick?: () => void
  currency?: string
  categoryEmoji?: string
}

export function ProductCardGastronomy({
  product,
  badges = [],
  onAddToCart,
  onAddToCartWithModifiers,
  modifierGroups,
  onClick,
  currency = 'CLP',
  categoryEmoji = '🍽️',
}: ProductCardGastronomyProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const hasModifiers = modifierGroups && modifierGroups.length > 0

  const handleAddClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasModifiers) {
      setSheetOpen(true)
      return
    }
    setIsAdding(true)
    await onAddToCart(product.id)
    setTimeout(() => setIsAdding(false), 600)
  }

  const handleModifierConfirm = (
    modifiers: SelectedModifier[],
    qty: number,
    modifiersTotalDelta: number,
  ) => {
    setSheetOpen(false)
    if (onAddToCartWithModifiers) {
      onAddToCartWithModifiers(product.id, modifiers, qty, modifiersTotalDelta)
    } else {
      onAddToCart(product.id)
    }
  }

  const imageUrl = product.images?.[0] ?? null
  const hasDiscount = product.discount_active === true
  const displayPrice = hasDiscount ? (product.effective_price ?? product.price) : product.price
  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
  }).format(displayPrice)
  const formattedOriginalPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
  }).format(product.price)

  // Select up to 2 badges in BADGE_PRIORITY order
  const sortedBadges = BADGE_PRIORITY.filter((b) => badges.includes(b)).slice(0, 2)

  return (
    <>
      <div
        data-testid="product-card"
        className="flex flex-row items-center gap-3 p-3 bg-white rounded-xl border border-stone-200 cursor-pointer hover:shadow-md transition-shadow duration-200"
        onClick={onClick}
      >
        {/* LEFT: info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Badges */}
          {sortedBadges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {sortedBadges.map((badge) => {
                const cfg = BADGE_CONFIG[badge]
                return (
                  <span
                    key={badge}
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none"
                    style={{ backgroundColor: cfg.bg, color: cfg.text }}
                  >
                    {cfg.icon} {cfg.label}
                  </span>
                )
              })}
            </div>
          )}

          {/* Name */}
          <p className="font-semibold text-sm text-[#1C1917] line-clamp-2 leading-snug">
            {product.name}
          </p>

          {/* Description */}
          {product.description && product.description.trim().length > 0 && (
            <p className="text-xs text-stone-500 line-clamp-1 leading-snug">
              {product.description}
            </p>
          )}

          {/* Price row */}
          <div className="flex items-center gap-2 mt-0.5">
            {hasDiscount && (
              <span
                data-testid="product-card-original-price"
                className="text-xs line-through text-stone-400"
              >
                {formattedOriginalPrice}
              </span>
            )}
            <span
              data-testid={hasDiscount ? 'product-card-discounted-price' : undefined}
              className="font-bold text-sm"
              style={{ color: 'var(--color-primary)' }}
            >
              {formattedPrice}
            </span>
            {hasDiscount && product.discount_type && product.discount_value != null && (
              <DiscountBadge
                discountType={product.discount_type}
                discountValue={product.discount_value}
                currency={currency}
              />
            )}
          </div>
        </div>

        {/* RIGHT: image + action */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          {/* Image */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-[72px] h-[72px] rounded-lg object-cover"
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-lg bg-stone-100 flex items-center justify-center text-2xl">
              {categoryEmoji}
            </div>
          )}

          {/* Action */}
          {hasModifiers ? (
            <button
              type="button"
              data-testid={`product-${product.id}-choose-options`}
              onClick={handleAddClick}
              className="text-xs font-medium whitespace-nowrap"
              style={{ color: 'var(--color-primary)' }}
            >
              Elegir opciones
            </button>
          ) : (
            <button
              type="button"
              data-testid={`product-${product.id}-add-to-cart`}
              onClick={handleAddClick}
              disabled={isAdding}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-200',
                isAdding ? 'scale-90 opacity-70' : 'hover:scale-110 active:scale-90',
              )}
              style={{ backgroundColor: 'var(--color-primary)' }}
              aria-label="Agregar al carrito"
            >
              +
            </button>
          )}
        </div>
      </div>

      {hasModifiers && (
        <ProductModifierSheet
          product={product}
          modifierGroups={modifierGroups!}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onConfirm={handleModifierConfirm}
          currency={currency}
        />
      )}
    </>
  )
}
