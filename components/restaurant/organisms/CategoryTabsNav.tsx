'use client'

import { cn } from '@/lib/utils'

export interface Category {
  id: string
  name: string
  icon: string
  slug?: string // Backwards compatibility
}

interface CategoryTabsNavProps {
  categories: Category[]
  activeCategory: string
  onCategoryClick: (categoryId: string) => void
  className?: string
}

export function CategoryTabsNav({
  categories,
  activeCategory,
  onCategoryClick,
  className,
}: CategoryTabsNavProps) {
  return (
    <nav
      className={cn(
        'sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-orange-100 shadow-sm',
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300',
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                  : 'bg-orange-50 text-orange-900 hover:bg-orange-100',
              )}
            >
              <span className="text-xl">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
