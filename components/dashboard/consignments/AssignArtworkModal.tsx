'use client'

/**
 * AssignArtworkModal Component
 *
 * Modal for assigning an artwork to a consignment location
 * Allows selecting location, status, and adding notes
 */

import { Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { ConsignmentStatus } from '@/lib/types/consignment'

interface Location {
  id: string
  name: string
  city: string
}

interface AssignArtworkModalProps {
  isOpen: boolean
  artworkId: number
  artworkTitle: string
  artworkImage?: string
  locations: Location[]
  currentLocationId?: string
  onSave: (locationId: string, status: ConsignmentStatus, notes?: string) => Promise<void>
  onClose: () => void
}

const STATUS_OPTIONS = [
  { value: ConsignmentStatus.IN_GALLERY, label: 'En Galería' },
  { value: ConsignmentStatus.IN_TRANSIT, label: 'En Tránsito' },
  { value: ConsignmentStatus.PENDING, label: 'Pendiente' },
]

export function AssignArtworkModal({
  isOpen,
  artworkId,
  artworkTitle,
  artworkImage,
  locations,
  currentLocationId,
  onSave,
  onClose,
}: AssignArtworkModalProps) {
  const [selectedLocationId, setSelectedLocationId] = useState(currentLocationId || '')
  const [status, setStatus] = useState<ConsignmentStatus>(ConsignmentStatus.IN_GALLERY)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedLocationId) {
      setError('Debes seleccionar una ubicación')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSave(selectedLocationId, status, notes || undefined)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar obra')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
      data-testid="assign-artwork-modal"
    >
      <div className="bg-[var(--color-bg-primary)] w-full md:max-w-md rounded-t-lg md:rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Asignar Obra</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--color-bg-secondary)] rounded text-[var(--color-text-secondary)]"
            data-testid="close-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {/* Artwork Info */}
          <div className="p-3 bg-[var(--color-bg-secondary)] rounded-lg">
            <div className="flex items-center gap-3">
              {artworkImage && (
                <img
                  src={artworkImage}
                  alt={artworkTitle}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Obra</p>
                <p className="font-medium text-[var(--color-text-primary)]">{artworkTitle}</p>
              </div>
            </div>
          </div>

          {/* Location Select */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Ubicación <span className="text-[var(--color-error)]">*</span>
            </label>
            <select
              required
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
              data-testid="artwork-select"
            >
              <option value="">Seleccionar ubicación...</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.city})
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Estado <span className="text-[var(--color-error)]">*</span>
            </label>
            <select
              required
              value={status}
              onChange={(e) => setStatus(e.target.value as ConsignmentStatus)}
              className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
              data-testid="status-select"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] resize-none h-20"
              placeholder="Agregar notas sobre esta asignación..."
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{notes.length}/1000</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
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
              data-testid="confirm-assign-btn"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Asignar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
