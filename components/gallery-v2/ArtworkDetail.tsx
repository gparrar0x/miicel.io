"use client"

import { useState } from "react"
import Image from "next/image"
import type { Artwork } from "./types"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/stores/cartStore"
import { Check, ChevronRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/shadcn-badge"

interface ArtworkDetailProps {
  artwork: Artwork
  relatedArtworks: Artwork[]
  tenantId: string
}

export function ArtworkDetail({ artwork, relatedArtworks, tenantId }: ArtworkDetailProps) {
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null)
  const { addItem, items } = useCartStore()
  const [isAdded, setIsAdded] = useState(false)

  const selectedSize = artwork.sizes.find((s) => s.id === selectedSizeId)

  // Check if this specific product (artwork.id) is in cart
  const isProductInCart = items.some((item) => item.productId === artwork.id)

  const handleAddToCart = () => {
    if (selectedSize && selectedSizeId && !isProductInCart) {
      // Validate stock before adding to cart
      if (selectedSize.stock === 0) {
        return // Don't add if out of stock
      }

      addItem({
        productId: artwork.id,
        name: artwork.title,
        price: selectedSize.price,
        currency: artwork.currency,
        quantity: 1,
        image: artwork.image,
        maxQuantity: 1, // Solo 1 pieza por producto
        color: undefined,
        size: {
          id: selectedSizeId,
          label: selectedSize.label,
          dimensions: selectedSize.dimensions
        }
      })
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
    }
  }

  return (
    <div className="animate-in fade-in duration-500 bg-white text-black">
      {/* Hero Image - Mobile First: Full width, immersive */}
      <div className="relative w-full aspect-[4/5] md:aspect-video md:h-[80vh] bg-gray-50">
        <Image
          src={artwork.image || "/placeholder.svg"}
          alt={artwork.title}
          fill
          className="object-contain md:object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 80vw"
        />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Header Info */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-lg text-black">{artwork.year}</p>
            {artwork.isLimitedEdition && (
              <Badge variant="secondary" className="font-normal bg-gray-100 text-black border-gray-200">
                Limited Edition
              </Badge>
            )}
          </div>
          {/* Description */}
          <div className="mb-10 prose prose-gray max-w-none mt-4">
            <p className="text-xl md:text-2xl leading-relaxed text-black font-sans">{artwork.description}</p>
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <Info className="h-4 w-4" />
              <span>{artwork.technique}</span>
            </div>
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-24 md:mb-12">
          <h3 className="text-xl font-medium mb-6">Select Size</h3>
          <div className="grid grid-cols-1 gap-4">
            {artwork.sizes.map((size) => {
              const isOutOfStock = size.stock === 0
              const isDisabled = isOutOfStock

              return (
                <button
                  key={size.id}
                  onClick={() => !isDisabled && setSelectedSizeId(size.id)}
                  disabled={isDisabled}
                  data-testid={`product-size-${size.id}`}
                  className={cn(
                    "relative flex items-center justify-between p-6 rounded-xl border transition-all duration-200 text-left min-h-[100px] bg-white group",
                    isDisabled && "opacity-50 cursor-not-allowed bg-gray-50",
                    !isDisabled && selectedSizeId === size.id
                      ? "border-black ring-1 ring-black shadow-md z-10"
                      : "border-gray-200 hover:border-gray-400 hover:shadow-sm",
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-xl text-black">{size.dimensions}</span>
                    <span className="text-base text-gray-500">{size.label}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-2xl text-black">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: artwork.currency }).format(size.price)}
                    </span>
                    {size.stock !== null && (
                      <span className={cn(
                        "text-sm font-medium",
                        isOutOfStock ? "text-red-600" : "text-amber-600"
                      )}>
                        {isOutOfStock ? "Sin stock" : `${size.stock} left`}
                      </span>
                    )}
                  </div>
                  {!isDisabled && selectedSizeId === size.id && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-black text-white rounded-full p-1.5 shadow-sm">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Related Works */}
        {relatedArtworks.length > 0 && (
          <div className="border-t border-gray-200 pt-12 mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-bold text-black">More from {artwork.collection}</h3>
              <Link href={`/${tenantId}`} className="text-sm font-medium text-black hover:underline flex items-center">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedArtworks.map((related) => (
                <Link key={related.id} href={`/${tenantId}/p/${related.id}`} className="group">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-2">
                    <Image
                      src={related.image || "/placeholder.svg"}
                      alt={related.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-medium text-sm truncate text-black">{related.title}</h4>
                  <p className="text-xs text-gray-500">From ${related.price}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t z-40 safe-area-bottom shadow-sm" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="container mx-auto max-w-4xl flex items-center justify-end gap-4">
          <div className="hidden md:block flex-1">
            {selectedSize ? (
              <div className="flex flex-col">
                <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{artwork.title}</span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {selectedSize.dimensions} — {new Intl.NumberFormat('en-US', { style: 'currency', currency: artwork.currency }).format(selectedSize.price)}
                </span>
              </div>
            ) : (
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {isProductInCart ? 'Completa tu compra' : 'Selecciona un tamaño'}
              </span>
            )}
          </div>
          {isProductInCart ? (
            <Link href={`/${tenantId}/cart`} className="w-full md:w-auto">
              <Button
                size="lg"
                className="w-full md:min-w-[200px] h-14 text-lg rounded-full shadow-lg transition-all font-medium text-white"
                style={{ backgroundColor: 'var(--color-accent-primary)' }}
              >
                Ir a Pagar
              </Button>
            </Link>
          ) : (
            <Button
              size="lg"
              className={cn(
                "w-full md:w-auto md:min-w-[200px] h-14 text-lg rounded-full shadow-lg transition-all font-medium",
                isAdded
                  ? "text-white"
                  : "text-white disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              style={{
                backgroundColor: isAdded ? 'var(--color-success)' : selectedSizeId && selectedSize?.stock !== 0 ? 'var(--color-accent-primary)' : 'var(--color-border-subtle)',
              }}
              disabled={!selectedSizeId || selectedSize?.stock === 0}
              onClick={handleAddToCart}
              data-testid="product-add-to-cart"
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.div
                    key="added"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-5 w-5" />
                    Agregado al Carrito
                  </motion.div>
                ) : (
                  <motion.div
                    key="add"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {selectedSize ? "Agregar al Carrito" : "Selecciona un Tamaño"}
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
