'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Product } from '@/types/commerce'
import { BadgeType } from '@/lib/themes/restaurant'

interface ProductCardRestaurantProps {
  product: Product
  badges?: BadgeType[]
  onAddToCart: (productId: string) => void | Promise<void>
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

export function ProductCardRestaurant({
  product,
  badges = [],
  onAddToCart,
  onClick,
  currency = 'CLP',
}: ProductCardRestaurantProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAdding(true)
    await onAddToCart(product.id)

    setTimeout(() => {
      setIsAdding(false)
    }, 600)
  }

  const imageUrl = product.images[0] || '/placeholder.svg'
  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
  }).format(product.price)

  return (
    <Card
      className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
      style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 15%, white)' }}
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
          <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {formattedPrice}
          </span>
          <Button
            onClick={handleAddToCart}
            className={cn(
              'text-white font-semibold shadow-lg transition-all duration-300',
              isAdding && 'scale-90',
            )}
            style={{
              background: `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(to right, color-mix(in srgb, var(--color-primary) 85%, black), color-mix(in srgb, var(--color-primary) 70%, black))`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`
            }}
          >
            <Plus
              className={cn(
                'w-5 h-5 mr-1 transition-transform',
                isAdding && 'rotate-90',
              )}
            />
            Agregar
          </Button>
        </div>
      </div>
    </Card>
  )
}
