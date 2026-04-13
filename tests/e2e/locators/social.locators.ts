/**
 * Social Media Manager Locators
 *
 * Defines all selectors for the social media feature:
 * - Publishing (photo, carousel, schedule)
 * - Post queue & status management
 * - Insights dashboard (summary, top posts, per-post)
 * - Tab navigation
 *
 * Uses data-testid attributes from Pixel implementation.
 */

export const SocialLocators = {
  // ============================================================================
  // PUBLISHING CONTROLS
  // ============================================================================
  publish: {
    igButton: '[data-testid="publish-ig-btn"]',
    postTypeSelect: '[data-testid="post-type-select"]',
    captionEditor: '[data-testid="caption-editor"]',
    hashtagInput: '[data-testid="hashtag-input"]',
    postPreview: '[data-testid="post-preview"]',
    confirmButton: '[data-testid="publish-confirm-btn"]',
  },

  // ============================================================================
  // MEDIA PICKER
  // ============================================================================
  media: {
    picker: '[data-testid="media-picker"]',
    /** Dynamic: media-item-0, media-item-1 */
    item: (index: number) => `[data-testid="media-item-${index}"]`,
  },

  // ============================================================================
  // SCHEDULE
  // ============================================================================
  schedule: {
    toggle: '[data-testid="schedule-toggle"]',
    dateInput: '[data-testid="schedule-date"]',
    confirmButton: '[data-testid="schedule-confirm-btn"]',
  },

  // ============================================================================
  // POST QUEUE & STATUS
  // ============================================================================
  queue: {
    container: '[data-testid="post-queue"]',
    /** Dynamic: post-queue-item-0, post-queue-item-1 */
    item: (index: number) => `[data-testid="post-queue-item-${index}"]`,
    /** Dynamic: post-status-published, post-status-scheduled, post-status-failed, post-status-cancelled */
    status: (status: string) => `[data-testid="post-status-${status}"]`,
  },

  // ============================================================================
  // POST ACTIONS
  // ============================================================================
  actions: {
    cancelButton: '[data-testid="cancel-post-btn"]',
    editButton: '[data-testid="edit-post-btn"]',
  },

  // ============================================================================
  // INSIGHTS
  // ============================================================================
  insights: {
    summary: '[data-testid="insights-summary"]',
    metricReach: '[data-testid="metric-reach"]',
    metricEngagement: '[data-testid="metric-engagement"]',
    metricTotalPosts: '[data-testid="metric-total-posts"]',
    topPosts: '[data-testid="top-posts"]',
    /** Dynamic: post-insights-abc123 */
    postInsights: (id: string) => `[data-testid="post-insights-${id}"]`,
  },

  // ============================================================================
  // TAB NAVIGATION
  // ============================================================================
  tabs: {
    posts: '[data-testid="social-tab-posts"]',
    scheduled: '[data-testid="social-tab-scheduled"]',
    insights: '[data-testid="social-tab-insights"]',
  },

  // ============================================================================
  // API MOCK HELPERS (for Playwright route interception)
  // ============================================================================
  api: {
    publish: '**/api/social/publish',
    posts: '**/api/social/posts',
    postById: '**/api/social/posts/*',
    insightsSummary: '**/api/social/insights/summary',
  },
} as const
