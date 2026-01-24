'use client'

/**
 * LocationCard Component
 *
 * Displays a single consignment location with metrics
 * Mobile-first responsive card with action buttons
 */

import { ConsignmentLocation } from '@/lib/types/consignment'
import { MapPin, Pencil, Trash2, ChevronRight } from 'lucide-react'

interface LocationWithMetrics extends ConsignmentLocation {
  worksCount?: number
  totalRevenue?: number
  conversionRate?: number
}

interface LocationCardProps {
  location: LocationWithMetrics
  onEdit: (location: ConsignmentLocation) => void
  onDelete: (locationId: string) => void
  onView: (locationId: string) => void
}

export function LocationCard({ location, onEdit, onDelete, onView }: LocationCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (
      confirm(
        `¿Eliminar "${location.name}"?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      onDelete(location.id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(location)
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(location.id)}
      data-testid={`location-card-${location.id}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{location.name}</h3>
          <p className="text-sm text-gray-600">
            {location.city}, {location.country}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0 ml-2">
          <button
            onClick={handleEdit}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            data-testid={`edit-location-${location.id}`}
            aria-label="Edit location"
          >
            <Pencil className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 rounded transition-colors"
            data-testid={`delete-location-${location.id}`}
            aria-label="Delete location"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 text-sm mb-3">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{location.worksCount || 0} obras</span>
        </div>
        {location.conversionRate !== undefined && (
          <div className="flex items-center gap-1">
            <span className="font-medium text-green-600">
              {location.conversionRate.toFixed(0)}% vendidas
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      {location.totalRevenue !== undefined && (
        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-600">Total ventas</span>
          <span className="font-semibold text-gray-900">
            ${location.totalRevenue.toLocaleString()}
          </span>
        </div>
      )}

      {/* View Details Arrow */}
      <div className="mt-3 flex items-center justify-end text-sm text-gray-600 hover:text-gray-900">
        <span>Ver detalles</span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </div>
    </div>
  )
}
