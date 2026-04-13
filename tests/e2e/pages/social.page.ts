/**
 * Page Object Model for Social Media Manager
 *
 * Encapsulates all interactions with the social media feature:
 * - Publishing posts (photo, carousel, scheduled)
 * - Managing post queue (cancel, edit)
 * - Viewing insights (summary, top posts, per-post)
 * - Tab navigation
 * - API route mocking helpers
 */

import { expect, type Page } from '@playwright/test'
import { SocialLocators } from '../locators/social.locators'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PublishConfig {
  postType: string
  caption: string
  hashtags?: string[]
  mediaIndices?: number[]
}

export interface PostData {
  id: string
  status: 'published' | 'scheduled' | 'failed' | 'cancelled' | 'draft'
  post_type: string
  caption: string
  hashtags: string[]
  media_urls: string[]
  scheduled_at?: string
  published_at?: string
  created_at: string
}

export interface InsightsSummaryData {
  total_reach: number
  avg_engagement: number
  total_posts: number
  top_posts: Array<{
    id: string
    caption: string
    reach: number
    engagement: number
    likes: number
    comments: number
    saves: number
    shares: number
  }>
}

// ---------------------------------------------------------------------------
// Page Object
// ---------------------------------------------------------------------------

export class SocialPage {
  readonly page: Page
  private readonly loc = SocialLocators

  constructor(page: Page) {
    this.page = page
  }

  // ==========================================================================
  // NAVIGATION
  // ==========================================================================

  async navigate(tenantSlug: string, locale = 'es') {
    await this.page.goto(`/${locale}/${tenantSlug}/admin/social`)
    await this.page.waitForLoadState('networkidle')
  }

  // ==========================================================================
  // TAB NAVIGATION
  // ==========================================================================

  async clickTabPosts() {
    await this.page.getByTestId('social-tab-posts').click()
  }

  async clickTabScheduled() {
    await this.page.getByTestId('social-tab-scheduled').click()
  }

  async clickTabInsights() {
    await this.page.getByTestId('social-tab-insights').click()
  }

  async assertTabPostsVisible() {
    await expect(this.page.getByTestId('social-tab-posts')).toBeVisible({ timeout: 5000 })
  }

  async assertTabScheduledVisible() {
    await expect(this.page.getByTestId('social-tab-scheduled')).toBeVisible({ timeout: 5000 })
  }

  async assertTabInsightsVisible() {
    await expect(this.page.getByTestId('social-tab-insights')).toBeVisible({ timeout: 5000 })
  }

  // ==========================================================================
  // PUBLISHING
  // ==========================================================================

  async clickPublishIg() {
    const btn = this.page.getByTestId('publish-ig-btn')
    await expect(btn).toBeVisible({ timeout: 5000 })
    await btn.click()
  }

  async selectPostType(type: string) {
    const select = this.page.getByTestId('post-type-select')
    await expect(select).toBeVisible({ timeout: 3000 })
    await select.selectOption(type)
  }

  async fillCaption(text: string) {
    const editor = this.page.getByTestId('caption-editor')
    await expect(editor).toBeVisible({ timeout: 5000 })
    await editor.clear()
    await editor.fill(text)
  }

  async getCaptionValue(): Promise<string> {
    const editor = this.page.getByTestId('caption-editor')
    await expect(editor).toBeVisible({ timeout: 3000 })
    return (await editor.inputValue()) ?? ''
  }

  async addHashtag(tag: string) {
    const input = this.page.getByTestId('hashtag-input')
    await expect(input).toBeVisible({ timeout: 3000 })
    await input.fill(tag)
    await input.press('Enter')
  }

  async selectMediaItem(index: number) {
    const item = this.page.locator(this.loc.media.item(index))
    await expect(item).toBeVisible({ timeout: 5000 })
    await item.click()
  }

  async assertMediaPickerVisible() {
    await expect(this.page.getByTestId('media-picker')).toBeVisible({ timeout: 5000 })
  }

  async assertPostPreviewVisible() {
    await expect(this.page.getByTestId('post-preview')).toBeVisible({ timeout: 5000 })
  }

  async clickPublishConfirm() {
    const btn = this.page.getByTestId('publish-confirm-btn')
    await expect(btn).toBeVisible({ timeout: 5000 })
    await btn.click()
  }

  /**
   * Fill publish form and confirm
   */
  async fillAndPublish(config: PublishConfig) {
    await this.selectPostType(config.postType)
    if (config.mediaIndices) {
      for (const idx of config.mediaIndices) {
        await this.selectMediaItem(idx)
      }
    }
    await this.fillCaption(config.caption)
    if (config.hashtags) {
      for (const tag of config.hashtags) {
        await this.addHashtag(tag)
      }
    }
    await this.clickPublishConfirm()
  }

  // ==========================================================================
  // SCHEDULING
  // ==========================================================================

