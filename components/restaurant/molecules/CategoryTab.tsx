/**
 * CategoryTab - Individual tab button for category navigation
 *
 * States:
 * - Default: transparent bg, gray text
 * - Active: primary bg subtle, primary text, 3px bottom border
 * - Hover: light gray bg
 *
 * Test ID: category-tab-{slug}
 * Created: 2025-01-16 (SKY-42, Fase 3)
 */

'use client'

import { CategoryIcon } from '../atoms/CategoryIcon'

interface CategoryTabProps {
  id: string
  slug: string
  name: string
  icon: string
  isActive: boolean
  onClick: () => void
}

export function CategoryTab({ id, slug, name, icon, isActive, onClick }: CategoryTabProps) {
  return (
    <button
      data-testid={`category-tab-${slug}`}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        border-b-3 transition-all duration-200 whitespace-nowrap
        ${isActive
          ? 'border-b-3 font-bold'
          : 'border-b-3 border-transparent hover:bg-gray-100'
        }
      `}
      style={
        isActive
          ? {
              backgroundColor: 'var(--color-primary-subtle, rgba(230, 57, 70, 0.1))',
              color: 'var(--color-primary, #E63946)',
              borderBottomColor: 'var(--color-primary, #E63946)',
            }
          : {
              color: 'var(--color-text-secondary, #6B7280)',
            }
      }
      aria-current={isActive ? 'page' : undefined}
    >
      <CategoryIcon icon={icon} category={slug} size="sm" />
      <span className="text-sm font-medium">{name}</span>
    </button>
  )
}
