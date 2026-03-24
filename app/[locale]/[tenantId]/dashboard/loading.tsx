/**
 * Dashboard loading skeleton — stat cards + table
 * Route: /[locale]/[tenantId]/dashboard
 */
export default function DashboardLoading() {
  return (
    <div
      className="min-h-screen bg-[var(--color-bg-primary)] p-6"
      data-testid="dashboard-loading-skeleton"
    >
      {/* Page title skeleton */}
      <div className="h-8 w-48 bg-[var(--color-bg-secondary)] rounded animate-pulse mb-8" />

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 border border-[var(--color-border-subtle)] rounded bg-[var(--color-bg-secondary)]"
            data-testid={`dashboard-stat-skeleton-${i}`}
          >
            <div className="h-4 w-24 bg-[var(--color-bg-primary)] rounded animate-pulse mb-3" />
            <div className="h-8 w-32 bg-[var(--color-bg-primary)] rounded animate-pulse mb-2" />
            <div className="h-3 w-20 bg-[var(--color-bg-primary)] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="border border-[var(--color-border-subtle)] rounded overflow-hidden">
        {/* Table header */}
        <div className="flex gap-4 px-5 py-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-subtle)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-24 bg-[var(--color-bg-primary)] rounded animate-pulse" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 px-5 py-4 border-b border-[var(--color-border-subtle)] last:border-0"
            data-testid={`dashboard-row-skeleton-${i}`}
          >
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="h-4 w-24 bg-[var(--color-bg-secondary)] rounded animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
