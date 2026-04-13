'use client'

import { Instagram } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCreator } from './PostCreator'
import { PostQueue } from './PostQueue'
import { InsightsDashboard } from './InsightsDashboard'

interface SocialDashboardPageProps {
  tenantId: number
}

/**
 * Main Social Media Manager page with 3 tabs: Posts, Scheduled, Insights.
 *
 * @testid social-dashboard
 */
export function SocialDashboardPage({ tenantId }: SocialDashboardPageProps) {
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handlePublished = () => {
    setCreatorOpen(false)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Social Media</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Manage your Instagram posts, schedule content, and track performance.
          </p>
        </div>
        <Button onClick={() => setCreatorOpen(true)} className="gap-2" data-testid="new-post-btn">
          <Instagram className="h-4 w-4" />
          New Post
        </Button>
      </div>

      <PostCreator
        open={creatorOpen}
        onOpenChange={setCreatorOpen}
        tenantId={tenantId}
        onPublished={handlePublished}
      />

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger data-testid="social-tab-posts" value="posts">
            Posts
          </TabsTrigger>
          <TabsTrigger data-testid="social-tab-scheduled" value="scheduled">
            Scheduled
          </TabsTrigger>
          <TabsTrigger data-testid="social-tab-insights" value="insights">
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4">
          <PostQueue key={`posts-${refreshKey}`} tenantId={tenantId} filter="published" />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4">
          <PostQueue key={`scheduled-${refreshKey}`} tenantId={tenantId} filter="scheduled" />
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          <InsightsDashboard tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
