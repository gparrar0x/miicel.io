'use client'

import { useCallback } from 'react'
import { Download, Image, Film, Instagram, Scissors } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Asset {
  id: string
  asset_type: 'image' | 'video' | 'reel'
  public_url: string | null
  mime_type: string
  size_bytes: number | null
  duration_ms: number | null
  created_at: string
}

interface AssetGalleryProps {
  assets: Asset[]
  onPublishAsset?: (assetUrls: string[]) => void
}

const TYPE_ICON: Record<Asset['asset_type'], typeof Image> = {
  image: Image,
  video: Film,
  reel: Scissors,
}

const TYPE_LABEL: Record<Asset['asset_type'], string> = {
  image: 'Image',
  video: 'Video',
  reel: 'Reel',
}

/**
 * Grid gallery for generated content assets.
 * Displays image previews, video players, type badges, and download actions.
 *
 * @testid asset-gallery
 */
export function AssetGallery({ assets, onPublishAsset }: AssetGalleryProps) {
  const handleDownload = useCallback((url: string, filename: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [])

  const handleDownloadAll = useCallback(() => {
    assets.forEach((asset) => {
      if (asset.public_url) {
        handleDownload(asset.public_url, `${asset.asset_type}-${asset.id.slice(0, 8)}`)
      }
    })
  }, [assets, handleDownload])

  const handlePublish = useCallback(
    (url: string) => {
      onPublishAsset?.([url])
    },
    [onPublishAsset],
  )

  const handlePublishAll = useCallback(() => {
    const urls = assets.map((a) => a.public_url).filter((u): u is string => u != null)
    if (urls.length > 0) onPublishAsset?.(urls)
  }, [assets, onPublishAsset])

  if (assets.length === 0) {
    return (
      <div
        data-testid="asset-gallery"
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <Image className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">No assets generated yet.</p>
      </div>
    )
  }

  // Group assets by type for testid indexing
  const typeCounters: Record<string, number> = {}

  return (
    <div data-testid="asset-gallery" className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {assets.map((asset) => {
          const typeKey = asset.asset_type
          const idx = typeCounters[typeKey] ?? 0
          typeCounters[typeKey] = idx + 1
          const testId = `asset-card-${typeKey}-${idx}`
          const Icon = TYPE_ICON[typeKey]

          return (
            <div
              key={asset.id}
              data-testid={testId}
              className="group relative overflow-hidden rounded-lg border border-border bg-muted/30"
            >
              {/* Preview */}
              <div className="relative aspect-square">
                {asset.asset_type === 'image' && asset.public_url ? (
                  <img
                    src={asset.public_url}
                    alt={`Generated ${typeKey}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (asset.asset_type === 'video' || asset.asset_type === 'reel') &&
                  asset.public_url ? (
                  <video
                    src={asset.public_url}
                    className="h-full w-full object-cover"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                {/* Type badge */}
                <Badge
                  variant="secondary"
                  className="absolute left-2 top-2 text-[10px] px-1.5 py-0.5 text-[var(--color-text-primary)]"
                >
                  {TYPE_LABEL[typeKey]}
                </Badge>

                {/* Action overlay */}
                {asset.public_url && (
                  <div
                    className={cn(
                      'absolute inset-0 flex items-center justify-center gap-2',
                      'bg-black/0 opacity-0 transition-all',
                      'group-hover:bg-black/50 group-hover:opacity-100',
                      'focus-visible:bg-black/50 focus-visible:opacity-100',
                    )}
                  >
                    {onPublishAsset && (
                      <button
                        data-testid="publish-asset-btn"
                        onClick={() => handlePublish(asset.public_url!)}
                        className="rounded-full bg-[var(--color-accent-primary)] p-2 text-white hover:bg-[var(--color-accent-hover)] transition-colors"
                        aria-label={`Publish ${typeKey} to Instagram`}
                        title="Publish to Instagram"
                      >
                        <Instagram className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      data-testid="download-asset-btn"
                      onClick={() =>
                        handleDownload(asset.public_url!, `${typeKey}-${asset.id.slice(0, 8)}`)
                      }
                      className="rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
                      aria-label={`Download ${typeKey}`}
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Meta */}
              {asset.size_bytes != null && (
                <div className="px-2 py-1.5">
                  <p className="text-[11px] text-muted-foreground">
                    {formatBytes(asset.size_bytes)}
                    {asset.duration_ms != null && ` / ${formatDuration(asset.duration_ms)}`}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bulk actions */}
      <div className="flex justify-end gap-2">
        {onPublishAsset && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePublishAll}
            data-testid="publish-all-btn"
          >
            <Instagram className="h-4 w-4" />
            Publish All
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadAll}
          data-testid="download-all-btn"
        >
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>
    </div>
  )
}

/* --- Formatters --- */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
