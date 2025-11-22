"use client"

import Link from "next/link"
import { ShoppingBag, Menu } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CartSheet } from "@/components/cart-sheet"
import { useState } from "react"

export function Header() {
  const { totalItems, setIsOpen } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  Gallery
                </Link>
                <Link
                  href="/collections"
                  className="text-lg font-medium hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Collections
                </Link>
                <Link
                  href="/about"
                  className="text-lg font-medium hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About the Artist
                </Link>
                <Link
                  href="/contact"
                  className="text-lg font-medium hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="text-xl font-serif font-bold tracking-tight">
            ELENA VOSTOKOVA
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary/80 transition-colors">
            Gallery
          </Link>
          <Link href="/collections" className="text-sm font-medium hover:text-primary/80 transition-colors">
            Collections
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary/80 transition-colors">
            About
          </Link>
        </nav>

        <Button variant="ghost" size="icon" className="relative h-12 w-12" onClick={() => setIsOpen(true)}>
          <ShoppingBag className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {totalItems}
            </span>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </div>
      <CartSheet />
    </header>
  )
}
