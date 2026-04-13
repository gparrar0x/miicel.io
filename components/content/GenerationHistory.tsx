'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Clock, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { HistoryResponse, JobStatusResponse } from '@/lib/schemas/content-generation'
import { AssetGallery } from './AssetGallery'

interface GenerationHistoryProps {
  tenantId: number
  productId: number
  onPublishAsset?: (assetUrls: string[]) => void
}

type HistoryItem = HistoryResponse['generations'][number]
type Status = HistoryItem['status']

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

/**
 * List of past content generations for a product.
 * Click to expand and show AssetGallery for completed jobs.
 *
 * @testid generation-history
 */
export function GenerationHistory({ tenantId, productId, onPublishAsset }: GenerationHistoryProps) {
  const [generations, setGenerations] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedJob, setExpandedJob] = useState<JobStatusResponse | null>(null)
  const [expandedLoading, setExpandedLoading] = useState(false)

  // Fetch history
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/content/history?tenant_id=${tenantId}&product_id=${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load history')
        return res.json()
      })
      .then((data: HistoryResponse) => setGenerations(data.generations))
      .catch(() => setError('Could not load generation history'))
      .finally(() => setLoading(false))
  }, [tenantId, productId])

  const handleExpand = useCallback(
    async (id: string) => {
      if (expandedId === id) {
        setExpandedId(null)
        setExpandedJob(null)
        return
      }
      setExpandedId(id)
      setExpandedJob(null)
      setExpandedLoading(true)
      try {
        const res = await fetch(`/api/content/jobs/${id}`)
        if (!res.ok) throw new Error('Failed to load job details')
        const data: JobStatusResponse = await res.json()
        setExpandedJob(data)
      } catch {
        setError('Could not load job details')
      } finally {
        setExpandedLoading(false)
      }
    },
    [expandedId],
  )

  // Loading skeleton
  if (loading) {
    return (
      <div data-testid="generation-history" className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-muted/30" />
        ))}
      </div>
    )
  }

  // Error state
  if (error && generations.length === 0) {
    return (
      <div
        data-testid="generation-history"
        className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
      >
        {error}
      </div>
    )
  }

  // Empty state
  if (generations.length === 0) {
    return (
      <div
        data-testid="generation-history"
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <Clock className="h-10 w-10 text-[var(--color-text-secondary)] mb-3" />
        <p className="text-sm font-medium text-[var(--color-text-primary)]">No generations yet</p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          Generated content will appear here.
        </p>
      </div>
    )
  }

  return (
    <div data-testid="generation-history" className="space-y-2">
      {generations.map((gen, index) => {
        const isExpanded = expandedId === gen.id
        const { label, variant } = STATUS_CONFIG[gen.status]

        return (
          <div key={gen.id} data-testid={`history-item-${index}`}>
            <button
              onClick={() => handleExpand(gen.id)}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors',
                'hover:bg-muted/50',
                isExpanded && 'bg-muted/30',
              )}
              data-testid={`history-item-${index}-toggle`}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text-primary)] truncate">{gen.prompt}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {formatDate(gen.created_at)}
                  {gen.asset_count > 0 &&
                    ` \u00b7 ${gen.asset_count} asset${gen.asset_count > 1 ? 's' : ''}`}
                </p>
              </div>
              <Badge variant={variant} className="shrink-0">
                {label}
              </Badge>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="mt-2 ml-7 mr-1">
                {expandedLoading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading assets...
                  </div>
                ) : expandedJob?.assets && expandedJob.assets.length > 0 ? (
                  <AssetGallery assets={expandedJob.assets} onPublishAsset={onPublishAsset} />
                ) : (
                  <p className="py-4 text-sm text-muted-foreground">
                    {gen.status === 'completed'
                      ? 'No assets found for this generation.'
                      : `Generation ${gen.status}.`}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* --- Date formatter --- */

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
