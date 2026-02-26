'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { type Product, productSchema } from '@/lib/schemas/product'

const AVAILABLE_BADGES = ['popular', 'new', 'sale'] as const

interface ProductSize {
  id: string
  label: string
  price: number
  stock: number
  dimensions: string
}

interface ProductFormProps {
  initialData?: Product
  onSubmit: (data: Product, imageFile?: File) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  template?: string
}

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  template = 'gastronomy',
}: ProductFormProps) {
  const t = useTranslations('Products.form')
  const tCommon = useTranslations('Common')

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null)
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)
  const [selectedBadges, setSelectedBadges] = useState<string[]>(
    (initialData?.metadata as any)?.badges || [],
  )
  const [sizes, setSizes] = useState<ProductSize[]>((initialData?.metadata as any)?.sizes || [])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      active: true,
      display_order: 0,
      price: 0,
      metadata: { badges: [], sizes: [] },
    },
  })

  const updateMetadata = (badges: string[], sizesData: ProductSize[]) => {
    setValue('metadata', { badges, sizes: sizesData })
  }

  const toggleBadge = (badge: string) => {
    const newBadges = selectedBadges.includes(badge)
      ? selectedBadges.filter((b) => b !== badge)
      : [...selectedBadges, badge]
    setSelectedBadges(newBadges)
    updateMetadata(newBadges, sizes)
  }

  const addSize = () => {
    const newSize: ProductSize = {
      id: `size-${Date.now()}`,
      label: '',
      price: 0,
      stock: 1,
      dimensions: '',
    }
    const newSizes = [...sizes, newSize]
    setSizes(newSizes)
    updateMetadata(selectedBadges, newSizes)
  }

  const removeSize = (index: number) => {
    const newSizes = sizes.filter((_, i) => i !== index)
    setSizes(newSizes)
    updateMetadata(selectedBadges, newSizes)
  }

  const updateSize = (index: number, field: keyof ProductSize, value: string | number) => {
    const newSizes = sizes.map((size, i) => (i === index ? { ...size, [field]: value } : size))
    setSizes(newSizes)
    updateMetadata(selectedBadges, newSizes)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onFormSubmit = async (data: Product) => {
    await onSubmit(data, imageFile)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {initialData ? t('edit') : t('new')}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-full p-2 hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <X className="h-5 w-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column: Image & Basic Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  {t('image')}
                </label>
                <div className="relative flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-accent-hover)] transition-colors overflow-hidden">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-[var(--color-text-muted)]" />
                      <p className="mb-2 text-sm text-[var(--color-text-secondary)]">
                        <span className="font-semibold">{t('upload')}</span>
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleImageChange}
                    data-testid="product-image-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                  {tCommon('name')}
                </label>
                <input
                  {...register('name')}
                  className="mt-1 block w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] px-3 py-2 shadow-sm focus:border-[var(--btn-primary-border)] focus:outline-none focus:ring-1 focus:ring-[var(--btn-primary-border)] sm:text-sm text-[var(--color-text-primary)]"
                  placeholder={t('namePlaceholder')}
                  data-testid="product-form-name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-[var(--color-error)]">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                  {t('categoryPlaceholder')}
                </label>
                <input
                  {...register('category')}
                  className="mt-1 block w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] px-3 py-2 shadow-sm focus:border-[var(--btn-primary-border)] focus:outline-none focus:ring-1 focus:ring-[var(--btn-primary-border)] sm:text-sm text-[var(--color-text-primary)]"
                  placeholder={t('categoryPlaceholder')}
                  data-testid="product-form-category"
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-[var(--color-error)]">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                  {t('description')}
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] px-3 py-2 shadow-sm focus:border-[var(--btn-primary-border)] focus:outline-none focus:ring-1 focus:ring-[var(--btn-primary-border)] sm:text-sm text-[var(--color-text-primary)]"
                  placeholder={t('descPlaceholder')}
                  data-testid="product-form-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                    {tCommon('price')}
                  </label>
                  <div className="relative mt-1 rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-[var(--color-text-secondary)] sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      {...register('price')}
                      className="block w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] pl-7 pr-3 py-2 focus:border-[var(--btn-primary-border)] focus:outline-none focus:ring-1 focus:ring-[var(--btn-primary-border)] sm:text-sm text-[var(--color-text-primary)]"
                      placeholder="0.00"
                      data-testid="product-form-price"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-[var(--color-error)]">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                    {t('stock')}
                  </label>
                  <input
                    type="number"
                    {...register('stock')}
                    className="mt-1 block w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] px-3 py-2 shadow-sm focus:border-[var(--btn-primary-border)] focus:outline-none focus:ring-1 focus:ring-[var(--btn-primary-border)] sm:text-sm text-[var(--color-text-primary)]"
                    placeholder="0"
                    data-testid="product-form-stock"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                  {t('displayOrder')}
                </label>
                <input
                  type="number"
                  {...register('display_order')}
                  className="mt-1 block w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] px-3 py-2 shadow-sm focus:border-[var(--btn-primary-border)] focus:outline-none focus:ring-1 focus:ring-[var(--btn-primary-border)] sm:text-sm text-[var(--color-text-primary)]"
                  placeholder="0"
                  data-testid="product-form-display-order"
                />
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {t('displayOrderHint')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('active')}
                  id="active"
                  className="h-4 w-4 rounded border-[var(--color-border-subtle)] text-[var(--btn-primary-bg)] focus:ring-[var(--btn-primary-border)]"
                  data-testid="product-active-checkbox"
                />
                <label
                  htmlFor="active"
                  className="text-sm font-medium text-[var(--color-text-primary)]"
                >
                  {t('activeLabel')}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  {t('badges')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_BADGES.map((badge) => (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => toggleBadge(badge)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedBadges.includes(badge)
                          ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                          : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-hover)]'
                      }`}
                      data-testid={`badge-${badge}`}
                    >
                      {t(`badge_${badge}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Size Variants - Only for Gallery template */}
          {template === 'gallery' && (
            <div className="border-t border-[var(--color-border-subtle)] pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                    {t('sizes')}
                  </label>
                  <p className="text-xs text-[var(--color-text-secondary)]">{t('sizesHint')}</p>
                </div>
                <button
                  type="button"
                  onClick={addSize}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border-2 border-[var(--btn-secondary-border)] rounded-lg hover:bg-[var(--btn-secondary-hover-bg)] transition-colors"
                  data-testid="add-size-btn"
                >
                  <Plus className="h-4 w-4" />
                  {t('addSize')}
                </button>
              </div>

              {sizes.length > 0 && (
                <div className="space-y-3">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider px-1">
                    <div className="col-span-2">{t('sizeLabel')}</div>
                    <div className="col-span-3">{t('sizeDimensions')}</div>
                    <div className="col-span-3">{tCommon('price')}</div>
                    <div className="col-span-2">{t('stock')}</div>
                    <div className="col-span-2"></div>
                  </div>

                  {/* Size rows */}
                  {sizes.map((size, index) => (
                    <div
                      key={size.id}
                      className="grid grid-cols-12 gap-2 items-center"
                      data-testid={`size-row-${index}`}
                    >
                      <input
                        type="text"
                        value={size.label}
                        onChange={(e) => updateSize(index, 'label', e.target.value)}
                        placeholder="Small"
                        className="col-span-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] px-2 py-1.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--btn-primary-border)] focus:outline-none focus:ring-1 focus:ring-[var(--btn-primary-border)]"
                        data-testid={`size-label-${index}`}
                      />
                      <input
                        type="text"
                        value={size.dimensions}
                        onChange={(e) => updateSize(index, 'dimensions', e.target.value)}
                        placeholder="30 × 40 cm"
                        className="col-span-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] px-2 py-1.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--btn-primary-border)] focus:outline-none focus:ring-1 focus:ring-[var(--btn-primary-border)]"
                        data-testid={`size-dimensions-${index}`}
                      />
                      <div className="col-span-3 relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          value={size.price}
                          onChange={(e) =>
                            updateSize(index, 'price', parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] pl-6 pr-2 py-1.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--btn-primary-border)] focus:outline-none focus:ring-1 focus:ring-[var(--btn-primary-border)]"
                          data-testid={`size-price-${index}`}
                        />
                      </div>
                      <input
                        type="number"
                        value={size.stock}
                        onChange={(e) =>
                          updateSize(index, 'stock', parseInt(e.target.value, 10) || 0)
                        }
                        placeholder="1"
                        className="col-span-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] px-2 py-1.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--btn-primary-border)] focus:outline-none focus:ring-1 focus:ring-[var(--btn-primary-border)]"
                        data-testid={`size-stock-${index}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="col-span-2 inline-flex items-center justify-center p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
                        data-testid={`size-remove-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {sizes.length === 0 && (
                <p className="text-sm text-[var(--color-text-secondary)] text-center py-4 border border-dashed border-[var(--color-border-subtle)] rounded-lg">
                  {t('noSizes')}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border-2 border-[var(--btn-secondary-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--btn-secondary-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-border)] focus:ring-offset-2 shadow-[var(--btn-secondary-shadow)]"
              data-testid="product-form-cancel-btn"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-2 border-[var(--btn-primary-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--btn-primary-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-border)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[var(--btn-primary-shadow)]"
              data-testid="product-form-submit"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? t('save') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
