'use client'

/**
 * AssignArtworkModal Component
 *
 * Modal for assigning an artwork to a consignment location
 * Allows selecting location, status, and adding notes
 */

import { useState } from 'react'
import { ConsignmentStatus } from '@/lib/types/consignment'
import { X, Loader2 } from 'lucide-react'

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
      <div className="bg-white w-full md:max-w-md rounded-t-lg md:rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Asignar Obra</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            data-testid="close-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {/* Artwork Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {artworkImage && (
                <img
                  src={artworkImage}
                  alt={artworkTitle}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div>
                <p className="text-xs text-gray-600">Obra</p>
                <p className="font-medium">{artworkTitle}</p>
              </div>
            </div>
          </div>

          {/* Location Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación <span className="text-red-600">*</span>
            </label>
            <select
              required
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-600">*</span>
            </label>
            <select
              required
              value={status}
              onChange={(e) => setStatus(e.target.value as ConsignmentStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
              placeholder="Agregar notas sobre esta asignación..."
            />
            <p className="text-xs text-gray-500 mt-1">{notes.length}/1000</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              data-testid="cancel-button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
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
