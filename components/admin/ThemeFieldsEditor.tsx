/**
 * ThemeFieldsEditor - Form inputs for theme customization
 *
 * Fields:
 * - Grid columns (1-6)
 * - Image aspect ratio (1:1, 4:3, 16:9, custom)
 * - Card variant (flat, elevated, outlined)
 * - Spacing (compact, normal, relaxed)
 * - Primary color (color picker)
 * - Accent color (color picker)
 *
 * All inputs have data-testid attributes
 *
 * Created: 2025-11-16 (Issue #6, Task #3)
 */

'use client'

import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form'

interface ThemeFormData {
  template: 'gallery' | 'detail' | 'minimal' | 'gastronomy'
  gridCols: number
  imageAspect: string
  cardVariant: 'flat' | 'elevated' | 'outlined'
  spacing: 'compact' | 'normal' | 'relaxed'
  primaryColor: string
  accentColor: string
}

interface ThemeFieldsEditorProps {
  register: UseFormRegister<ThemeFormData>
  watch: UseFormWatch<ThemeFormData>
  setValue: UseFormSetValue<ThemeFormData>
  errors: FieldErrors<ThemeFormData>
}

const IMAGE_ASPECT_PRESETS = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '4:3', label: 'Standard (4:3)' },
  { value: '16:9', label: 'Widescreen (16:9)' },
]

export function ThemeFieldsEditor({ register, watch, setValue, errors }: ThemeFieldsEditorProps) {
  const gridCols = watch('gridCols')
  const imageAspect = watch('imageAspect')
  const primaryColor = watch('primaryColor')
  const accentColor = watch('accentColor')

  return (
    <div className="space-y-6">
      {/* Grid Columns */}
      <div>
        <label htmlFor="gridCols" className="block text-sm font-medium text-gray-700 mb-2">
          Grid Columns
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            id="gridCols"
            min="1"
            max="6"
            {...register('gridCols', { valueAsNumber: true })}
            data-testid="theme-grid-cols-slider"
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span
            className="text-2xl font-bold text-gray-900 w-12 text-center"
            data-testid="theme-grid-cols-value"
          >
            {gridCols}
          </span>
        </div>
        {errors.gridCols && (
          <p className="mt-1 text-sm text-red-600">{errors.gridCols.message}</p>
        )}
      </div>

      {/* Image Aspect Ratio */}
      <div>
        <label htmlFor="imageAspect" className="block text-sm font-medium text-gray-700 mb-2">
          Image Aspect Ratio
        </label>
        <select
          id="imageAspect"
          {...register('imageAspect')}
          data-testid="theme-image-aspect-select"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {IMAGE_ASPECT_PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
        {errors.imageAspect && (
          <p className="mt-1 text-sm text-red-600">{errors.imageAspect.message}</p>
        )}
      </div>

      {/* Card Variant */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Style</label>
        <div className="grid grid-cols-3 gap-3">
          {(['flat', 'elevated', 'outlined'] as const).map((variant) => (
            <label
              key={variant}
              data-testid={`theme-card-variant-${variant}`}
              className={`
                relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer
                transition-all
                ${
                  watch('cardVariant') === variant
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="radio"
                value={variant}
                {...register('cardVariant')}
                className="sr-only"
              />
              <div
                className={`
                w-full h-12 rounded mb-2
                ${variant === 'flat' ? 'bg-gray-100' : ''}
                ${variant === 'elevated' ? 'bg-white shadow-md' : ''}
                ${variant === 'outlined' ? 'bg-white border-2 border-gray-300' : ''}
              `}
              />
              <span className="text-xs font-medium capitalize">{variant}</span>
            </label>
          ))}
        </div>
        {errors.cardVariant && (
          <p className="mt-1 text-sm text-red-600">{errors.cardVariant.message}</p>
        )}
      </div>

      {/* Spacing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Spacing Density</label>
        <div className="grid grid-cols-3 gap-3">
          {(['compact', 'normal', 'relaxed'] as const).map((spacingMode) => (
            <label
              key={spacingMode}
              data-testid={`theme-spacing-${spacingMode}`}
              className={`
                relative p-3 border-2 rounded-lg cursor-pointer text-center
                transition-all
                ${
                  watch('spacing') === spacingMode
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="radio"
                value={spacingMode}
                {...register('spacing')}
                className="sr-only"
              />
              <span className="text-sm font-medium capitalize">{spacingMode}</span>
            </label>
          ))}
        </div>
        {errors.spacing && <p className="mt-1 text-sm text-red-600">{errors.spacing.message}</p>}
      </div>

      {/* Primary Color */}
      <div>
        <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
          Primary Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            id="primaryColor"
            {...register('primaryColor')}
            data-testid="theme-primary-color-picker"
            className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => setValue('primaryColor', e.target.value)}
            data-testid="theme-primary-color-input"
            placeholder="#3B82F6"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {errors.primaryColor && (
          <p className="mt-1 text-sm text-red-600">{errors.primaryColor.message}</p>
        )}
      </div>

      {/* Accent Color */}
      <div>
        <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700 mb-2">
          Accent Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            id="accentColor"
            {...register('accentColor')}
            data-testid="theme-accent-color-picker"
            className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={accentColor}
            onChange={(e) => setValue('accentColor', e.target.value)}
            data-testid="theme-accent-color-input"
            placeholder="#F59E0B"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {errors.accentColor && (
          <p className="mt-1 text-sm text-red-600">{errors.accentColor.message}</p>
        )}
      </div>
    </div>
  )
}
