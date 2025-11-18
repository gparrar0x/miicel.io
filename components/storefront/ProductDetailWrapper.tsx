'use client'

/**
 * ProductDetailWrapper - Client State Component
 *
 * Responsibilities:
 * - Client component wrapper (cart state, option selection)
 * - useState: selectedOptionId, isAdding
 * - useCartStore: addToCart action
 * - Orchestrate child components
 * - Handle add to cart logic (success/error)
 *
 * Layout: Mobile-first, responsive grid
 */

import { useState } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'
import { ImageGallery } from './ImageGallery'
import { ProductInfo } from './ProductInfo'
import { OptionsSelector } from './OptionsSelector'
import { AddToCartSticky } from './AddToCartSticky'

interface ImageData {
  id: string
  url: string
  alt: string
  lqip?: string
  width: number
  height: number
}

interface ProductOption {
  id: string
  type: 'digital' | 'physical'
  title: string
  specs: string[]
  price: number
  currency: string
  stock: number
  sku: string
}

interface ProductArtist {
  id: string
  name: string
  slug: string
}

interface ProductDetail {
  id: string
  name: string
  artist?: ProductArtist
  price: number // Base price or minimum if options
  currency: string
  priceType: 'fixed' | 'from'
  description: string
  images: ImageData[]
  options: ProductOption[]
}

interface ProductDetailWrapperProps {
  product: ProductDetail
  tenantId: string
  'data-testid'?: string
}

export function ProductDetailWrapper({
  product,
  tenantId,
  'data-testid': testId = 'product-detail-wrapper',
}: ProductDetailWrapperProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>()
  const [isAdding, setIsAdding] = useState(false)
  const addToCart = useCartStore((state) => state.addItem)

  const selectedOption = product.options.find(
    (opt) => opt.id === selectedOptionId
  )

  const handleAddToCart = async () => {
    if (!selectedOption) return

    setIsAdding(true)
    try {
      // Add to cart (Zustand store)
      addToCart({
        productId: product.id,
        name: product.name,
        price: selectedOption.price,
        currency: selectedOption.currency,
        image: product.images[0]?.url || '',
        maxQuantity: selectedOption.stock,
        quantity: 1,
      })

      // Success feedback handled by AddToCartSticky component
      // Optional: Show toast notification
    } catch (error) {
      console.error('Add to cart failed:', error)
      // Error feedback handled by AddToCartSticky component
      // Optional: Show error toast
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="product-detail-wrapper" data-testid={testId}>
      <div className="detail-grid">
        {/* Left: Image Gallery */}
        <div className="grid-image">
          <ImageGallery
            images={product.images}
            productName={product.name}
            artistName={product.artist?.name}
          />
        </div>

        {/* Right: Product Info + Options */}
        <div className="grid-info">
          <ProductInfo
            product={{
              id: product.id,
              name: product.name,
              artist: product.artist,
              price: selectedOption?.price || product.price,
              currency: product.currency,
              priceType: product.priceType,
              description: product.description,
            }}
          />

          <OptionsSelector
            options={product.options}
            selectedOptionId={selectedOptionId}
            onSelectOption={setSelectedOptionId}
          />

          {/* Desktop only: In-flow CTA */}
          <div className="cta-desktop">
            <AddToCartSticky
              selectedOption={
                selectedOption
                  ? {
                      id: selectedOption.id,
                      price: selectedOption.price,
                      currency: selectedOption.currency,
                    }
                  : undefined
              }
              isLoading={isAdding}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </div>

      {/* Mobile only: Sticky bottom CTA */}
      <div className="cta-mobile">
        <AddToCartSticky
          selectedOption={
            selectedOption
              ? {
                  id: selectedOption.id,
                  price: selectedOption.price,
                  currency: selectedOption.currency,
                }
              : undefined
          }
          isLoading={isAdding}
          onAddToCart={handleAddToCart}
        />
      </div>

      <style jsx>{`
        .product-detail-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--spacing-sm);
        }

        @media (min-width: 1024px) {
          .product-detail-wrapper {
            padding: var(--spacing-md);
          }
        }

        /* Responsive grid */
        .detail-grid {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        @media (min-width: 640px) {
          .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-lg);
          }
        }

        @media (min-width: 1024px) {
          .detail-grid {
            grid-template-columns: 60% 40%;
            gap: var(--spacing-xl);
          }
        }

        /* Image column */
        .grid-image {
          width: 100%;
        }

        /* Info column */
        .grid-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        /* CTA visibility */
        .cta-mobile {
          display: block;
        }

        .cta-desktop {
          display: none;
        }

        @media (min-width: 1024px) {
          .cta-mobile {
            display: none;
          }

          .cta-desktop {
            display: block;
          }
        }
      `}</style>
    </div>
  )
}
