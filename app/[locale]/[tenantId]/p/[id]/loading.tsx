/**
 * Product detail loading skeleton — image + info block
 * Route: /[locale]/[tenantId]/p/[id]
 */
export default function ProductDetailLoading() {
  return (
    <main
      className="min-h-screen bg-[var(--color-bg-primary)]"
      data-testid="product-detail-loading-skeleton"
    >
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back link skeleton */}
        <div className="h-4 w-20 bg-[var(--color-bg-secondary)] rounded animate-pulse mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image skeleton */}
          <div
            className="aspect-square w-full bg-[var(--color-bg-secondary)] rounded animate-pulse"
            data-testid="product-detail-image-skeleton"
          />

          {/* Info block skeleton */}
          <div className="flex flex-col gap-4" data-testid="product-detail-info-skeleton">
            {/* Title */}
            <div className="h-8 w-3/4 bg-[var(--color-bg-secondary)] rounded animate-pulse" />
            {/* Subtitle / artist */}
            <div className="h-5 w-1/2 bg-[var(--color-bg-secondary)] rounded animate-pulse" />
            {/* Price */}
            <div className="h-7 w-28 bg-[var(--color-bg-secondary)] rounded animate-pulse mt-2" />
            {/* Description lines */}
            <div className="flex flex-col gap-2 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-[var(--color-bg-secondary)] rounded animate-pulse"
                  style={{ width: `${90 - i * 15}%` }}
                />
              ))}
            </div>
            {/* Size options */}
            <div className="flex gap-3 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-20 bg-[var(--color-bg-secondary)] rounded animate-pulse"
                />
              ))}
            </div>
            {/* CTA button */}
            <div className="h-12 w-full bg-[var(--color-bg-secondary)] rounded animate-pulse mt-4" />
          </div>
        </div>
      </div>
    </main>
  )
}
