'use client'

import { useCallback, useEffect, useState } from 'react'
import { BarChart3, Eye, Heart, Loader2, MessageCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { InsightsSummary, PostResponse } from '@/lib/schemas/social'

interface InsightsDashboardProps {
  tenantId: number
}

/**
 * Summary cards (reach, engagement, total posts) + top posts ranked by engagement.
 * Fetches from GET /api/social/insights/summary.
 *
 * @testid insights-summary
 */
export function InsightsDashboard({ tenantId }: InsightsDashboardProps) {
  const [summary, setSummary] = useState<InsightsSummary | null>(null)
  const [topPosts, setTopPosts] = useState<PostResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [summaryRes, postsRes] = await Promise.all([
        fetch(`/api/social/insights/summary?tenant_id=${tenantId}`),
        fetch(`/api/social/posts?tenant_id=${tenantId}&status=published&limit=5`),
      ])

      if (!summaryRes.ok) throw new Error('Failed to load insights')
      const summaryData = await summaryRes.json()
      setSummary(summaryData)

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setTopPosts(postsData.posts ?? [])
      }
    } catch {
      setError('Could not load insights')
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  // Loading skeleton
  if (loading) {
    return (
      <div data-testid="insights-summary" className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-20 rounded bg-[var(--color-accent-primary)]" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 rounded bg-[var(--color-accent-primary)]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-5 w-32 rounded bg-[var(--color-accent-primary)]" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded bg-[var(--color-accent-primary)]" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        data-testid="insights-summary"
        className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
      >
        {error}
      </div>
    )
  }

  // Empty state
  if (!summary || summary.total_posts === 0) {
    return (
      <div
        data-testid="insights-summary"
        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-border-subtle)] py-12 text-[var(--color-text-secondary)]"
      >
        <BarChart3 className="h-8 w-8" />
        <p className="text-sm">No insights yet. Publish your first post.</p>
      </div>
    )
  }

  return (
    <div data-testid="insights-summary" className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          testId="metric-reach"
          icon={Eye}
          label="Total Reach"
          value={formatNumber(summary.total_reach)}
        />
        <MetricCard
          testId="metric-engagement"
          icon={TrendingUp}
          label="Avg Engagement"
          value={`${summary.avg_engagement_rate.toFixed(2)}%`}
        />
        <MetricCard
          testId="metric-total-posts"
          icon={BarChart3}
          label="Total Posts"
          value={String(summary.total_posts)}
        />
      </div>

      {/* Top Posts */}
      {topPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle
              data-testid="top-posts"
              className="text-base text-[var(--color-text-primary)]"
            >
              Top Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topPosts.map((post) => (
              <div
                key={post.id}
                data-testid={`post-insights-${post.id}`}
                className="rounded-lg border border-[var(--color-border-subtle)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                  className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/40 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-[var(--color-border-subtle)]">
                    {post.media_urls[0] ? (
                      <img
                        src={post.media_urls[0].url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                  </div>

                  {/* Caption snippet */}
                  <p className="flex-1 text-sm line-clamp-1 min-w-0 text-[var(--color-text-primary)]">
                    {post.caption || 'No caption'}
                  </p>

                  {/* Quick stats */}
                  <div className="flex shrink-0 items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </button>

                {/* Expanded insights */}
                {expandedId === post.id && (
                  <div className="border-t border-[var(--color-border-subtle)] bg-[var(--color-accent-primary)] p-3">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <InsightStat
                        icon={Eye}
                        label="Reach"
                        value={formatNumber(summary.total_reach)}
                      />
                      <InsightStat
                        icon={Eye}
                        label="Impressions"
                        value={formatNumber(summary.total_impressions)}
                      />
                      <InsightStat
                        icon={Heart}
                        label="Likes"
                        value={formatNumber(summary.total_likes)}
                      />
                      <InsightStat
                        icon={MessageCircle}
                        label="Comments"
                        value={formatNumber(summary.total_comments)}
                      />
                      <InsightStat label="Saves" value={formatNumber(summary.total_saves)} />
                      <InsightStat label="Shares" value={formatNumber(summary.total_shares)} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* --- Internal components --- */

function MetricCard({
  testId,
  icon: Icon,
  label,
  value,
}: {
  testId: string
  icon: typeof Eye
  label: string
  value: string
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <Icon className="h-4 w-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold text-[var(--color-text-primary)]">{value}</p>
      </CardContent>
    </Card>
  )
}

function InsightStat({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Eye
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {Icon && <Icon className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />}
      <div>
        <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
        <p className="font-medium text-[var(--color-text-primary)]">{value}</p>
      </div>
    </div>
  )
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
