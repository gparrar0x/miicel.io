/**
 * ProductImageCarousel Component
 *
 * Swipeable image carousel with indicators and navigation.
 * Touch-friendly for mobile, arrow controls for desktop.
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductImageCarouselProps {
  images: string[]
  productName: string
  productId: string
}

export function ProductImageCarousel({
  images,
  productName,
  productId,
}: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div
        className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
        data-testid={`product-${productId}-image-carousel-empty`}
      >
        <span className="text-gray-400">No images</span>
      </div>
    )
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div
      className="relative space-y-4"
      data-testid={`product-${productId}-image-carousel`}
    >
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={images[currentIndex]}
          alt={`${productName} - vista ${currentIndex + 1} de ${images.length}`}
          fill
          className="object-cover"
          priority={currentIndex === 0}
          loading={currentIndex === 0 ? undefined : 'lazy'}
          quality={85}
          sizes="(max-width: 768px) 100vw, 50vw"
          data-testid={`product-${productId}-image-${currentIndex}`}
        />

        {/* Navigation Arrows - Show only if multiple images */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Previous image"
              data-testid={`product-${productId}-image-prev`}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={goToNext}
              aria-label="Next image"
              data-testid={`product-${productId}-image-next`}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Image Indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToIndex(index)}
              aria-label={`Go to image ${index + 1}`}
              data-testid={`product-${productId}-image-indicator-${index}`}
              className={`
                h-2 rounded-full transition-all
                ${
                  index === currentIndex
                    ? 'w-8 bg-tenant-primary'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }
              `}
            />
          ))}
        </div>
      )}
    </div>
  )
}
