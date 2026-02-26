/**
 * ThemePreview - Live preview of theme changes
 *
 * Renders ProductGrid with sample products using current form values
 * Updates are debounced in parent component (300ms)
 *
 * Uses ThemeProvider to inject CSS vars from form data
 * Displays 4 sample products in selected template
 *
 * Test ID: theme-preview-container
 *
 * Created: 2025-11-16 (Issue #6, Task #3)
 */

'use client'

import { useMemo } from 'react'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import type { Product } from '@/types/commerce'
import { resolveTheme, type TenantTemplate } from '@/types/theme'

interface ThemePreviewProps {
  formData: {
    template: TenantTemplate
    gridCols: number
    imageAspect: string
    cardVariant: 'flat' | 'elevated' | 'outlined'
    spacing: 'compact' | 'normal' | 'relaxed'
    primaryColor: string
    accentColor: string
  }
}

// Sample products for preview
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'sample-1',
    name: 'Classic Denim Jacket',
    description: 'Timeless denim jacket with modern fit',
    price: 89.99,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
    colors: [
      { id: 'blue', name: 'Blue', hex: '#1E40AF' },
      { id: 'black', name: 'Black', hex: '#1F2937' },
    ],
    stock: 15,
    category: 'Outerwear',
  },
  {
    id: 'sample-2',
    name: 'Cotton T-Shirt',
    description: 'Premium organic cotton tee',
    price: 29.99,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    colors: [
      { id: 'white', name: 'White', hex: '#FFFFFF' },
      { id: 'gray', name: 'Gray', hex: '#6B7280' },
    ],
    stock: 42,
    category: 'Basics',
  },
  {
    id: 'sample-3',
    name: 'Running Sneakers',
    description: 'Lightweight performance sneakers',
    price: 129.99,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    colors: [{ id: 'red', name: 'Red', hex: '#EF4444' }],
    stock: 8,
    category: 'Footwear',
  },
  {
    id: 'sample-4',
    name: 'Leather Backpack',
    description: 'Handcrafted leather daypack',
    price: 159.99,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
    colors: [
      { id: 'brown', name: 'Brown', hex: '#92400E' },
      { id: 'tan', name: 'Tan', hex: '#D97706' },
    ],
    stock: 3,
    category: 'Accessories',
  },
]

export function ThemePreview({ formData }: ThemePreviewProps) {
  // Resolve theme from form data
  const resolvedTheme = useMemo(() => {
    return resolveTheme(
      formData.template,
      {
        gridCols: formData.gridCols,
        imageAspect: formData.imageAspect,
        cardVariant: formData.cardVariant,
        spacing: formData.spacing,
        colors: {
          primary: formData.primaryColor,
          accent: formData.accentColor,
        },
      },
      {}, // No config colors in preview
    )
  }, [formData])

  return (
    <div
      data-testid="theme-preview-container"
      className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50"
    >
      {/* Preview Label */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Live Preview
        </span>
        <span className="text-xs text-gray-400">
          Template: <span className="font-medium capitalize">{formData.template}</span>
        </span>
      </div>

      {/* Theme Provider Wrapper */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <ThemeProvider theme={resolvedTheme}>
          <div className="p-4">
            <ProductGrid
              template={formData.template}
              products={SAMPLE_PRODUCTS}
              loading={false}
              onProductClick={() => {
                // No-op in preview
              }}
            />
          </div>
        </ThemeProvider>
      </div>

      {/* Preview Info */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div>
          <span className="font-medium">Grid:</span> {formData.gridCols} cols
        </div>
        <div>
          <span className="font-medium">Aspect:</span> {formData.imageAspect}
        </div>
        <div>
          <span className="font-medium">Style:</span> {formData.cardVariant}
        </div>
        <div>
          <span className="font-medium">Spacing:</span> {formData.spacing}
        </div>
      </div>
    </div>
  )
}
