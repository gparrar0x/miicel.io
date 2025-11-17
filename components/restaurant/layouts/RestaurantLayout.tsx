/**
 * RestaurantLayout - Main layout for restaurant template
 *
 * Structure:
 * - Header (sticky, logo + name + cart badge)
 * - Category tabs nav (sticky below header)
 * - Product sections grouped by category
 * - Floating cart button (bottom sticky)
 *
 * Test ID: restaurant-layout
 * Created: 2025-01-16 (SKY-42, Fase 5)
 */

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types/commerce'
import { Category, CategoryTabsNav } from '../organisms/CategoryTabsNav'
import { ProductGridRestaurant } from '../organisms/ProductGridRestaurant'
import { FloatingCartButton } from '../organisms/FloatingCartButton'
import { CategoryIcon } from '../atoms/CategoryIcon'
import { useCartStore } from '@/lib/stores/cartStore'

interface RestaurantLayoutProps {
  tenantSlug: string
  tenantName: string
  tenantLogo: string | null
  products: Product[]
  categories: Category[]
  currency?: string
}

export function RestaurantLayout({
  tenantSlug,
  tenantName,
  tenantLogo,
  products,
  categories,
  currency = 'CLP',
}: RestaurantLayoutProps) {
  const router = useRouter()
  const { items, addItem, getTotalItems, getTotalPrice } = useCartStore()

  const handleAddToCart = async (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.images[0] || '/placeholder-food.jpg',
      maxQuantity: product.stock,
    })
  }

  const handleProductClick = (product: Product) => {
    router.push(`/${tenantSlug}/product/${product.id}`)
  }

  const handleViewCart = () => {
    router.push(`/${tenantSlug}/cart`)
  }

  // Group products by category
  const productsByCategory = categories.map((category) => ({
    category,
    products: products.filter((p) => p.category === category.slug),
  }))

  return (
    <div data-testid="restaurant-layout" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        data-testid="restaurant-header"
        className="sticky top-0 z-50 bg-white shadow-sm h-16"
      >
        <div className="flex items-center justify-between px-4 h-full max-w-[1440px] mx-auto">
          {/* Logo */}
          {tenantLogo ? (
            <div data-testid="restaurant-logo" className="relative w-10 h-10">
              <Image
                src={tenantLogo}
                alt={tenantName}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xl">🍔</span>
            </div>
          )}

          {/* Restaurant Name */}
          <h1 className="font-bold text-lg text-gray-900 flex-1 text-center">
            {tenantName}
          </h1>

          {/* Cart Badge (Desktop) */}
          <Link
            href={`/${tenantSlug}/cart`}
            data-testid="restaurant-cart-badge"
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Category Tabs Nav */}
      <CategoryTabsNav categories={categories} />

      {/* Product Sections (by category) */}
      <main>
        {productsByCategory.map(({ category, products: categoryProducts }) => (
          <section
            key={category.id}
            id={`category-${category.id}`}
            className="mb-8"
          >
            {/* Section Header */}
            <div className="px-4 py-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <CategoryIcon icon={category.icon} category={category.slug} size="md" />
                {category.name}
                {category.productCount !== undefined && (
                  <span className="text-sm text-gray-500 font-normal">
                    ({category.productCount} {category.productCount === 1 ? 'producto' : 'productos'})
                  </span>
                )}
              </h2>
            </div>

            {/* Product Grid */}
            <ProductGridRestaurant
              products={categoryProducts}
              onAddToCart={handleAddToCart}
              onProductClick={handleProductClick}
              currency={currency}
            />
          </section>
        ))}

        {/* Empty state */}
        {productsByCategory.every(({ products }) => products.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No hay productos disponibles</p>
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      <FloatingCartButton
        itemCount={getTotalItems()}
        totalAmount={getTotalPrice()}
        currency={currency}
        onViewCart={handleViewCart}
      />
    </div>
  )
}
