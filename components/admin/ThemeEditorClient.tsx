/**
 * ThemeEditorClient - Admin UI for customizing tenant theme
 *
 * Features:
 * - Template selector (gallery/detail/minimal)
 * - Theme override fields (colors, spacing, grid, card variant, image aspect)
 * - Live preview with debounced updates
 * - Save/Reset actions with toast feedback
 * - Form validation with Zod
 *
 * Auth: Rendered only for OWNER role (checked in parent page)
 * API: PATCH /api/tenants/[slug]/theme
 *
 * Test IDs: All inputs have data-testid attributes
 *
 * Created: 2025-11-16 (Issue #6, Task #3)
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { TenantTemplate, TEMPLATE_DEFAULTS } from '@/types/theme'
import { TemplateSelector } from './TemplateSelector'
import { ThemeFieldsEditor } from './ThemeFieldsEditor'
import { ThemePreview } from './ThemePreview'

// Form schema matching API updateThemeSchema
const themeFormSchema = z.object({
  template: z.enum(['gallery', 'detail', 'minimal', 'gastronomy']),
  gridCols: z.number().int().min(1).max(6),
  imageAspect: z.string().regex(/^\d+:\d+$/, 'Must be ratio format (e.g., 1:1, 16:9)'),
  cardVariant: z.enum(['flat', 'elevated', 'outlined']),
  spacing: z.enum(['compact', 'normal', 'relaxed']),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color'),
})

type ThemeFormData = z.infer<typeof themeFormSchema>

interface ThemeEditorClientProps {
  tenantSlug: string
  initialTheme: {
    template: TenantTemplate
    overrides: Record<string, any>
  }
}

export function ThemeEditorClient({ tenantSlug, initialTheme }: ThemeEditorClientProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [previewKey, setPreviewKey] = useState(0) // Force preview re-render

  // Initialize form with merged defaults + overrides
  const getDefaultValues = useCallback(
    (template: TenantTemplate, overrides: Record<string, any>): ThemeFormData => {
      const defaults = TEMPLATE_DEFAULTS[template]
      return {
        template,
        gridCols: overrides.gridCols ?? defaults.gridCols,
        imageAspect: overrides.imageAspect ?? defaults.imageAspect,
        cardVariant: overrides.cardVariant ?? defaults.cardVariant,
        spacing: overrides.spacing ?? defaults.spacing,
        primaryColor: overrides.colors?.primary ?? '#3B82F6',
        accentColor: overrides.colors?.accent ?? '#F59E0B',
      }
    },
    []
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ThemeFormData>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: getDefaultValues(initialTheme.template, initialTheme.overrides),
  })

  const currentTemplate = watch('template')
  const formData = watch()

  // Debounced preview update (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewKey((prev) => prev + 1)
    }, 300)

    return () => clearTimeout(timer)
  }, [formData])

  // Handle template change - reset overrides to new template defaults
  const handleTemplateChange = (template: TenantTemplate) => {
    const newDefaults = TEMPLATE_DEFAULTS[template]
    setValue('template', template)
    setValue('gridCols', newDefaults.gridCols)
    setValue('imageAspect', newDefaults.imageAspect)
    setValue('cardVariant', newDefaults.cardVariant)
    setValue('spacing', newDefaults.spacing)
    // Keep custom colors
  }

  // Save to API
  const onSubmit = async (data: ThemeFormData) => {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/tenants/${tenantSlug}/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: data.template,
          overrides: {
            gridCols: data.gridCols,
            imageAspect: data.imageAspect,
            cardVariant: data.cardVariant,
            spacing: data.spacing,
            colors: {
              primary: data.primaryColor,
              accent: data.accentColor,
            },
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save theme')
      }

      toast.success('Theme saved successfully!', {
        description: 'Your storefront has been updated.',
      })

      // Reset dirty state
      reset(data)
    } catch (error) {
      console.error('Error saving theme:', error)
      toast.error('Failed to save theme', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Reset to template defaults
  const handleReset = () => {
    const defaults = TEMPLATE_DEFAULTS[currentTemplate]
    reset({
      template: currentTemplate,
      gridCols: defaults.gridCols,
      imageAspect: defaults.imageAspect,
      cardVariant: defaults.cardVariant,
      spacing: defaults.spacing,
      primaryColor: '#3B82F6',
      accentColor: '#F59E0B',
    })
    toast.info('Theme reset to template defaults')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Editor */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Template Selector */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Choose Template</h2>
          <TemplateSelector
            selectedTemplate={currentTemplate}
            onTemplateChange={handleTemplateChange}
          />
        </section>

        {/* Theme Fields */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Customize Theme</h2>
          <ThemeFieldsEditor
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
        </section>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!isDirty || isSaving}
            data-testid="theme-save-button"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            data-testid="theme-reset-button"
            className="px-6 py-3 rounded-lg font-medium border border-gray-300
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </form>

      {/* Right Column: Preview */}
      <section className="bg-white rounded-lg shadow p-6 sticky top-8 self-start">
        <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
        <ThemePreview key={previewKey} formData={formData} />
      </section>
    </div>
  )
}
