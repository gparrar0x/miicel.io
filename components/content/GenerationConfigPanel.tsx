'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { UsageResponse } from '@/lib/schemas/content-generation'
import { GenerationProgress } from './GenerationProgress'

interface GenerationConfigPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: number
  tenantId: number
  initialPrompt?: string
  onPublishAsset?: (assetUrls: string[]) => void
}

type Quality = 'low' | 'medium' | 'high'
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3'

/**
 * Dialog for configuring and launching content generation.
 * Shows usage quota, prompt input, and generation options.
 * On confirm, calls POST /api/content/generate and transitions to GenerationProgress.
 *
 * @testid generation-config-panel
 */
export function GenerationConfigPanel({
  open,
  onOpenChange,
  productId,
  tenantId,
  initialPrompt = '',
  onPublishAsset,
}: GenerationConfigPanelProps) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [quality, setQuality] = useState<Quality>('medium')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1')
  const [imageCount, setImageCount] = useState(1)
  const [generateVideo, setGenerateVideo] = useState(false)
  const [extractReels, setExtractReels] = useState(false)
  const [usage, setUsage] = useState<UsageResponse | null>(null)
  const [usageLoading, setUsageLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generationId, setGenerationId] = useState<string | null>(null)

  // Fetch usage quota when dialog opens
  useEffect(() => {
    if (!open) return
    setUsageLoading(true)
    setError(null)
    fetch(`/api/content/usage?tenant_id=${tenantId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load usage')
        return res.json()
      })
      .then((data: UsageResponse) => setUsage(data))
      .catch(() => setError('Could not load usage quota'))
      .finally(() => setUsageLoading(false))
  }, [open, tenantId])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setGenerationId(null)
      setError(null)
      setSubmitting(false)
    }
  }, [open])

  // Disable reels when video is off
  useEffect(() => {
    if (!generateVideo) setExtractReels(false)
  }, [generateVideo])

  const handleConfirm = useCallback(async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          product_id: productId,
          prompt,
          quality,
          aspect_ratio: aspectRatio,
          image_count: imageCount,
          generate_video: generateVideo,
          extract_reels: extractReels,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Request failed (${res.status})`)
      }
      const data = await res.json()
      setGenerationId(data.generation.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setSubmitting(false)
    }
  }, [tenantId, productId, prompt, quality, aspectRatio, imageCount, generateVideo, extractReels])

  const imagesPercent =
    usage && usage.images_limit
      ? Math.min(100, Math.round((usage.images_used / usage.images_limit) * 100))
      : null
  const videosPercent =
    usage && usage.videos_limit
      ? Math.min(100, Math.round((usage.videos_used / usage.videos_limit) * 100))
      : null

  // If generation started, show progress tracker
  if (generationId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg" data-testid="generation-config-panel">
          <GenerationProgress
            jobId={generationId}
            onClose={() => onOpenChange(false)}
            onPublishAsset={onPublishAsset}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="generation-config-panel">
        <DialogHeader>
          <DialogTitle>Generate Content</DialogTitle>
          <DialogDescription>
            Configure options and generate images, videos, and reels for your product.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Prompt */}
          <div className="grid gap-2">
            <Label htmlFor="generation-prompt">Prompt</Label>
            <Textarea
              id="generation-prompt"
              data-testid="generation-prompt-input"
              placeholder="Describe the content you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-24 resize-y"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">{prompt.length}/2000</p>
          </div>

          {/* Quality + Aspect Ratio row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Quality</Label>
              <Select value={quality} onValueChange={(v) => setQuality(v as Quality)}>
                <SelectTrigger data-testid="generation-quality-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as AspectRatio)}>
                <SelectTrigger data-testid="generation-ratio-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">1:1 Square</SelectItem>
                  <SelectItem value="16:9">16:9 Landscape</SelectItem>
                  <SelectItem value="9:16">9:16 Portrait</SelectItem>
                  <SelectItem value="4:3">4:3 Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Count */}
          <div className="grid gap-2">
            <Label htmlFor="image-count">Image Count</Label>
            <Input
              id="image-count"
              data-testid="generation-image-count"
              type="number"
              min={1}
              max={4}
              value={imageCount}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (v >= 1 && v <= 4) setImageCount(v)
              }}
              className="w-24"
            />
          </div>

          {/* Video + Reels toggles */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="video-toggle" className="cursor-pointer">
                Generate Video
              </Label>
              <Switch
                id="video-toggle"
                data-testid="generation-video-toggle"
                checked={generateVideo}
                onCheckedChange={setGenerateVideo}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="reels-toggle"
                className={cn('cursor-pointer', !generateVideo && 'opacity-50')}
              >
                Extract Reels
              </Label>
              <Switch
                id="reels-toggle"
                data-testid="generation-reels-toggle"
                checked={extractReels}
                onCheckedChange={setExtractReels}
                disabled={!generateVideo}
              />
            </div>
          </div>

          {/* Usage Quota */}
          <div
            data-testid="generation-usage-quota"
            className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-accent-primary)] p-3 space-y-2"
          >
            <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Usage &mdash; {usage?.plan ?? '...'}
            </p>
            {usageLoading ? (
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading usage...
              </div>
            ) : usage ? (
              <div className="space-y-1.5">
                <QuotaBar
                  label="Images"
                  used={usage.images_used}
                  limit={usage.images_limit}
                  percent={imagesPercent}
                />
                <QuotaBar
                  label="Videos"
                  used={usage.videos_used}
                  limit={usage.videos_limit}
                  percent={videosPercent}
                />
              </div>
            ) : null}
          </div>

          {/* Error */}
          {error && (
            <div
              data-testid="generation-error"
              className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="generation-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            data-testid="generation-confirm-btn"
            onClick={handleConfirm}
            disabled={!prompt.trim() || submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Generating...' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* --- Internal quota bar component --- */

function QuotaBar({
  label,
  used,
  limit,
  percent,
}: {
  label: string
  used: number
  limit: number | null
  percent: number | null
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--color-text-secondary)]">{label}</span>
        <span className="font-medium text-[var(--color-text-primary)]">
          {used} / {limit ?? 'Unlimited'}
        </span>
      </div>
      {percent !== null && (
        <div className="h-1.5 w-full rounded-full bg-[var(--color-accent-hover)]">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              percent >= 90
                ? 'bg-[var(--color-error)]'
                : percent >= 70
                  ? 'bg-[var(--color-warning)]'
                  : 'bg-[var(--color-text-primary)]',
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  )
}
