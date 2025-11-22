"use client"

import { useState } from "react"
import type { Artwork } from "./types"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/shadcn-badge"

interface GalleryGridProps {
  artworks: Artwork[]
  collections: string[]
  tenantId: string
}

export function GalleryGrid({ artworks, collections, tenantId }: GalleryGridProps) {
  const [activeCollection, setActiveCollection] = useState("All Works")

  const filteredArtworks =
    activeCollection === "All Works" ? artworks : artworks.filter((a) => a.collection === activeCollection)

  return (
    <div className="space-y-8 bg-white text-black min-h-screen p-4">
      {/* Collection Tabs - Horizontal Scroll on Mobile */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur py-4 -mx-4 px-4 border-b border-gray-100 md:static md:bg-transparent md:border-none md:p-0 md:mx-0">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar md:flex-wrap md:justify-center">
          <button
            onClick={() => setActiveCollection("All Works")}
            className={cn(
              "whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all border",
              activeCollection === "All Works"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-500 border-transparent hover:bg-gray-100 hover:text-black",
            )}
          >
            All Works
          </button>
          {collections.map((collection) => (
            <button
              key={collection}
              onClick={() => setActiveCollection(collection)}
              className={cn(
                "whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all border",
                activeCollection === collection
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-500 border-transparent hover:bg-gray-100 hover:text-black",
              )}
            >
              {collection}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        <AnimatePresence mode="popLayout">
          {filteredArtworks.map((artwork) => (
            <motion.div
              layout
              key={artwork.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/${tenantId}/product/${artwork.id}`} className="group block space-y-4">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
                  <Image
                    src={artwork.image || "/placeholder.svg"}
                    alt={artwork.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {artwork.isLimitedEdition && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-white/80 backdrop-blur text-xs text-black border-none shadow-sm">
                        Limited
                      </Badge>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-xl font-medium text-black group-hover:text-gray-600 transition-colors">
                      {artwork.title}
                    </h3>
                    <span className="font-medium text-sm text-black">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: artwork.currency }).format(artwork.price)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{artwork.collection}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredArtworks.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400">No artworks found in this collection.</p>
        </div>
      )}
    </div>
  )
}
