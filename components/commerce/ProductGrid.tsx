'use client'

/**
 * Product Grid with Add-to-Cart
 *
 * Client component for interactive cart actions.
 * Mobile-first grid layout matching storefront design.
 */

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/stores/cartStore'
import type { CartItem } from '@/types/commerce'

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  category: string | null
  image_url: string | null
  stock: number | null
}

interface ProductGridProps {
  products: Product[]
  tenantId: string
  currency: string
}

export function ProductGrid({ products, tenantId, currency }: ProductGridProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (
    e: React.MouseEvent,
    product: Product
  ) => {
    e.preventDefault() // Stop link navigation
    e.stopPropagation()

    const cartItem: Omit<CartItem, 'quantity'> = {
      productId: String(product.id),
      name: product.name,
      price: product.price,
      currency,
      image: product.image_url || '',
      maxQuantity: product.stock || 999,
    }

    addItem({ ...cartItem, quantity: 1 })
  }

  if (products.length === 0) {
    return (
      <div
        className="text-center py-16"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <p className="text-lg">No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="group rounded-lg overflow-hidden transition-shadow hover:shadow-lg relative"
          style={{ backgroundColor: 'var(--color-bg-elevated)' }}
          data-testid={`product-card-${product.id}`}
        >
          <Link href={`/${tenantId}/product/${product.id}`}>
            <div className="relative aspect-square">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-bg-base)' }}
                >
                  <span style={{ color: 'var(--color-text-tertiary)' }}>
                    Sin imagen
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 pb-16">
              <h3
                className="font-medium line-clamp-2 mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {product.name}
              </h3>
              {product.description && (
                <p
                  className="text-sm line-clamp-2 mb-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {product.description}
                </p>
              )}
              <p
                className="text-xl font-bold"
                style={{ color: 'var(--color-primary)' }}
              >
                ${product.price}
              </p>
            </div>
          </Link>

          {/* Add to Cart Button - Outside Link to prevent event conflicts */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleAddToCart(e, product)
            }}
            disabled={!product.stock || product.stock === 0}
            className="absolute bottom-4 left-4 right-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 z-10"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
            data-testid={`add-to-cart-${product.id}`}
          >
            {!product.stock || product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      ))}
    </div>
  )
}
