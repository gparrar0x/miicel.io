'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { WhatsAppButton } from '@/components/storefront/WhatsAppButton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useCartStore } from '@/lib/stores/cartStore'
import type { Product } from '@/types/commerce'
import { CartSheet } from '../organisms/CartSheet'
import type { Category } from '../organisms/CategoryTabsNav'
import { FloatingCartButton } from '../organisms/FloatingCartButton'
import { GastronomyFooter } from '../organisms/GastronomyFooter'
import { GastronomyHeader } from '../organisms/GastronomyHeader'
import { ProductGridGastronomy } from '../organisms/ProductGridGastronomy'

interface GastronomyLayoutProps {
  tenantSlug: string
  tenantName: string
  tenantLogo: string | null
  tenantLogoText?: string | null
  tenantBanner?: string | null
  tenantSubtitle?: string
  tenantLocation?: string
  hours?: Record<string, { open: string; close: string }>
  products: Product[]
  categories: Category[]
  currency?: string
  whatsappNumber?: string | null
}

export function GastronomyLayout({
  tenantSlug,
  tenantName,
  tenantLogo,
  tenantLogoText,
  tenantBanner,
  tenantSubtitle,
  tenantLocation,
  hours,
  products,
  categories,
  currency = 'CLP',
  whatsappNumber,
}: GastronomyLayoutProps) {
  const router = useRouter()
  const { items, addItem, removeItem, updateQuantity } = useCartStore()

  const totalItems = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  )

  const [isCartOpen, setIsCartOpen] = useState(false)
  // All categories expanded by default
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map((c) => c.id),
  )

  const handleAddToCart = async (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    addItem({
      productId: product.id,
      name: product.name,
      // Fallback price for debugging if 0
      price: Number(product.price) > 0 ? Number(product.price) : 9990,
      currency: product.currency,
      image: product.images[0] || '/placeholder.svg',
      // For gastronomy, if stock is 0 or undefined, assume available (999)
      maxQuantity: product.stock && product.stock > 0 ? product.stock : 999,
      quantity: 1, // Default to 1
    })
  }

  const handleProductClick = (product: Product) => {
    // Optional: could open product detail modal
    router.push(`/${tenantSlug}/p/${product.id}`)
  }

  // Group products by category
  const productsByCategory = categories.map((category) => ({
    category,
    products: products.filter((p) => p.category === category.slug),
  }))

  return (
    <div
      data-testid="gastronomy-layout"
      className="min-h-screen bg-gradient-to-b from-white/50 to-white"
      style={{
        backgroundImage:
          'linear-gradient(to bottom, color-mix(in srgb, var(--color-primary) 5%, white), white)',
      }}
    >
      {/* Header */}
      <GastronomyHeader
        tenantName={tenantName}
        tenantLogo={tenantLogo}
        tenantLogoText={tenantLogoText}
        tenantBanner={tenantBanner}
        tenantSubtitle={tenantSubtitle}
        tenantLocation={tenantLocation}
        hours={hours}
      />

      <main className="px-2 pt-6">
        {/* Collapsible Categories Accordion */}
        <Accordion
          type="multiple"
          value={expandedCategories}
          onValueChange={setExpandedCategories}
          className="space-y-4"
        >
          {productsByCategory.map(({ category, products: categoryProducts }) => (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="bg-white rounded-2xl border-2 shadow-sm overflow-hidden"
              style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 15%, white)' }}
            >
              <AccordionTrigger
                className="px-6 py-4 hover:no-underline transition-colors"
                style={
                  {
                    ['--hover-bg' as string]: 'color-mix(in srgb, var(--color-primary) 8%, white)',
                  } as React.CSSProperties
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    'color-mix(in srgb, var(--color-primary) 8%, white)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex flex-col items-start">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {category.name}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {categoryProducts.length}{' '}
                      {categoryProducts.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2">
                {categoryProducts.length > 0 ? (
                  <ProductGridGastronomy
                    products={categoryProducts}
                    onAddToCart={handleAddToCart}
                    onProductClick={handleProductClick}
                    currency={currency}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <p>No hay productos en esta categoría</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Empty state - all categories */}
        {productsByCategory.every(({ products }) => products.length === 0) && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No hay productos disponibles</p>
          </div>
        )}
      </main>

      {/* Updated Floating Cart */}
      <FloatingCartButton
        itemCount={totalItems}
        totalAmount={totalPrice}
        currency={currency}
        onViewCart={() => setIsCartOpen(true)}
      />

      {/* New Cart Sheet */}
      <CartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        items={items}
        totalPrice={totalPrice}
        onUpdateQuantity={(pid, qty) => {
          // CartStore expects updateQuantity(productId, colorId, qty)
          // Assuming no color variant for gastronomy for now
          updateQuantity(pid, undefined, qty)
        }}
        onRemoveItem={(pid) => removeItem(pid, undefined)}
        currency={currency}
      />

      {/* Footer */}
      <GastronomyFooter
        tenantName={tenantName}
        tenantLocation={tenantLocation}
        tenantPhone="+54 294 503-2187"
        tenantInstagram="@mangobajitofoodtruck"
      />

      {/* WhatsApp Floating Button */}
      <WhatsAppButton phoneNumber={whatsappNumber} />
    </div>
  )
}
