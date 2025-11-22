"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Artwork } from "@/lib/data"

interface CartItem extends Artwork {
  selectedSize: {
    id: string
    dimensions: string
    price: number
    label: string
  }
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (artwork: Artwork, sizeId: string) => void
  removeItem: (artworkId: string, sizeId: string) => void
  updateQuantity: (artworkId: string, sizeId: string, delta: number) => void
  totalItems: number
  totalPrice: number
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const savedCart = localStorage.getItem("gallery-cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error("Failed to parse cart", e)
      }
    }
  }, [])

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("gallery-cart", JSON.stringify(items))
    }
  }, [items, isMounted])

  const addItem = (artwork: Artwork, sizeId: string) => {
    setItems((prev) => {
      const size = artwork.sizes.find((s) => s.id === sizeId)
      if (!size) return prev

      const existingItem = prev.find((item) => item.id === artwork.id && item.selectedSize.id === sizeId)

      if (existingItem) {
        return prev.map((item) =>
          item.id === artwork.id && item.selectedSize.id === sizeId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [
        ...prev,
        {
          ...artwork,
          selectedSize: {
            id: size.id,
            dimensions: size.dimensions,
            price: size.price,
            label: size.label,
          },
          quantity: 1,
        },
      ]
    })
    setIsOpen(true)
  }

  const removeItem = (artworkId: string, sizeId: string) => {
    setItems((prev) => prev.filter((item) => !(item.id === artworkId && item.selectedSize.id === sizeId)))
  }

  const updateQuantity = (artworkId: string, sizeId: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === artworkId && item.selectedSize.id === sizeId) {
          const newQuantity = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQuantity }
        }
        return item
      }),
    )
  }

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const totalPrice = items.reduce((acc, item) => acc + item.selectedSize.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
