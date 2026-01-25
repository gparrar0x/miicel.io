/**
 * CategoryIcon - Wrapper for category icons (emoji/SVG)
 *
 * Displays icon for category tabs and section headers.
 * Falls back to generic icon if not provided.
 *
 * Test ID: category-icon-{category}
 * Created: 2025-01-16 (SKY-42, Fase 2)
 */

'use client'

interface CategoryIconProps {
  icon: string
  category?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'w-5 h-5 text-base',
  md: 'w-6 h-6 text-lg',
  lg: 'w-8 h-8 text-xl',
}

export function CategoryIcon({ icon, category, className = '', size = 'md' }: CategoryIconProps) {
  return (
    <span
      data-testid={category ? `category-icon-${category}` : 'category-icon'}
      className={`
        inline-flex items-center justify-center
        ${SIZE_CLASSES[size]}
        ${className}
      `}
      aria-hidden="true"
    >
      {icon}
    </span>
  )
}
