'use client'

/**
 * ArtworkConsignmentHistory Component
 *
 * Timeline visualization of artwork movements between locations
 * Shows chronological history with dates and status changes
 */

import { MovementTimeline } from '@/lib/types/consignment'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin, Package, CheckCircle, RotateCcw } from 'lucide-react'

interface ArtworkConsignmentHistoryProps {
  movements: MovementTimeline[]
  compact?: boolean
}

const STATUS_ICONS = {
  in_gallery: MapPin,
  in_transit: Package,
  sold: CheckCircle,
  returned: RotateCcw,
  pending: Package,
}

export function ArtworkConsignmentHistory({
  movements,
  compact = false,
}: ArtworkConsignmentHistoryProps) {
  if (movements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No hay movimientos registrados para esta obra
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="consignment-history">
      {movements.map((movement, idx) => {
        const Icon = STATUS_ICONS[movement.status_after] || Package
        const isLatest = idx === 0

        return (
          <div
            key={movement.id}
            className="flex gap-3"
            data-testid={`timeline-event-${movement.id}`}
          >
            {/* Timeline Dot & Line */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-3 h-3 rounded-full border-2
                  ${
                    isLatest
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }
                `}
                data-testid={`timeline-dot-${idx}`}
              />
              {idx < movements.length - 1 && (
                <div className="w-0.5 h-12 bg-gray-200 mt-2" />
              )}
            </div>

            {/* Event Content */}
            <div className="pb-4 flex-1">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gray-600" />
                  <p className="font-medium text-gray-900">
                    {getMovementLabel(movement)}
                  </p>
                </div>
                <time className="text-xs text-gray-500">
                  {format(new Date(movement.moved_at), 'PPP', { locale: es })}
                </time>
              </div>

              {!compact && (
                <>
                  <p className="text-sm text-gray-600 ml-6">
                    {movement.from_location_name && (
                      <span>De: {movement.from_location_name} → </span>
                    )}
                    <span className="font-medium">{movement.to_location_name}</span>
                  </p>

                  {movement.notes && (
                    <p className="text-sm text-gray-600 ml-6 mt-2 italic">
                      "{movement.notes}"
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getMovementLabel(movement: MovementTimeline): string {
  switch (movement.status_after) {
    case 'sold':
      return 'Vendida'
    case 'returned':
      return 'Devuelta al artista'
    case 'in_transit':
      return 'En tránsito'
    case 'in_gallery':
      return movement.from_location_name ? 'Movida a galería' : 'Asignada a galería'
    case 'pending':
      return 'Pendiente de asignación'
    default:
      return 'Cambio de estado'
  }
}
