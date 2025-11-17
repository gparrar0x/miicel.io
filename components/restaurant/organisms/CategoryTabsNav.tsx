/**
 * CategoryTabsNav - Horizontal scrolling category navigation
 *
 * Features:
 * - Horizontal scroll (overflow-x-auto, hide scrollbar)
 * - Sticky top-16 (below header)
 * - Scroll spy: auto-highlight active category on page scroll
 * - Smooth scroll to section on tab click
 *
 * Test ID: category-tabs-nav
 * Created: 2025-01-16 (SKY-42, Fase 4)
 */

'use client'

import { useState, useEffect } from 'react'
import { CategoryTab } from '../molecules/CategoryTab'

export interface Category {
  id: string
  slug: string
  name: string
  icon: string
  productCount?: number
}

interface CategoryTabsNavProps {
  categories: Category[]
  className?: string
}

export function CategoryTabsNav({ categories, className = '' }: CategoryTabsNavProps) {
  const [activeId, setActiveId] = useState(categories[0]?.id || '')

  // Scroll spy: detect visible category section
  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const categoryId = entry.target.id.replace('category-', '')
            setActiveId(categoryId)
          }
        })
      },
      {
        threshold: 0.5,
        rootMargin: '-100px 0px -50% 0px', // Trigger when near top of viewport
      }
    )

    // Observe all category sections
    categories.forEach((cat) => {
      const section = document.getElementById(`category-${cat.id}`)
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [categories])

  const handleTabClick = (categoryId: string) => {
    const section = document.getElementById(`category-${categoryId}`)
    if (section) {
      const headerOffset = 120 // Header (64px) + tabs (48px) + padding
      const elementPosition = section.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <nav
      data-testid="category-tabs-nav"
      className={`
        sticky top-16 z-40 bg-gray-50 border-b border-gray-200
        ${className}
      `}
    >
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-2 min-w-max">
          {categories.map((cat) => (
            <CategoryTab
              key={cat.id}
              id={cat.id}
              slug={cat.slug}
              name={cat.name}
              icon={cat.icon}
              isActive={activeId === cat.id}
              onClick={() => handleTabClick(cat.id)}
            />
          ))}
        </div>
      </div>
    </nav>
  )
}
