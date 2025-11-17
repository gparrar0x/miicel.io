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

import { useState } from 'react'
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
  tenantLogoText?: string | null
  tenantBanner?: string | null
  tenantSubtitle?: string
  tenantLocation?: string
  products: Product[]
  categories: Category[]
  currency?: string
}

export function RestaurantLayout({
  tenantSlug,
  tenantName,
  tenantLogo,
  tenantLogoText,
  tenantBanner,
  tenantSubtitle,
  tenantLocation,
  products,
  categories,
  currency = 'CLP',
}: RestaurantLayoutProps) {
  const router = useRouter()
  const { items, addItem, getTotalItems, getTotalPrice } = useCartStore()

  // Collapsible categories state - all expanded by default
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map(c => c.id))
  )

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

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
      {/* Hero Header with Banner */}
      <header
        data-testid="restaurant-header"
        className="relative overflow-hidden min-h-[200px] bg-[#fbbf24] shadow-lg"
        style={{
          backgroundImage: tenantBanner ? `url(${tenantBanner})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)',
        }}
      >
        {/* Cart Badge - Floating top right */}
        <Link
          href={`/${tenantSlug}/cart`}
          data-testid="restaurant-cart-badge"
          className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Header Content */}
        <div className="max-w-[1000px] mx-auto px-6 py-8 flex items-center gap-8 relative">
          {/* Logo Circle */}
          {tenantLogo && (
            <div className="flex-shrink-0" data-testid="restaurant-logo">
              <div className="relative w-[120px] h-[120px] rounded-full bg-black p-1 border-[6px] border-white shadow-[0_8px_24px_rgba(0,0,0,0.3),0_0_0_2px_#000]">
                <Image
                  src={tenantLogo}
                  alt={tenantName}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            </div>
          )}

          {/* Header Text */}
          <div className="flex-grow">
            {/* Logo Text */}
            {tenantLogoText && (
              <div className="mb-2">
                <img
                  src={tenantLogoText}
                  alt={tenantName}
                  className="h-[100px] w-auto"
                  style={{
                    filter: 'drop-shadow(3px 3px 0px #000) drop-shadow(2px 2px 8px rgba(0,0,0,0.5))',
                  }}
                />
              </div>
            )}

            {/* Subtitle */}
            {tenantSubtitle && (
              <p className="text-lg font-medium text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                {tenantSubtitle}
              </p>
            )}

            {/* Location */}
            {tenantLocation && (
              <p className="text-base text-white flex items-center gap-2 font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                <span>📍</span>
                <span>{tenantLocation}</span>
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Category Tabs Nav */}
      <CategoryTabsNav categories={categories} />

      {/* Product Sections (by category) */}
      <main>
        {productsByCategory.map(({ category, products: categoryProducts }) => {
          const isExpanded = expandedCategories.has(category.id)

          return (
            <section
              key={category.id}
              id={`category-${category.id}`}
              className="mb-2"
            >
              {/* Section Header - Collapsible */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-4 py-4 border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                data-testid={`category-header-${category.slug}`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                    <CategoryIcon icon={category.icon} category={category.slug} size="md" />
                    {category.name}
                    {category.productCount !== undefined && (
                      <span className="text-sm text-gray-500 font-normal">
                        ({category.productCount} {category.productCount === 1 ? 'producto' : 'productos'})
                      </span>
                    )}
                  </h2>

                  {/* Collapse/Expand Icon */}
                  <svg
                    className={`w-6 h-6 text-gray-600 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Product Grid - Collapsible */}
              {isExpanded && (
                <div
                  data-testid={`category-products-${category.slug}`}
                  className="animate-slideDown"
                >
                  <ProductGridRestaurant
                    products={categoryProducts}
                    onAddToCart={handleAddToCart}
                    onProductClick={handleProductClick}
                    currency={currency}
                  />
                </div>
              )}
            </section>
          )
        })}

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
