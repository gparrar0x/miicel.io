/**
 * TemplateSelector - Radio card selector for choosing storefront template
 *
 * Displays 3 template options (gallery/detail/minimal) with:
 * - Visual preview thumbnail
 * - Template name & description
 * - Radio button selection
 *
 * Test ID: template-selector-{template}
 *
 * Created: 2025-11-16 (Issue #6, Task #3)
 */

'use client'

import type { TenantTemplate } from '@/types/theme'

interface TemplateSelectorProps {
  selectedTemplate: TenantTemplate
  onTemplateChange: (template: TenantTemplate) => void
}

const TEMPLATES: Array<{
  id: TenantTemplate
  name: string
  description: string
  icon: string
}> = [
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Large images with hover zoom. Perfect for visual-first brands.',
    icon: '🖼️',
  },
  {
    id: 'detail',
    name: 'Detail',
    description: 'Rich product information with wide images. Ideal for detailed descriptions.',
    icon: '📋',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, compact grid. Best for large catalogs with many products.',
    icon: '🎯',
  },
  {
    id: 'gastronomy',
    name: 'Gastronomy',
    description: 'Digital menu optimized for food. Category tabs, promo badges, mobile-first.',
    icon: '🍔',
  },
]

export function TemplateSelector({ selectedTemplate, onTemplateChange }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {TEMPLATES.map((template) => {
        const isSelected = selectedTemplate === template.id

        return (
          <label
            key={template.id}
            data-testid={`template-selector-${template.id}`}
            className={`
              relative flex items-start p-4 border-2 rounded-lg cursor-pointer
              transition-all duration-200
              ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <input
              type="radio"
              name="template"
              value={template.id}
              checked={isSelected}
              onChange={() => onTemplateChange(template.id)}
              className="sr-only"
              data-testid={`template-radio-${template.id}`}
            />

            {/* Icon/Preview */}
            <div
              className={`
              flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl
              ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
            `}
            >
              {template.icon}
            </div>

            {/* Content */}
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">{template.name}</h3>
                {isSelected && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600">{template.description}</p>

              {/* Template Defaults Info */}
              {isSelected && (
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span>
                    Grid:{' '}
                    {template.id === 'gallery'
                      ? '3'
                      : template.id === 'detail'
                        ? '2'
                        : template.id === 'gastronomy'
                          ? '2'
                          : '4'}{' '}
                    cols
                  </span>
                  <span>
                    Aspect:{' '}
                    {template.id === 'gallery'
                      ? '1:1'
                      : template.id === 'detail' || template.id === 'gastronomy'
                        ? '16:9'
                        : '4:3'}
                  </span>
                  <span>
                    Style:{' '}
                    {template.id === 'gallery'
                      ? 'Elevated'
                      : template.id === 'detail' || template.id === 'gastronomy'
                        ? 'Outlined'
                        : 'Flat'}
                  </span>
                </div>
              )}
            </div>
          </label>
        )
      })}
    </div>
  )
}
