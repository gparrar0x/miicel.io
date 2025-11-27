/**
 * SKY-43: GalleryCard Component (Neo-Brutalist Editorial Variant)
 * 
 * Aesthetic: High-Fashion / Art Gallery / Brutalist
 * - Full bleed images
 * - Monospace technical details
 * - Serif display typography
 * - Magnetic hover effects
 * - "VIEW" custom cursor interaction
 */

'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Product } from '@/types/commerce'
import { motion } from 'framer-motion'

interface GalleryCardProps {
  product: Product
  onQuickView?: (productId: string) => void
  onWishlist?: (productId: string) => void
  loading?: boolean
  'data-testid'?: string
  index?: number // For staggered animation
}

export function GalleryCard({
  product,
  onQuickView,
  onWishlist,
  loading = false,
  'data-testid': testId = 'product-card-gallery',
  index = 0,
}: GalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Loading skeleton - Brutalist blocks
  if (loading) {
    return (
      <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-black/10">
          <div className="h-4 bg-black/10 w-2/3 mb-2" />
          <div className="h-3 bg-black/10 w-1/3" />
        </div>
      </div>
    )
  }

  const primaryImage = product.images[0] || '/placeholder-product.jpg'
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency,
  }).format(product.price)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <motion.article
      ref={cardRef}
      data-testid={testId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
      className="group relative w-full aspect-[3/4] bg-[var(--color-paper)] overflow-hidden cursor-none select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={() => onQuickView?.(product.id)}
    >
      {/* Image Layer */}
      <div className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
        <Image
          src={primaryImage}
          alt={`${product.name} - ${product.category || 'producto'}`}
          fill
          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
          loading="lazy"
          quality={85}
        />
        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none" />
      </div>

      {/* Custom Cursor Follower */}
      {isHovered && (
        <motion.div
          className="absolute z-20 pointer-events-none flex items-center justify-center bg-[var(--color-acid-green)] text-black font-mono text-xs font-bold px-3 py-1 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: cursorPos.x - 40, // Offset to center
            y: cursorPos.y - 20
          }}
          transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
        >
          VIEW
        </motion.div>
      )}

      {/* Info Overlay - Minimal & Technical */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
        
        {/* Top Tags */}
        <div className="flex justify-between items-start">
          <span className="bg-white/90 backdrop-blur text-black font-mono text-[10px] px-2 py-1 uppercase tracking-wider border border-black">
            {product.category || 'ART'}
          </span>
          {product.stock <= 5 && (
             <span className="bg-[var(--color-electric-blue)] text-white font-mono text-[10px] px-2 py-1 uppercase tracking-wider border border-black">
               LTD QTY
             </span>
          )}
        </div>

        {/* Bottom Info */}
        <div className="bg-white/95 backdrop-blur border border-black p-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-display font-bold text-lg leading-tight mb-1 text-black">
            {product.name}
          </h3>
          <div className="flex justify-between items-end border-t border-black/10 pt-2 mt-2">
            <span className="font-mono text-xs text-gray-500">
              ID: {product.id.slice(0, 4)}
            </span>
            <span className="font-mono font-bold text-lg text-black">
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Always Visible Title (if not hovered) */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent md:hidden">
         <h3 className="text-white font-display text-lg">{product.name}</h3>
         <p className="text-white/80 font-mono text-sm">{formattedPrice}</p>
      </div>
    </motion.article>
  )
}
