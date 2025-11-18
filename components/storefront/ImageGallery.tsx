'use client'

/**
 * ImageGallery Component - Product Detail
 *
 * Features:
 * - Swipeable main image (mobile touch)
 * - Thumbnails strip 80x80px
 * - Tap to zoom modal (mobile)
 * - Click lightbox (desktop)
 * - LQIP blur-up placeholder
 * - WebP with JPEG fallback via Next Image
 *
 * Performance: Main eager, thumbs lazy, <60KB total
 */

import { useState } from 'react'
import Image from 'next/image'

interface ImageData {
  id: string
  url: string
  alt: string
  lqip?: string
  width: number
  height: number
}

interface ImageGalleryProps {
  images: ImageData[]
  productName: string
  artistName?: string
  'data-testid'?: string
}

export function ImageGallery({
  images,
  productName,
  artistName,
  'data-testid': testId = 'image-gallery',
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const currentImage = images[currentIndex] || images[0]
  const altText = artistName
    ? `${productName} by ${artistName}`
    : productName

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index)
  }

  const handleZoomOpen = () => {
    setIsZoomed(true)
  }

  const handleZoomClose = () => {
    setIsZoomed(false)
  }

  // Touch swipe handlers for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNext()
    }
    if (isRightSwipe) {
      handlePrevious()
    }
  }

  return (
    <div className="image-gallery" data-testid={testId}>
      {/* Main Image */}
      <figure
        className="gallery-main"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="image-container"
          onClick={handleZoomOpen}
          data-testid="gallery-main"
        >
          <Image
            src={currentImage.url}
            alt={altText}
            width={800}
            height={800}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 60vw"
            quality={85}
            placeholder={currentImage.lqip ? 'blur' : 'empty'}
            blurDataURL={currentImage.lqip}
            priority
            className="main-image"
          />
        </div>

        {/* Swipe Dots (mobile only, show if multiple images) */}
        {images.length > 1 && (
          <div className="swipe-dots" data-testid="gallery-dots">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={idx === currentIndex ? 'active' : ''}
                aria-label={`View image ${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        )}
      </figure>

      {/* Thumbnails (show if multiple images) */}
      {images.length > 1 && (
        <div className="gallery-thumbnails" data-testid="gallery-thumbnails">
          {images.map((img, idx) => (
            <button
              key={img.id}
              className={`thumbnail ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(idx)}
              aria-label={`View image ${idx + 1}`}
              data-testid={`gallery-thumbnail-${idx}`}
            >
              <Image
                src={img.url}
                alt=""
                width={80}
                height={80}
                quality={75}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <dialog
          className="zoom-modal"
          open
          onClick={handleZoomClose}
          data-testid="gallery-zoom"
        >
          <div className="modal-content">
            <Image
              src={currentImage.url}
              alt={altText}
              fill
              style={{ objectFit: 'contain' }}
              quality={90}
            />
            <button
              className="close-btn"
              onClick={handleZoomClose}
              aria-label="Close zoom"
            >
              ×
            </button>
          </div>
        </dialog>
      )}

      <style jsx>{`
        .image-gallery {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        /* Main image */
        .gallery-main {
          position: relative;
          margin: 0;
        }

        .image-container {
          position: relative;
          aspect-ratio: 1 / 1;
          width: 100%;
          overflow: hidden;
          cursor: zoom-in;
          border-radius: 8px;
          background: var(--color-bg-secondary);
        }

        .main-image {
          object-fit: cover;
          width: 100%;
          height: 100%;
          transition: transform 500ms var(--ease-out);
        }

        @media (min-width: 1024px) {
          .image-container:hover .main-image {
            transform: scale(1.05);
          }
        }

        /* Swipe dots */
        .swipe-dots {
          position: absolute;
          bottom: var(--spacing-sm);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }

        .swipe-dots button {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-text-muted);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 200ms;
        }

        .swipe-dots button.active {
          background: var(--color-accent-primary);
        }

        /* Hide dots on desktop */
        @media (min-width: 1024px) {
          .swipe-dots {
            display: none;
          }
        }

        /* Thumbnails */
        .gallery-thumbnails {
          display: flex;
          gap: var(--spacing-sm);
          overflow-x: auto;
          scrollbar-width: none;
        }

        .gallery-thumbnails::-webkit-scrollbar {
          display: none;
        }

        .thumbnail {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border: 2px solid transparent;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          background: var(--color-bg-secondary);
          padding: 0;
          transition: border-color 200ms;
        }

        .thumbnail:hover {
          border-color: var(--color-border-subtle);
        }

        .thumbnail.active {
          border-color: var(--color-accent-primary);
        }

        .thumbnail img {
          object-fit: cover;
          width: 100%;
          height: 100%;
        }

        /* Zoom modal */
        .zoom-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.9);
          border: none;
          padding: 0;
          margin: 0;
          display: grid;
          place-items: center;
          animation: fade-in 200ms var(--ease-out);
        }

        .modal-content {
          position: relative;
          width: 90vw;
          height: 90vh;
        }

        .close-btn {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          width: 48px;
          height: 48px;
          font-size: 32px;
          color: white;
          background: rgba(0, 0, 0, 0.5);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: grid;
          place-items: center;
          line-height: 1;
          transition: background 200ms;
        }

        .close-btn:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
