/**
 * useConsignments Hook
 *
 * Fetches consignment overview stats and alerts
 * Used on dashboard overview page
 */

import { useState, useCallback, useEffect } from 'react'
import { ConsignmentOverview, ConsignmentError } from '@/lib/types/consignment'

interface UseConsignmentsReturn {
  overview: ConsignmentOverview | null
  loading: boolean
  error: ConsignmentError | null
  refetch: () => Promise<void>
}

export function useConsignments(tenantId: number): UseConsignmentsReturn {
  const [overview, setOverview] = useState<ConsignmentOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ConsignmentError | null>(null)

  const fetchOverview = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/dashboard/consignments/overview?tenant_id=${tenantId}`
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to fetch overview')
      }

      const data = await res.json()
      setOverview(data)
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
    fetchOverview()
  }, [fetchOverview])

  return {
    overview,
    loading,
    error,
    refetch: fetchOverview,
  }
}
