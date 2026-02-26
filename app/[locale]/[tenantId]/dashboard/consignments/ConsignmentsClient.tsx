'use client'

/**
 * ConsignmentsClient Component
 *
 * Main consignments dashboard with overview stats and locations list
 * Handles client-side interactivity
 */

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConsignmentOverview } from '@/components/dashboard/consignments/ConsignmentOverview'
import { LocationForm } from '@/components/dashboard/consignments/LocationForm'
import {
  LocationsList,
  LocationsListSkeleton,
} from '@/components/dashboard/consignments/LocationsList'
import { useConsignmentLocations } from '@/lib/hooks/useConsignmentLocations'
import { useConsignments } from '@/lib/hooks/useConsignments'
import type { ConsignmentLocation, CreateLocationRequest } from '@/lib/types/consignment'

interface ConsignmentsClientProps {
  tenantId: number
  tenantSlug: string
  locale: string
}

export function ConsignmentsClient({ tenantId, tenantSlug, locale }: ConsignmentsClientProps) {
  const router = useRouter()
  const { overview, loading: overviewLoading, error: overviewError } = useConsignments(tenantId)
  const {
    locations,
    loading: locationsLoading,
    error: locationsError,
    createLocation,
    updateLocation,
    deleteLocation,
    refetch: refetchLocations,
  } = useConsignmentLocations(tenantId)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<ConsignmentLocation | null>(null)

  const handleAddNew = () => {
    setEditingLocation(null)
    setIsFormOpen(true)
  }

  const handleEdit = (location: ConsignmentLocation) => {
    setEditingLocation(location)
    setIsFormOpen(true)
  }

  const handleDelete = async (locationId: string) => {
    try {
      await deleteLocation(locationId)
      toast.success('Ubicación eliminada')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar ubicación')
    }
  }

  const handleSave = async (data: CreateLocationRequest) => {
    if (editingLocation) {
      await updateLocation(editingLocation.id, data)
      toast.success('Ubicación actualizada')
    } else {
      await createLocation(data)
      toast.success('Ubicación creada')
    }
    setIsFormOpen(false)
    setEditingLocation(null)
  }

  const handleLocationSelect = (locationId: string) => {
    router.push(`/${locale}/${tenantSlug}/dashboard/consignments/locations/${locationId}`)
  }

  if (overviewLoading || locationsLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--color-bg-secondary)] rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-[var(--color-bg-secondary)] rounded"></div>
            ))}
          </div>
        </div>
        <LocationsListSkeleton />
      </div>
    )
  }

  if (overviewError || locationsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Error al cargar datos: {overviewError?.message || locationsError?.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8" data-testid="consignments-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
          Gestión de Consignaciones
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2">
          Administra tus obras en diferentes ubicaciones y monitorea su rendimiento
        </p>
      </div>

      {/* Overview Stats */}
      {overview && <ConsignmentOverview overview={overview} />}

      {/* Locations List */}
      <div className="pt-8 border-t border-[var(--color-border-subtle)]">
        <LocationsList
          locations={locations}
          onLocationSelect={handleLocationSelect}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={handleAddNew}
        />
      </div>

      {/* Location Form Modal */}
      <LocationForm
        isOpen={isFormOpen}
        location={editingLocation || undefined}
        onSave={handleSave}
        onCancel={() => {
          setIsFormOpen(false)
          setEditingLocation(null)
        }}
      />
    </div>
  )
}
