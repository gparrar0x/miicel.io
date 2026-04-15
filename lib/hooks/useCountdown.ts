/**
 * useCountdown — generic mm:ss countdown hook with reset.
 *
 * Used by Nequi pending state (300s window) but reusable elsewhere.
 *
 * @example
 * ```tsx
 * const { mmss, isExpired, reset } = useCountdown(300)
 * return <span>{mmss}</span>
 * ```
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseCountdownResult {
  remainingSeconds: number
  mmss: string
  isExpired: boolean
  reset: () => void
}

function formatMmss(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const mm = Math.floor(safe / 60)
    .toString()
    .padStart(2, '0')
  const ss = (safe % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}

export function useCountdown(totalSeconds: number): UseCountdownResult {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    clear()
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clear()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clear])

  const reset = useCallback(() => {
    setRemainingSeconds(totalSeconds)
    start()
  }, [totalSeconds, start])

  useEffect(() => {
    start()
    return clear
  }, [start, clear])

  return {
    remainingSeconds,
    mmss: formatMmss(remainingSeconds),
    isExpired: remainingSeconds <= 0,
    reset,
  }
}
