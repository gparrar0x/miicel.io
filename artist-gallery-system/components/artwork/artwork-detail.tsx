"use client"

import { useState } from "react"
import Image from "next/image"
import type { Artwork } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { Check, ChevronRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface ArtworkDetailProps {
  artwork: Artwork
  relatedArtworks: Artwork[]
}

export function ArtworkDetail({ artwork, relatedArtworks }: ArtworkDetailProps) {
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null)
  const { addItem } = useCart()
  const [isAdded, setIsAdded] = useState(false)

  const selectedSize = artwork.sizes.find((s) => s.id === selectedSizeId)

  const handleAddToCart = () => {
    if (selectedSize && selectedSizeId) {
      // Validate stock before adding to cart
      if (selectedSize.stock === 0) {
        return // Don't add if out of stock
      }
      
      addItem(artwork, selectedSizeId)
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Image - Mobile First: Full width, immersive */}
      <div className="relative w-full aspect-[4/5] md:aspect-video md:h-[80vh] bg-muted/20">
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
            <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">{artwork.artist}</p>
            {artwork.isLimitedEdition && (
              <Badge variant="secondary" className="font-normal">
                Limited Edition
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground leading-tight">{artwork.title}</h1>
          <p className="text-lg text-muted-foreground">{artwork.year}</p>
        </div>

        {/* Description */}
        <div className="mb-10 prose prose-gray max-w-none">
          <p className="text-lg leading-relaxed text-foreground/90">{artwork.description}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>{artwork.technique}</span>
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-24 md:mb-12">
          <h3 className="text-lg font-medium mb-4">Select Size</h3>
          <div className="grid grid-cols-1 gap-3">
            {artwork.sizes.map((size) => {
              const isOutOfStock = size.stock === 0
              const isDisabled = isOutOfStock
              
              return (
              <button
                key={size.id}
                  onClick={() => !isDisabled && setSelectedSizeId(size.id)}
                  disabled={isDisabled}
                className={cn(
                  "relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left min-h-[80px]",
                    isDisabled && "opacity-50 cursor-not-allowed bg-muted/50",
                    !isDisabled && selectedSizeId === size.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/50 bg-card",
                )}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-lg">{size.dimensions}</span>
                  <span className="text-sm text-muted-foreground">{size.label}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-xl">${size.price.toLocaleString()}</span>
                    {size.stock !== null && (
                      <span className={cn(
                        "text-xs font-medium",
                        isOutOfStock ? "text-red-600" : "text-amber-600"
                      )}>
                        {isOutOfStock ? "Sin stock" : `${size.stock} left`}
                      </span>
                    )}
                </div>
                  {!isDisabled && selectedSizeId === size.id && (
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </button>
              )
            })}
          </div>
        </div>

        {/* Related Works */}
        {relatedArtworks.length > 0 && (
          <div className="border-t pt-12 mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-bold">More from {artwork.collection}</h3>
              <Link href="/collections" className="text-sm font-medium text-primary hover:underline flex items-center">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedArtworks.map((related) => (
                <Link key={related.id} href={`/artwork/${related.id}`} className="group">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-muted mb-2">
                    <Image
                      src={related.image || "/placeholder.svg"}
                      alt={related.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-medium text-sm truncate">{related.title}</h4>
                  <p className="text-xs text-muted-foreground">From ${related.price}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t z-40 safe-area-bottom">
        <div className="container mx-auto max-w-4xl flex items-center gap-4">
          <div className="hidden md:block flex-1">
            {selectedSize ? (
              <div className="flex flex-col">
                <span className="font-medium">{artwork.title}</span>
                <span className="text-sm text-muted-foreground">
                  {selectedSize.dimensions} — ${selectedSize.price.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select a size to purchase</span>
            )}
          </div>
          <Button
            size="lg"
            className={cn(
              "w-full md:w-auto md:min-w-[200px] h-14 text-lg rounded-full shadow-lg transition-all",
              isAdded ? "bg-green-600 hover:bg-green-700" : "",
            )}
            disabled={!selectedSizeId || selectedSize?.stock === 0}
            onClick={handleAddToCart}
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
                  Added to Cart
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {selectedSize ? `Add to Cart - $${selectedSize.price}` : "Select Size"}
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  )
}
