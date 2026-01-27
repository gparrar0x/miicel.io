'use client'

/**
 * LocationForm Component
 *
 * Form for creating/editing consignment locations
 * Uses Zod validation matching API schema
 */

import { useState } from 'react'
import { ConsignmentLocation, CreateLocationRequest } from '@/lib/types/consignment'
import { X, Loader2 } from 'lucide-react'

interface LocationFormProps {
  location?: ConsignmentLocation
  onSave: (data: CreateLocationRequest) => Promise<void>
  onCancel: () => void
  isOpen: boolean
}

export function LocationForm({ location, onSave, onCancel, isOpen }: LocationFormProps) {
  const [formData, setFormData] = useState<CreateLocationRequest>({
    name: location?.name || '',
    city: location?.city || '',
    country: location?.country || '',
    description: location?.description || '',
    address: location?.address || '',
    contact_name: location?.contact_name || '',
    contact_email: location?.contact_email || '',
    contact_phone: location?.contact_phone || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Clean empty strings to null for optional fields
      const cleanedData: CreateLocationRequest = {
        name: formData.name,
        city: formData.city,
        country: formData.country,
        description: formData.description || undefined,
        address: formData.address || undefined,
        contact_name: formData.contact_name || undefined,
        contact_email: formData.contact_email || undefined,
        contact_phone: formData.contact_phone || undefined,
      }
      await onSave(cleanedData)
      onCancel() // Close modal on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
      data-testid="location-form-modal"
    >
      <div className="bg-[var(--color-bg-primary)] w-full md:max-w-2xl rounded-t-lg md:rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {location ? 'Editar Ubicación' : 'Nueva Ubicación'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-[var(--color-bg-secondary)] rounded text-[var(--color-text-secondary)]"
            data-testid="close-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4" data-testid="location-form">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Nombre <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={255}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-border)]"
              placeholder="Ej: Galería Luna"
              data-testid="location-name-input"
            />
          </div>

          {/* City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Ciudad <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-border)]"
                placeholder="Ej: Buenos Aires"
                data-testid="location-city-input"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                País <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-border)]"
                placeholder="Ej: Argentina"
                data-testid="location-country-input"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Dirección
            </label>
            <input
              type="text"
              maxLength={500}
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-border)]"
              placeholder="Ej: Av. Corrientes 1234"
              data-testid="location-address-input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Descripción
            </label>
            <textarea
              maxLength={1000}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-border)] resize-none h-20"
              placeholder="Descripción opcional de la ubicación"
            />
          </div>

          {/* Contact Info */}
          <div className="pt-4 border-t border-[var(--color-border-subtle)]">
            <h3 className="font-medium text-[var(--color-text-primary)] mb-3">Información de Contacto</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Nombre de Contacto
                </label>
                <input
                  type="text"
                  maxLength={255}
                  value={formData.contact_name || ''}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-border)]"
                  placeholder="Ej: María González"
                  data-testid="location-contact-name-input"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    maxLength={255}
                    value={formData.contact_email || ''}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-border)]"
                    placeholder="contacto@galeria.com"
                    data-testid="location-contact-email-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    maxLength={50}
                    value={formData.contact_phone || ''}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-border)]"
                    placeholder="+54 11 1234-5678"
                    data-testid="location-contact-phone-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-lg text-[var(--color-error)] text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border-2 border-[var(--btn-secondary-border)] rounded-lg hover:bg-[var(--btn-secondary-hover-bg)] disabled:opacity-50 shadow-[var(--btn-secondary-shadow)]"
              data-testid="cancel-button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-2 border-[var(--btn-primary-border)] rounded-lg hover:bg-[var(--btn-primary-hover-bg)] disabled:opacity-50 flex items-center justify-center gap-2 shadow-[var(--btn-primary-shadow)]"
              data-testid="location-save-btn"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {location ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
