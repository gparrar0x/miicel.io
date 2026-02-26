'use client'

/**
 * GalleryGridWrapper - Client Component Wrapper
 * Handles event handlers for ProductGrid (server→client boundary)
 */

import { useRouter } from 'next/navigation'
import type { Product } from '@/types/commerce'
import { ProductGrid } from './ProductGrid'

interface GalleryGridWrapperProps {
  products: Product[]
  tenantId: string
}

export function GalleryGridWrapper({ products, tenantId }: GalleryGridWrapperProps) {
  const router = useRouter()

  return (
    <ProductGrid
      template="gallery"
      products={products}
      onProductClick={(product) => {
        router.push(`/${tenantId}/p/${product.id}`)
      }}
      onQuickView={(productId) => {
        router.push(`/${tenantId}/p/${productId}`)
      }}
    />
  )
}