  async toggleSchedule() {
    const toggle = this.page.getByTestId('schedule-toggle')
    await expect(toggle).toBeVisible({ timeout: 3000 })
    await toggle.click()
  }

  async setScheduleDate(dateValue: string) {
    const input = this.page.getByTestId('schedule-date')
    await expect(input).toBeVisible({ timeout: 3000 })
    await input.fill(dateValue)
  }

  async clickScheduleConfirm() {
    const btn = this.page.getByTestId('schedule-confirm-btn')
    await expect(btn).toBeVisible({ timeout: 5000 })
    await btn.click()
  }

  /**
   * Fill post, enable schedule, set date, and confirm
   */
  async fillAndSchedule(config: PublishConfig, scheduleDate: string) {
    await this.selectPostType(config.postType)
    if (config.mediaIndices) {
      for (const idx of config.mediaIndices) {
        await this.selectMediaItem(idx)
      }
    }
    await this.fillCaption(config.caption)
    if (config.hashtags) {
      for (const tag of config.hashtags) {
        await this.addHashtag(tag)
      }
    }
    await this.toggleSchedule()
    await this.setScheduleDate(scheduleDate)
    await this.clickScheduleConfirm()
  }

  // ==========================================================================
  // POST QUEUE & STATUS
  // ==========================================================================

  async assertQueueVisible() {
    await expect(this.page.getByTestId('post-queue')).toBeVisible({ timeout: 5000 })
  }

  async assertQueueItemVisible(index: number) {
    await expect(this.page.locator(this.loc.queue.item(index))).toBeVisible({ timeout: 5000 })
  }

  async assertPostStatus(status: string) {
    await expect(this.page.locator(this.loc.queue.status(status))).toBeVisible({ timeout: 5000 })
  }

  async assertPostStatusNotVisible(status: string) {
    await expect(this.page.locator(this.loc.queue.status(status))).not.toBeVisible({
      timeout: 3000,
    })
  }

  // ==========================================================================
  // POST ACTIONS
  // ==========================================================================

  async clickCancelPost() {
    const btn = this.page.getByTestId('cancel-post-btn')
    await expect(btn).toBeVisible({ timeout: 5000 })
    await btn.click()
  }

  async clickEditPost() {
    const btn = this.page.getByTestId('edit-post-btn')
    await expect(btn).toBeVisible({ timeout: 5000 })
    await btn.click()
  }

  // ==========================================================================
  // INSIGHTS
  // ==========================================================================

  async assertInsightsSummaryVisible() {
    await expect(this.page.getByTestId('insights-summary')).toBeVisible({ timeout: 5000 })
  }

  async getMetricReachText(): Promise<string> {
    const el = this.page.getByTestId('metric-reach')
    await expect(el).toBeVisible({ timeout: 5000 })
    return (await el.textContent()) ?? ''
  }

  async getMetricEngagementText(): Promise<string> {
    const el = this.page.getByTestId('metric-engagement')
    await expect(el).toBeVisible({ timeout: 5000 })
    return (await el.textContent()) ?? ''
  }

  async getMetricTotalPostsText(): Promise<string> {
    const el = this.page.getByTestId('metric-total-posts')
    await expect(el).toBeVisible({ timeout: 5000 })
    return (await el.textContent()) ?? ''
  }

  async assertTopPostsVisible() {
    await expect(this.page.getByTestId('top-posts')).toBeVisible({ timeout: 5000 })
  }

  async assertPostInsightsVisible(postId: string) {
    await expect(this.page.locator(this.loc.insights.postInsights(postId))).toBeVisible({
      timeout: 5000,
    })
  }

  async clickPostInsights(postId: string) {
    const el = this.page.locator(this.loc.insights.postInsights(postId))
    await expect(el).toBeVisible({ timeout: 5000 })
    await el.click()
  }

  // ==========================================================================
  // API MOCKING HELPERS
  // ==========================================================================

