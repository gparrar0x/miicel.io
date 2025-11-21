"use client"

import { useState, useRef, useEffect } from "react"
import { RestaurantHeader } from "@/components/restaurant-header"
import { CategoryNav } from "@/components/category-nav"
import { MenuItem } from "@/components/menu-item"
import { FloatingCart } from "@/components/floating-cart"
import { CartSheet } from "@/components/cart-sheet"
import { menuData } from "@/lib/menu-data"

export default function RestaurantMenu() {
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([])
  const [activeCategory, setActiveCategory] = useState("entradas")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeItem = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId]
    if (element) {
      const offset = 140 // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

      for (const category of menuData.categories) {
        const element = categoryRefs.current[category.id]
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveCategory(category.id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-32">
      <RestaurantHeader />

      <CategoryNav
        categories={menuData.categories}
        activeCategory={activeCategory}
        onCategoryClick={scrollToCategory}
      />

      <main className="container mx-auto px-4 pt-4">
        {menuData.categories.map((category) => (
          <section
            key={category.id}
            ref={(el) => {
              categoryRefs.current[category.id] = el
            }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-balance">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((item) => (
                <MenuItem key={item.id} item={item} onAddToCart={addToCart} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {totalItems > 0 && (
        <FloatingCart totalItems={totalItems} totalPrice={totalPrice} onClick={() => setIsCartOpen(true)} />
      )}

      <CartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />
    </div>
  )
}
