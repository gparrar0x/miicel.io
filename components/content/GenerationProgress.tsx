'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { JobStatusResponse } from '@/lib/schemas/content-generation'
import { AssetGallery } from './AssetGallery'

interface GenerationProgressProps {
  jobId: string
  onClose: () => void
  onPublishAsset?: (assetUrls: string[]) => void
}

type Status = JobStatusResponse['status']

const STATUS_CONFIG: Record<
  Status,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Pending', variant: 'outline' },
  processing: { label: 'Processing', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
}

const POLL_INTERVAL = 3000

/**
 * Polls job status and displays step-by-step progress.
 * Transitions to AssetGallery on completion.
 *
 * @testid generation-progress
 */
export function GenerationProgress({ jobId, onClose, onPublishAsset }: GenerationProgressProps) {
  const [job, setJob] = useState<JobStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/content/jobs/${jobId}`)
      if (!res.ok) throw new Error(`Failed to fetch job (${res.status})`)
      const data = await res.json()
      setJob(data.job as JobStatusResponse)

      // Stop polling on terminal states
      if (['completed', 'failed', 'cancelled'].includes(data.status)) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status')
    }
  }, [jobId])

  // Start polling
  useEffect(() => {
    fetchJob()
    intervalRef.current = setInterval(fetchJob, POLL_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchJob])

  const handleCancel = useCallback(async () => {
    setCancelling(true)
    try {
      const res = await fetch(`/api/content/jobs/${jobId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Cancel failed')
      const data = await res.json()
      setJob((prev) => (prev ? { ...prev, status: data.generation.status } : prev))
    } catch {
      setError('Failed to cancel generation')
    } finally {
      setCancelling(false)
    }
  }, [jobId])

  const status = job?.status ?? 'pending'
  const { label: statusLabel, variant: statusVariant } = STATUS_CONFIG[status]
  const isTerminal = ['completed', 'failed', 'cancelled'].includes(status)
  const canCancel = !isTerminal && !cancelling

  // Show asset gallery on completion
  if (status === 'completed' && job?.assets && job.assets.length > 0) {
    return (
      <div className="space-y-4" data-testid="generation-progress">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[var(--color-text-primary)]">Generation Complete</h3>
          <Badge variant={statusVariant} data-testid="progress-status-badge">
            {statusLabel}
          </Badge>
        </div>
        <AssetGallery assets={job.assets} onPublishAsset={onPublishAsset} />
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose} data-testid="progress-close-btn">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="generation-progress">
      {/* Header + Status Badge */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[var(--color-text-primary)]">Generating Content</h3>
        <Badge variant={statusVariant} data-testid="progress-status-badge">
          {statusLabel}
        </Badge>
      </div>

      {/* Step Indicators */}
      <div className="space-y-3">
        <StepRow
          data-testid="progress-step-images"
          label="Generating images"
          state={stepState(status, 'images')}
        />
        <StepRow
          data-testid="progress-step-video"
          label="Generating video"
          state={stepState(status, 'video')}
        />
        <StepRow
          data-testid="progress-step-reels"
          label="Extracting reels"
          state={stepState(status, 'reels')}
        />
      </div>

      {/* Error display */}
      {(error || job?.error) && (
        <div
          data-testid="progress-error"
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error || job?.error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        {canCancel ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={cancelling}
            data-testid="progress-cancel-btn"
          >
            {cancelling && <Loader2 className="h-3 w-3 animate-spin" />}
            Cancel
          </Button>
        ) : (
          <div />
        )}
        {isTerminal && (
          <Button variant="outline" size="sm" onClick={onClose} data-testid="progress-close-btn">
            Close
          </Button>
        )}
      </div>
    </div>
  )
}

/* --- Step state logic --- */

type StepState = 'idle' | 'active' | 'done' | 'error'

function stepState(jobStatus: Status, step: 'images' | 'video' | 'reels'): StepState {
  if (jobStatus === 'failed') return 'error'
  if (jobStatus === 'cancelled') return 'idle'
  if (jobStatus === 'completed') return 'done'
  if (jobStatus === 'pending') {
    return step === 'images' ? 'active' : 'idle'
  }
  // processing — images done, video active, reels idle
  if (step === 'images') return 'done'
  if (step === 'video') return 'active'
  return 'idle'
}

function StepRow({
  label,
  state,
  ...props
}: {
  label: string
  state: StepState
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-sm',
        state === 'idle' && 'text-[var(--color-text-secondary)]',
        state === 'active' && 'text-[var(--color-text-primary)]',
        state === 'done' && 'text-[var(--color-text-primary)]',
        state === 'error' && 'text-[var(--color-error)]',
      )}
      {...props}
    >
      {state === 'idle' && <Circle className="h-4 w-4" />}
      {state === 'active' && <Loader2 className="h-4 w-4 animate-spin" />}
      {state === 'done' && <CheckCircle2 className="h-4 w-4" />}
      {state === 'error' && <XCircle className="h-4 w-4" />}
      <span>{label}</span>
    </div>
  )
}
