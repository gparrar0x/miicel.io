'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ImageIcon,
  Loader2,
  Pencil,
  Trash2,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PostResponse } from '@/lib/schemas/social'

type PostStatus = PostResponse['status']

interface PostQueueProps {
  tenantId: number
  filter?: PostStatus
  onPostClick?: (post: PostResponse) => void
}

const STATUS_CONFIG: Record<
  PostStatus,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    icon: typeof Clock
  }
> = {
  draft: { label: 'Draft', variant: 'secondary', icon: Pencil },
  scheduled: { label: 'Scheduled', variant: 'outline', icon: Calendar },
  publishing: { label: 'Publishing', variant: 'default', icon: Loader2 },
  published: { label: 'Published', variant: 'default', icon: CheckCircle2 },
  failed: { label: 'Failed', variant: 'destructive', icon: AlertCircle },
  cancelled: { label: 'Cancelled', variant: 'secondary', icon: XCircle },
}

/**
 * List of posts with status badges, thumbnails, and actions.
 * Supports filtering by status and inline cancel/edit for scheduled posts.
 *
 * @testid post-queue
 */
export function PostQueue({ tenantId, filter, onPostClick }: PostQueueProps) {
  const [posts, setPosts] = useState<PostResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ tenant_id: String(tenantId) })
      if (filter) params.set('status', filter)

      const res = await fetch(`/api/social/posts?${params}`)
      if (!res.ok) {
        // If 401/403, user may not have access — show empty, not error
        if (res.status === 401 || res.status === 403) {
          setPosts([])
          return
        }
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to load posts')
      }
      const data = await res.json()
      setPosts(data.posts ?? [])
    } catch {
      setError('Could not load posts')
    } finally {
      setLoading(false)
    }
  }, [tenantId, filter])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleCancel = useCallback(
    async (postId: string) => {
      setCancellingId(postId)
      try {
        const res = await fetch(`/api/social/posts/${postId}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Cancel failed')
        // Refresh list
        await fetchPosts()
      } catch {
        setError('Could not cancel post')
      } finally {
        setCancellingId(null)
      }
    },
    [fetchPosts],
  )

  // Loading skeleton
  if (loading) {
    return (
      <div data-testid="post-queue" className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex gap-3 rounded-lg border border-[var(--color-border-subtle)] p-3 animate-pulse"
          >
            <div className="h-16 w-16 rounded-md bg-[var(--color-accent-primary)]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-[var(--color-accent-primary)]" />
              <div className="h-3 w-48 rounded bg-[var(--color-accent-primary)]" />
              <div className="h-3 w-32 rounded bg-[var(--color-accent-primary)]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        data-testid="post-queue"
        className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
      >
        {error}
        <Button variant="outline" size="sm" onClick={fetchPosts} className="ml-3">
          Retry
        </Button>
      </div>
    )
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div
        data-testid="post-queue"
        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-border-subtle)] py-12 text-[var(--color-text-secondary)]"
      >
        <ImageIcon className="h-8 w-8" />
        <p className="text-sm">{filter === 'scheduled' ? 'No scheduled posts' : 'No posts yet'}</p>
      </div>
    )
  }

  return (
    <div data-testid="post-queue" className="space-y-2">
      {posts.map((post, index) => {
        const config = STATUS_CONFIG[post.status]
        const StatusIcon = config.icon
        const isScheduled = post.status === 'scheduled'

        return (
          <div
            key={post.id}
            data-testid={`post-queue-item-${index}`}
            className={cn(
              'flex items-start gap-3 rounded-lg border border-[var(--color-border-subtle)] p-3 transition-colors',
              onPostClick && 'cursor-pointer hover:bg-muted/40',
            )}
            onClick={() => onPostClick?.(post)}
            role={onPostClick ? 'button' : undefined}
            tabIndex={onPostClick ? 0 : undefined}
          >
            {/* Thumbnail */}
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-[var(--color-border-subtle)]">
              {post.media_urls[0] ? (
                <img src={post.media_urls[0].url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  data-testid={`post-status-${post.status}`}
                  variant={config.variant}
                  className="gap-1"
                >
                  <StatusIcon
                    className={cn('h-3 w-3', post.status === 'publishing' && 'animate-spin')}
                  />
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground uppercase">{post.media_type}</span>
              </div>

              {post.caption && (
                <p className="text-sm text-[var(--color-text-primary)] line-clamp-2 break-words">
                  {post.caption}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                {post.scheduled_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(post.scheduled_at).toLocaleString()}
                  </span>
                )}
                {post.published_at && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {new Date(post.published_at).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Actions (scheduled only) */}
            {isScheduled && (
              <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  data-testid="edit-post-btn"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="Edit post"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  data-testid="cancel-post-btn"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => handleCancel(post.id)}
                  disabled={cancellingId === post.id}
                  aria-label="Cancel post"
                >
                  {cancellingId === post.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
