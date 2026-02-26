/**
 * SKY-43: FilterBar Component
 * Sticky filter/sort bar for gallery template
 *
 * Usage:
 * ```tsx
 * <FilterBar
 *   sortBy="featured"
 *   onSortChange={(value) => setSortBy(value)}
 *   filterCount={2}
 *   onFilterClick={() => setFilterDrawerOpen(true)}
 * />
 * ```
 *
 * Features:
 * - Sticky below header (64px offset)
 * - Sort dropdown: Featured, New, Price, Popular
 * - Filter toggle button (mobile drawer, desktop sidebar)
 * - Badge count for active filters
 * - 56px height mobile
 *
 * Test ID: filter-bar
 * Created: 2025-01-17 (SKY-43 Phase 1)
 */

'use client'

interface FilterBarProps {
  sortBy?: string
  onSortChange?: (value: string) => void
  filterCount?: number
  onFilterClick?: () => void
  'data-testid'?: string
}

export function FilterBar({
  sortBy = 'featured',
  onSortChange,
  filterCount = 0,
  onFilterClick,
  'data-testid': testId = 'filter-bar',
}: FilterBarProps) {
  return (
    <div
      data-testid={testId}
      className="sticky top-16 md:top-18 z-30 bg-[var(--color-bg-secondary)]
                 border-b border-[var(--color-border-subtle)]"
    >
      <div
        className="h-14 px-[var(--spacing-sm)] max-w-[1200px] mx-auto
                      flex items-center justify-between gap-4"
      >
        {/* Filter Toggle (Mobile + Desktop) */}
        {onFilterClick && (
          <button
            onClick={onFilterClick}
            className="relative flex items-center gap-2 px-4 h-10
                       bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]
                       rounded cursor-pointer transition-all duration-[var(--timing-normal)]
                       hover:border-[var(--color-accent-primary)]
                       active:scale-[0.98]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span
              className="text-[var(--font-size-small)] font-[var(--font-weight-medium)]
                             text-[var(--color-text-primary)]"
            >
              Filter
            </span>

            {/* Badge count */}
            {filterCount > 0 && (
              <span
                className="min-w-[20px] h-5 px-1.5
                           bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)]
                           text-[11px] font-[var(--font-weight-bold)]
                           rounded-full flex items-center justify-center"
              >
                {filterCount}
              </span>
            )}
          </button>
        )}

        {/* Sort Dropdown */}
        {onSortChange && (
          <div className="flex items-center gap-2 ml-auto">
            <label
              htmlFor="sort-select"
              className="text-[var(--font-size-small)] text-[var(--color-text-secondary)]
                         hidden sm:block"
            >
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-4 h-10 bg-[var(--color-bg-primary)]
                         border border-[var(--color-border-subtle)] rounded
                         text-[var(--font-size-small)] font-[var(--font-weight-medium)]
                         text-[var(--color-text-primary)] cursor-pointer
                         transition-all duration-[var(--timing-normal)]
                         hover:border-[var(--color-accent-primary)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
            >
              <option value="featured">Featured</option>
              <option value="new">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
