'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { WhatsAppButton } from '@/components/storefront/WhatsAppButton'
import { useCartStore } from '@/lib/stores/cartStore'
import type { Product } from '@/types/commerce'
import { CartSheet } from '../organisms/CartSheet'
import type { Category } from '../organisms/CategoryTabsNav'
import { CategoryTabsNav } from '../organisms/CategoryTabsNav'
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
  const t = useTranslations('Gastronomy')
  const router = useRouter()
  const { items, addItem, removeItem, updateQuantity } = useCartStore()

  const totalItems = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  )

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('todo')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (slug: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }

  // "Todo" tab as first entry
  const allCategories: Category[] = [
    { id: 'todo', name: 'Todo', slug: 'todo', icon: '🍽️' },
    ...categories,
  ]

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  // IntersectionObserver: update activeCategory as sections scroll into view
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    allCategories.forEach((cat) => {
      if (cat.id === 'todo') return
      const slug = cat.slug ?? cat.id
      const el = sectionRefs.current[slug]
      if (!el) return

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveCategory(cat.id)
            }
          }
        },
        { threshold: 0.3, rootMargin: '-80px 0px -60% 0px' },
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => {
      observers.forEach((o) => o.disconnect())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
    if (categoryId === 'todo') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const cat = categories.find((c) => c.id === categoryId)
    const slug = cat?.slug ?? categoryId
    const el = document.getElementById(`category-${slug}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleAddToCart = async (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const effectivePrice =
      product.discount_active && product.effective_price != null
        ? Number(product.effective_price)
        : Number(product.price) > 0
          ? Number(product.price)
          : 9990
    const originalPrice = Number(product.original_price ?? product.price)

    addItem({
      productId: product.id,
      name: product.name,
      price: effectivePrice,
      originalPrice,
      currency: product.currency,
      image: product.images[0] || '/placeholder.svg',
      // For gastronomy, if stock is 0 or undefined, assume available (999)
      maxQuantity: product.stock && product.stock > 0 ? product.stock : 999,
      quantity: 1, // Default to 1
    })
  }

  const handleProductClick = (product: Product) => {
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
      className="light min-h-screen bg-gradient-to-b from-background/50 to-background"
      style={{
        colorScheme: 'light',
        backgroundImage:
          'linear-gradient(to bottom, color-mix(in srgb, var(--color-primary) 5%, var(--background)), var(--background))',
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

      {/* Sticky Category Tabs */}
      <CategoryTabsNav
        categories={allCategories}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      <main className="px-2 pt-6 space-y-8">
        {productsByCategory.map(({ category, products: categoryProducts }) => {
          const slug = category.slug ?? category.id
          return (
            <section
              key={category.id}
              id={`category-${slug}`}
              ref={(el) => {
                sectionRefs.current[slug] = el
              }}
            >
              <button
                type="button"
                onClick={() => toggleCategory(slug)}
                className="flex items-center gap-3 px-2 mb-3 w-full text-left"
                aria-expanded={!collapsedCategories.has(slug)}
                data-testid={`category-header-${slug}`}
              >
                <span className="text-2xl">{category.icon}</span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
                  {category.name}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {categoryProducts.length} {categoryProducts.length === 1 ? t('work') : t('works')}
                </span>
                <ChevronDown
                  className="w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0"
                  style={{
                    transform: collapsedCategories.has(slug) ? 'rotate(-90deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {!collapsedCategories.has(slug) &&
                (categoryProducts.length > 0 ? (
                  <ProductGridGastronomy
                    products={categoryProducts}
                    onAddToCart={handleAddToCart}
                    onProductClick={handleProductClick}
                    currency={currency}
                    categoryEmoji={category.icon}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <p>{t('noWorksInCategory')}</p>
                  </div>
                ))}
            </section>
          )
        })}

        {/* Empty state - all categories */}
        {productsByCategory.every(({ products: ps }) => ps.length === 0) && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">{t('noWorksAvailable')}</p>
          </div>
        )}
      </main>

      {/* Floating Cart */}
      <FloatingCartButton
        itemCount={totalItems}
        totalAmount={totalPrice}
        currency={currency}
        onViewCart={() => setIsCartOpen(true)}
      />

      {/* Cart Sheet */}
      <CartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        items={items}
        totalPrice={totalPrice}
        onUpdateQuantity={(pid, qty) => {
          updateQuantity(pid, undefined, qty)
        }}
        onRemoveItem={(pid) => removeItem(pid, undefined)}
        currency={currency}
      />

      {/* Footer */}
      <GastronomyFooter
        tenantName={tenantName}
        tenantLocation={tenantLocation}
        tenantPhone={whatsappNumber ?? undefined}
        businessHours={
          hours
            ? (() => {
                const dayNames: Record<string, string> = {
                  monday: 'Lunes',
                  tuesday: 'Martes',
                  wednesday: 'Miércoles',
                  thursday: 'Jueves',
                  friday: 'Viernes',
                  saturday: 'Sábado',
                  sunday: 'Domingo',
                }
                const now = new Date()
                const todayKey = Object.keys(dayNames)[now.getDay() === 0 ? 6 : now.getDay() - 1]
                return Object.entries(dayNames).map(([key, label]) => ({
                  day: label,
                  hours: hours[key] ? `${hours[key].open}-${hours[key].close}` : 'Cerrado',
                  isToday: key === todayKey,
                }))
              })()
            : undefined
        }
      />

      {/* WhatsApp Floating Button */}
      <WhatsAppButton phoneNumber={whatsappNumber} />
    </div>
  )
}