  /**
   * Mock POST /api/social/publish → 201 (immediate publish)
   */
  async mockPublishSuccess(post: Partial<PostData> = {}) {
    const defaultPost: PostData = {
      id: 'post-001',
      status: 'published',
      post_type: 'photo',
      caption: 'Test caption',
      hashtags: ['#test'],
      media_urls: ['https://cdn.example.com/img-0.webp'],
      published_at: '2026-04-07T12:00:00Z',
      created_at: '2026-04-07T12:00:00Z',
      ...post,
    }

    await this.page.route(this.loc.api.publish, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ post: defaultPost }),
        })
      } else {
        await route.continue()
      }
    })
  }

  /**
   * Mock POST /api/social/publish → 201 (scheduled)
   */
  async mockScheduleSuccess(post: Partial<PostData> = {}) {
    const defaultPost: PostData = {
      id: 'post-sched-001',
      status: 'scheduled',
      post_type: 'photo',
      caption: 'Scheduled caption',
      hashtags: [],
      media_urls: ['https://cdn.example.com/img-0.webp'],
      scheduled_at: '2026-04-10T15:00:00Z',
      created_at: '2026-04-07T12:00:00Z',
      ...post,
    }

    await this.page.route(this.loc.api.publish, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ post: defaultPost }),
        })
      } else {
        await route.continue()
      }
    })
  }

  /**
   * Mock POST /api/social/publish → 500 error
   */
  async mockPublishError(status = 500, message = 'Internal server error.') {
    await this.page.route(this.loc.api.publish, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify({ error: message }),
        })
      } else {
        await route.continue()
      }
    })
  }

  /**
   * Mock GET /api/social/posts → list of posts
   */
  async mockPostsList(posts: Partial<PostData>[] = [], total?: number) {
    await this.page.route(this.loc.api.posts, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ posts, total: total ?? posts.length }),
        })
      } else {
        await route.continue()
      }
    })
  }

  /**
   * Mock GET /api/social/posts/[id] → single post with insights
   */
  async mockPostDetail(post: Partial<PostData> = {}, insights: Record<string, unknown> = {}) {
    await this.page.route(this.loc.api.postById, async (route) => {
      const method = route.request().method()
      if (method === 'GET') {
        const defaultPost: PostData = {
          id: 'post-001',
          status: 'published',
          post_type: 'photo',
          caption: 'Test caption',
          hashtags: ['#test'],
          media_urls: ['https://cdn.example.com/img-0.webp'],
          published_at: '2026-04-07T12:00:00Z',
          created_at: '2026-04-07T12:00:00Z',
          ...post,
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ post: defaultPost, insights }),
        })
      } else {
        await route.continue()
      }
    })
  }

  /**
   * Mock DELETE /api/social/posts/[id] → cancelled
   */
  async mockCancelPost(postId = 'post-sched-001') {
    await this.page.route(this.loc.api.postById, async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ post: { id: postId, status: 'cancelled' } }),
        })
      } else {
        await route.continue()
      }
    })
  }

  /**
   * Mock PATCH /api/social/posts/[id] → updated post
   */
  async mockEditPost(post: Partial<PostData> = {}) {
    await this.page.route(this.loc.api.postById, async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            post: {
              id: 'post-001',
              status: 'scheduled',
              ...post,
            },
          }),
        })
      } else {
        await route.continue()
      }
    })
  }

  /**
   * Mock GET /api/social/insights/summary
   */
  async mockInsightsSummary(data: Partial<InsightsSummaryData> = {}) {
    const defaultSummary: InsightsSummaryData = {
      total_reach: 15000,
      avg_engagement: 4.5,
      total_posts: 25,
      top_posts: [
        {
          id: 'top-001',
          caption: 'Best performing post',
          reach: 5000,
          engagement: 8.2,
          likes: 320,
          comments: 45,
          saves: 28,
          shares: 12,
        },
        {
          id: 'top-002',
          caption: 'Second best post',
          reach: 3500,
          engagement: 6.1,
          likes: 210,
          comments: 30,
          saves: 15,
          shares: 8,
        },
      ],
      ...data,
    }

    await this.page.route(this.loc.api.insightsSummary, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ summary: defaultSummary }),
      })
    })
  }

  /**
   * Mock GET /api/social/insights/summary → empty state
   */
  async mockInsightsEmpty() {
    await this.page.route(this.loc.api.insightsSummary, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: {
            total_reach: 0,
            avg_engagement: 0,
            total_posts: 0,
            top_posts: [],
          },
        }),
      })
    })
  }

  /**
   * Mock all routes needed for the post queue combined handler
   * Handles GET for list + DELETE/PATCH for individual posts
   */
  async mockPostByIdRoutes(
    options: {
      getPost?: Partial<PostData>
      getInsights?: Record<string, unknown>
      cancelPostId?: string
      editPost?: Partial<PostData>
    } = {},
  ) {
    await this.page.route(this.loc.api.postById, async (route) => {
      const method = route.request().method()

      if (method === 'GET') {
        const post: PostData = {
          id: 'post-001',
          status: 'published',
          post_type: 'photo',
          caption: 'Test caption',
          hashtags: ['#test'],
          media_urls: ['https://cdn.example.com/img-0.webp'],
          published_at: '2026-04-07T12:00:00Z',
          created_at: '2026-04-07T12:00:00Z',
          ...options.getPost,
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ post, insights: options.getInsights ?? {} }),
        })
      } else if (method === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            post: { id: options.cancelPostId ?? 'post-001', status: 'cancelled' },
          }),
        })
      } else if (method === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            post: { id: 'post-001', status: 'scheduled', ...options.editPost },
          }),
        })
      } else {
        await route.continue()
      }
    })
  }
}
