/**
 * useNequiStatus — polls /api/orders/[id]/nequi-status until terminal or timeout.
 *
 * Behaviour:
 *   - Initial 3s delay before first poll.
 *   - Polls every 5s, switches to 10s after 60s without status change.
 *   - Hard client-side timeout at 300s → returns 'expired'.
 *   - AbortController on unmount or terminal status.
 *   - Auth header `x-order-token: ${nequiTransactionId}` (matches backend).
 *
 * Backend route: app/api/orders/[id]/nequi-status/route.ts
 */

'use client'

import { useEffect, useRef, useState } from 'react'

export type NequiStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled'

const TERMINAL_STATUSES: ReadonlySet<NequiStatus> = new Set([
  'paid',
  'failed',
  'expired',
  'cancelled',
])

export interface UseNequiStatusParams {
  orderId: number | string
  nequiTransactionId: string
  enabled?: boolean
}

export interface UseNequiStatusResult {
  status: NequiStatus
  rawStatusCode?: string
  message?: string
  isPolling: boolean
  error: Error | null
}

const INITIAL_DELAY_MS = 3_000
const FAST_INTERVAL_MS = 5_000
const SLOW_INTERVAL_MS = 10_000
const SLOW_AFTER_MS = 60_000
const TOTAL_TIMEOUT_MS = 300_000

export function useNequiStatus({
  orderId,
  nequiTransactionId,
  enabled = true,
}: UseNequiStatusParams): UseNequiStatusResult {
  const [status, setStatus] = useState<NequiStatus>('pending')
  const [rawStatusCode, setRawStatusCode] = useState<string | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Refs so the polling closure doesn't re-create on every render.
  const stoppedRef = useRef(false)
  const startedAtRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!enabled || !orderId || !nequiTransactionId) {
      return
    }

    stoppedRef.current = false
    startedAtRef.current = Date.now()
    setIsPolling(true)

    let timerId: ReturnType<typeof setTimeout> | null = null

    const stop = () => {
      stoppedRef.current = true
      setIsPolling(false)
      if (timerId !== null) {
        clearTimeout(timerId)
        timerId = null
      }
      if (abortRef.current) {
        abortRef.current.abort()
        abortRef.current = null
      }
    }

    const tick = async () => {
      if (stoppedRef.current) return

      // Hard timeout — surface as expired without DB hit.
      const elapsed = Date.now() - (startedAtRef.current ?? Date.now())
      if (elapsed >= TOTAL_TIMEOUT_MS) {
        setStatus('expired')
        stop()
        return
      }

      const ctrl = new AbortController()
      abortRef.current = ctrl

      try {
        const res = await fetch(`/api/orders/${orderId}/nequi-status`, {
          method: 'GET',
          headers: {
            'x-order-token': nequiTransactionId,
          },
          signal: ctrl.signal,
          cache: 'no-store',
        })

        if (stoppedRef.current) return

        if (!res.ok) {
          // Network/auth error — log, don't crash. Will retry next tick.
          const text = await res.text().catch(() => '')
          setError(new Error(`HTTP ${res.status}: ${text || 'request failed'}`))
        } else {
          const data: {
            status?: NequiStatus
            raw_status_code?: string
            message?: string
          } = await res.json()

          if (data.status) {
            setStatus(data.status)
            setRawStatusCode(data.raw_status_code)
            setMessage(data.message)
            setError(null)

            if (TERMINAL_STATUSES.has(data.status)) {
              stop()
              return
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return
        setError(err instanceof Error ? err : new Error('Network error'))
      }

      if (stoppedRef.current) return

      const interval =
        Date.now() - (startedAtRef.current ?? Date.now()) >= SLOW_AFTER_MS
          ? SLOW_INTERVAL_MS
          : FAST_INTERVAL_MS

      timerId = setTimeout(tick, interval)
    }

    // Initial delay then start polling.
    timerId = setTimeout(tick, INITIAL_DELAY_MS)

    return stop
  }, [orderId, nequiTransactionId, enabled])

  return {
    status,
    rawStatusCode,
    message,
    isPolling,
    error,
  }
}
