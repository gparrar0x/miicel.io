'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Calendar, Hash, ImageIcon, Loader2, Upload, X } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { PublishRequest } from '@/lib/schemas/social'

type MediaType = 'IMAGE' | 'CAROUSEL' | 'REELS'

interface PostCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: number
  mediaUrls?: string[]
  productId?: number
  generationId?: string
  onPublished?: () => void
}

/**
 * Dialog for composing and publishing/scheduling Instagram posts.
 * Supports photo, carousel, and reel types with caption, hashtags,
 * media preview, and scheduling.
 *
 * @testid post-creator
 */
export function PostCreator({
  open,
  onOpenChange,
  tenantId,
  mediaUrls: initialMediaUrls,
  productId,
  generationId,
  onPublished,
}: PostCreatorProps) {
  const [mediaType, setMediaType] = useState<MediaType>(
    (initialMediaUrls ?? []).length > 1 ? 'CAROUSEL' : 'IMAGE',
  )
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialMediaUrls ?? [])
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [caption, setCaption] = useState('')
  const [hashtagInput, setHashtagInput] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setCaption('')
      setHashtags([])
      setHashtagInput('')
      setScheduleEnabled(false)
      setScheduledAt('')
      setError(null)
      setSubmitting(false)
      setMediaUrls(initialMediaUrls ?? [])
      setUrlInput('')
      setMediaType((initialMediaUrls ?? []).length > 1 ? 'CAROUSEL' : 'IMAGE')
    }
  }, [open, initialMediaUrls])

  const addHashtag = useCallback(() => {
    const tag = hashtagInput.trim().replace(/^#/, '')
    if (tag && !hashtags.includes(tag) && hashtags.length < 30) {
      setHashtags((prev) => [...prev, tag])
      setHashtagInput('')
    }
  }, [hashtagInput, hashtags])

  const removeHashtag = useCallback((tag: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const handleHashtagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        addHashtag()
      }
    },
    [addHashtag],
  )

  const removeMedia = useCallback((index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const addMediaUrl = useCallback(
    (url: string) => {
      const trimmed = url.trim()
      if (trimmed && !mediaUrls.includes(trimmed)) {
        setMediaUrls((prev) => [...prev, trimmed])
        setUrlInput('')
      }
    },
    [mediaUrls],
  )

  const handleFileSelect = useCallback((files: FileList) => {
    for (const file of Array.from(files)) {
      const objectUrl = URL.createObjectURL(file)
      setMediaUrls((prev) => [...prev, objectUrl])
    }
  }, [])

  const fullCaption =
    caption + (hashtags.length > 0 ? '\n\n' + hashtags.map((t) => `#${t}`).join(' ') : '')

  const handlePublish = useCallback(async () => {
    setSubmitting(true)
    setError(null)
    try {
      const body: PublishRequest = {
        tenant_id: tenantId,
        media_type: mediaType,
        caption: fullCaption || undefined,
        media_urls: mediaUrls.map((url) => ({ type: 'IMAGE' as const, url })),
        scheduled_at:
          scheduleEnabled && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        generation_id: generationId,
      }

      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Publish failed (${res.status})`)
      }

      onOpenChange(false)
      onPublished?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setSubmitting(false)
    }
  }, [
    tenantId,
    mediaType,
    fullCaption,
    mediaUrls,
    scheduleEnabled,
    scheduledAt,
    generationId,
    onOpenChange,
  ])

  const canPublish = mediaUrls.length > 0 && !submitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]" data-testid="post-creator">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Publish to Instagram</DialogTitle>
          <DialogDescription>
            Compose your post, add hashtags, and publish or schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 overflow-y-auto flex-1">
          {/* Post Type */}
          <div className="grid gap-2">
            <Label>Post Type</Label>
            <Select value={mediaType} onValueChange={(v) => setMediaType(v as MediaType)}>
              <SelectTrigger data-testid="post-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMAGE">Photo</SelectItem>
                <SelectItem value="CAROUSEL">Carousel</SelectItem>
                <SelectItem value="REELS">Reel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Media Upload Input */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2 text-[var(--color-text-primary)]">
              <Upload className="h-4 w-4" />
              Add Media
            </Label>
            <div className="flex gap-2">
              <Input
                data-testid="media-url-input"
                placeholder="Paste image URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addMediaUrl(urlInput)
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addMediaUrl(urlInput)}
                disabled={!urlInput.trim()}
                data-testid="media-add-url-btn"
              >
                Add URL
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              data-testid="media-file-input"
            >
              <Upload className="h-4 w-4" />
              Upload from Device
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            />
            <p className="text-xs text-muted-foreground">
              Supported: JPG, PNG, GIF, WebP (max 10MB each)
            </p>
          </div>

          {/* Media Preview */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2 text-[var(--color-text-primary)]">
              <ImageIcon className="h-4 w-4" />
              Media ({mediaUrls.length})
            </Label>
            <div data-testid="media-picker" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {mediaUrls.length === 0 ? (
                <div className="col-span-full flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-border-subtle)] text-sm text-muted-foreground">
                  No media selected
                </div>
              ) : (
                mediaUrls.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    data-testid={`media-item-${i}`}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border-subtle)]"
                  >
                    <img src={url} alt={`Media ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      data-testid={`media-remove-${i}`}
                      onClick={() => removeMedia(i)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label={`Remove media ${i + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Caption */}
          <div className="grid gap-2">
            <Label htmlFor="caption-editor">Caption</Label>
            <Textarea
              id="caption-editor"
              data-testid="caption-editor"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-24 resize-y"
              maxLength={2200}
            />
            <p className="text-xs text-muted-foreground text-right">{fullCaption.length}/2200</p>
          </div>

          {/* Hashtags */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2 text-[var(--color-text-primary)]">
              <Hash className="h-4 w-4" />
              Hashtags ({hashtags.length}/30)
            </Label>
            <div className="flex gap-2">
              <Input
                data-testid="hashtag-input"
                placeholder="Add hashtag..."
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagKeyDown}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHashtag}
                disabled={!hashtagInput.trim()}
              >
                Add
              </Button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="rounded-full hover:bg-muted"
                      aria-label={`Remove #${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post Preview */}
          <div
            data-testid="post-preview"
            className="rounded-lg border border-[var(--color-border-subtle)] overflow-hidden"
          >
            <div className="bg-[var(--color-accent-primary)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Preview
            </div>
            <div className="p-3 space-y-2 bg-[var(--color-bg-primary)]">
              {mediaUrls[0] && (
                <div className="aspect-square max-h-48 w-full overflow-hidden rounded-md">
                  <img src={mediaUrls[0]} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              {fullCaption && (
                <p className="text-sm whitespace-pre-wrap break-words line-clamp-4 text-[var(--color-text-primary)]">
                  {fullCaption}
                </p>
              )}
              {!mediaUrls[0] && !fullCaption && (
                <p className="text-sm text-[var(--color-text-secondary)] italic">
                  Your post preview will appear here
                </p>
              )}
            </div>
          </div>

          {/* Schedule Toggle */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="schedule-toggle" className="flex cursor-pointer items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Post
              </Label>
              <Switch
                id="schedule-toggle"
                data-testid="schedule-toggle"
                checked={scheduleEnabled}
                onCheckedChange={setScheduleEnabled}
              />
            </div>
            {scheduleEnabled && (
              <Input
                data-testid="schedule-date"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full"
              />
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              data-testid="post-creator-error"
              className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {scheduleEnabled ? (
            <Button
              data-testid="schedule-confirm-btn"
              onClick={handlePublish}
              disabled={!canPublish || !scheduledAt}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Scheduling...' : 'Schedule'}
            </Button>
          ) : (
            <Button
              data-testid="publish-confirm-btn"
              onClick={handlePublish}
              disabled={!canPublish}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Publishing...' : 'Publish Now'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
