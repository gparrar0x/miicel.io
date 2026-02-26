/**
 * useConsignmentLocations Hook
 *
 * Manages consignment locations with CRUD operations
 * Uses fetch API for client-side data fetching
 * Optimistic updates for better UX
 */

import { useCallback, useEffect, useState } from 'react'
import type {
  ConsignmentError,
  ConsignmentLocation,
  CreateLocationRequest,
} from '@/lib/types/consignment'

interface UseConsignmentLocationsReturn {
  locations: ConsignmentLocation[]
  loading: boolean
  error: ConsignmentError | null
  refetch: () => Promise<void>
  createLocation: (data: CreateLocationRequest) => Promise<ConsignmentLocation>
  updateLocation: (id: string, data: Partial<CreateLocationRequest>) => Promise<ConsignmentLocation>
  deleteLocation: (locationId: string) => Promise<void>
}

export function useConsignmentLocations(tenantId: number): UseConsignmentLocationsReturn {
  const [locations, setLocations] = useState<ConsignmentLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ConsignmentError | null>(null)

  const fetchLocations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/dashboard/consignment-locations?tenant_id=${tenantId}`)

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to fetch locations')
      }

      const data = await res.json()
      setLocations(data.items || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError({
        code: 'FETCH_ERROR',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  const createLocation = useCallback(
    async (data: CreateLocationRequest): Promise<ConsignmentLocation> => {
      const res = await fetch('/api/dashboard/consignment-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, tenant_id: tenantId }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create location')
      }

      const newLocation = await res.json()
      setLocations((prev) => [newLocation, ...prev])
      return newLocation
    },
    [tenantId],
  )

  const updateLocation = useCallback(
    async (id: string, data: Partial<CreateLocationRequest>): Promise<ConsignmentLocation> => {
      const res = await fetch(`/api/dashboard/consignment-locations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, tenant_id: tenantId }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update location')
      }

      const updatedLocation = await res.json()
      setLocations((prev) => prev.map((loc) => (loc.id === id ? updatedLocation : loc)))
      return updatedLocation
    },
    [tenantId],
  )

  const deleteLocation = useCallback(
    async (locationId: string) => {
      // Optimistic update
      setLocations((prev) => prev.filter((loc) => loc.id !== locationId))

      const res = await fetch(`/api/dashboard/consignment-locations/${locationId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        // Rollback on error
        fetchLocations()
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete location')
      }
    },
    [fetchLocations],
  )

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
  }
}
