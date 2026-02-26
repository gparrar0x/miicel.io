/**
 * useArtworkHistory Hook
 *
 * Fetches movement history for a specific artwork
 * Used on artwork detail pages to show timeline
 */

import { useCallback, useEffect, useState } from 'react'
import type { ConsignmentError, MovementTimeline } from '@/lib/types/consignment'

interface UseArtworkHistoryReturn {
  movements: MovementTimeline[]
  loading: boolean
  error: ConsignmentError | null
  refetch: () => Promise<void>
}

export function useArtworkHistory(artworkId: number | null): UseArtworkHistoryReturn {
  const [movements, setMovements] = useState<MovementTimeline[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ConsignmentError | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!artworkId) {
      setMovements([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/dashboard/artworks/${artworkId}/consignment-history`)

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to fetch history')
      }

      const data = await res.json()
      setMovements(data.movements || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError({
        code: 'FETCH_ERROR',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [artworkId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    movements,
    loading,
    error,
    refetch: fetchHistory,
  }
}
