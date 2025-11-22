"use client"

import Link from "next/link"
import { ShoppingBag, Menu } from "lucide-react"
import { useCartStore } from "@/lib/stores/cartStore"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CartSheet } from "./CartSheet"
import { useState, useEffect } from "react"
import { type TenantConfigResponse } from "@/lib/schemas/order"

interface GalleryHeaderProps {
  config: TenantConfigResponse
  tenantId: string
}

export function GalleryHeader({ config, tenantId }: GalleryHeaderProps) {
  const { getTotalItems } = useCartStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Hydration check
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const totalItems = mounted ? getTotalItems() : 0

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md text-black">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-black hover:bg-gray-100">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-white text-black border-r border-gray-200">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href={`/${tenantId}`} className="text-lg font-medium hover:text-gray-600" onClick={() => setIsMenuOpen(false)}>
                  Gallery
                </Link>
                {/* Placeholders for future pages */}
                <Link
                  href="#"
                  className="text-lg font-medium hover:text-gray-600 text-gray-400 cursor-not-allowed"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Collections
                </Link>
                <Link
                  href="#"
                  className="text-lg font-medium hover:text-gray-600 text-gray-400 cursor-not-allowed"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About the Artist
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href={`/${tenantId}`} className="text-xl font-serif font-bold tracking-tight uppercase">
            {config.businessName}
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href={`/${tenantId}`} className="text-sm font-medium hover:text-gray-600 transition-colors">
            Gallery
          </Link>
          <span className="text-sm font-medium text-gray-400 cursor-not-allowed">
            Collections
          </span>
          <span className="text-sm font-medium text-gray-400 cursor-not-allowed">
            About
          </span>
        </nav>

        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-12 w-12 text-black hover:bg-gray-100 hover:text-black" 
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingBag className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
              {totalItems}
            </span>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </div>
      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} tenantId={tenantId} />
    </header>
  )
}
