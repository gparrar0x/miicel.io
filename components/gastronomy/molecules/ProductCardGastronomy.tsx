'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { DiscountBadge } from '@/components/gastronomy/atoms/DiscountBadge'
import { ProductModifierSheet } from '@/components/gastronomy/organisms/ProductModifierSheet'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { BadgeType } from '@/lib/themes/gastronomy'
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
}

const badgeStyles: Record<string, string> = {
  'Más Vendido': 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
  Picante: 'bg-red-600 text-white',
  Vegano: 'bg-green-600 text-white',
  Nuevo: 'bg-blue-600 text-white',
  // Mapped from existing badge types
  popular: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
  'spicy-hot': 'bg-red-600 text-white',
  vegan: 'bg-green-600 text-white',
  nuevo: 'bg-blue-600 text-white',
}

export function ProductCardGastronomy({
  product,
  badges = [],
  onAddToCart,
  onAddToCartWithModifiers,
  modifierGroups,
  onClick,
  currency = 'CLP',
}: ProductCardGastronomyProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const hasModifiers = modifierGroups && modifierGroups.length > 0

  const handleAddToCart = async (e: React.MouseEvent) => {
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

  const imageUrl = product.images[0] || '/placeholder.svg'
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

  return (
    <>
      <Card
        className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
        style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }}
        onClick={onClick}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {badges && badges.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold shadow-lg',
                    badgeStyles[badge] || 'bg-gray-800 text-white',
                  )}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-balance">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-pretty">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col gap-0.5">
              {hasDiscount && (
                <span
                  data-testid="product-card-original-price"
                  className="text-sm line-through text-gray-400"
                >
                  {formattedOriginalPrice}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span
                  data-testid={hasDiscount ? 'product-card-discounted-price' : undefined}
                  className="text-2xl font-bold"
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
            <Button
              onClick={handleAddToCart}
              className={cn(
                'text-white font-semibold shadow-lg transition-all duration-300',
                isAdding && 'scale-90',
              )}
              style={{
                background: `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(to right, color-mix(in srgb, var(--color-primary) 85%, black), color-mix(in srgb, var(--color-primary) 70%, black))`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`
              }}
            >
              <Plus className={cn('w-5 h-5 mr-1 transition-transform', isAdding && 'rotate-90')} />
              Agregar
            </Button>
          </div>
        </div>
      </Card>

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
