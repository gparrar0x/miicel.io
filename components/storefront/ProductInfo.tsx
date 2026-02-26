/**
 * ProductInfo Component - Product Detail
 *
 * Features:
 * - Title (H1), artist link, price
 * - Description (16px+ mobile)
 * - Rating (future)
 * - Semantic HTML, WCAG AA
 *
 * Typography: 20px mobile, 28px desktop title
 */

interface ProductArtist {
  id: string
  name: string
  slug: string
}

interface ProductRating {
  average: number // 0-5
  count: number
}

interface ProductInfoProps {
  product: {
    id: string
    name: string
    artist?: ProductArtist
    price: number
    currency: string
    priceType: 'fixed' | 'from' // "From $45" if options, "$120" if fixed
    rating?: ProductRating
    description: string
  }
  'data-testid'?: string
}

export function ProductInfo({ product, 'data-testid': testId = 'product-info' }: ProductInfoProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price)
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.round(rating)
    return '⭐'.repeat(fullStars)
  }

  return (
    <header className="product-info" data-testid={testId}>
      {/* Title */}
      <h1 className="product-title" data-testid="product-title">
        {product.name}
      </h1>

      {/* Artist Link */}
      {product.artist && (
        <a
          href={`/artists/${product.artist.slug}`}
          className="product-artist"
          data-testid="product-artist-link"
        >
          by {product.artist.name}
        </a>
      )}

      {/* Rating (Future) */}
      {product.rating && (
        <div className="product-rating" data-testid="product-rating">
          <span className="stars" aria-label={`${product.rating.average} out of 5 stars`}>
            {renderStars(product.rating.average)}
          </span>
          <span className="count">({product.rating.count} reviews)</span>
        </div>
      )}

      {/* Price */}
      <div className="product-price" data-testid="product-price">
        {product.priceType === 'from' && <span className="price-prefix">From</span>}
        <span className="price-amount">{formatPrice(product.price, product.currency)}</span>
      </div>

      {/* Description */}
      <div className="product-description" data-testid="product-description">
        <p>{product.description}</p>
      </div>

      <style jsx>{`
        .product-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) var(--spacing-sm);
        }

        /* Title */
        .product-title {
          font-size: var(--font-size-h2);
          font-weight: var(--font-weight-bold);
          line-height: var(--line-height-tight);
          color: var(--color-text-primary);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (min-width: 1024px) {
          .product-title {
            font-size: 28px;
          }
        }

        /* Artist Link */
        .product-artist {
          font-size: var(--font-size-small);
          color: var(--color-accent-primary);
          text-decoration: underline;
          text-decoration-thickness: 1px;
          transition: color 200ms;
        }

        .product-artist:hover {
          color: var(--color-accent-hover);
        }

        /* Rating */
        .product-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: var(--font-size-small);
          color: var(--color-text-secondary);
        }

        .product-rating .stars {
          color: #f59e0b; /* Gold stars */
        }

        /* Price */
        .product-price {
          font-size: 24px;
          font-weight: var(--font-weight-bold);
          color: var(--color-accent-primary);
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .product-price .price-prefix {
          font-size: var(--font-size-body);
          font-weight: var(--font-weight-regular);
          color: var(--color-text-secondary);
        }

        @media (min-width: 1024px) {
          .product-price {
            font-size: 32px;
          }
        }

        /* Description */
        .product-description {
          font-size: var(--font-size-body);
          line-height: var(--line-height-relaxed);
          color: var(--color-text-primary);
        }

        .product-description p {
          margin: 0;
        }
      `}</style>
    </header>
  )
}
