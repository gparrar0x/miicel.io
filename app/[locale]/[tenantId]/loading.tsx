/**
 * Storefront loading skeleton — product grid
 * Route: /[locale]/[tenantId]
 */
export default function StorefrontLoading() {
  return (
    <main
      className="min-h-screen bg-[var(--color-bg-primary)]"
      data-testid="storefront-loading-skeleton"
    >
      {/* Header skeleton */}
      <div className="w-full border-b border-[var(--color-border-subtle)] px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="h-8 w-40 bg-[var(--color-bg-secondary)] rounded animate-pulse" />
          <div className="h-6 w-24 bg-[var(--color-bg-secondary)] rounded animate-pulse" />
        </div>
      </div>

      {/* Category filter skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-5 w-16 bg-[var(--color-bg-secondary)] rounded animate-pulse"
            />
          ))}
        </div>

        {/* Product grid skeleton — 3 cols desktop / 2 tablet / 1 mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3"
              data-testid={`storefront-product-skeleton-${i}`}
            >
              <div className="aspect-square w-full bg-[var(--color-bg-secondary)] rounded animate-pulse" />
              <div className="h-5 w-3/4 bg-[var(--color-bg-secondary)] rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-[var(--color-bg-secondary)] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
