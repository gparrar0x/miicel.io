/**
 * Page Object Model for Content Generation (Content Pipeline)
 *
 * Encapsulates all interactions with the content generation feature:
 * - Opening config panel & filling generation options
 * - Monitoring progress steps
 * - Interacting with asset gallery
 * - Browsing generation history
 * - Checking usage quota
 * - API route mocking helpers
 */

import { expect, type Page } from '@playwright/test'
import { ContentGenerationLocators } from '../locators/content-generation.locators'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerationConfig {
  prompt: string
  quality?: string
  ratio?: string
  imageCount?: string
  enableVideo?: boolean
  enableReels?: boolean
}

export interface UsageData {
  images_used: number
  videos_used: number
  images_limit: number
  videos_limit: number
  plan: string
}

export interface GenerationJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  assets?: Array<{ type: string; url: string }>
}

// ---------------------------------------------------------------------------
// Page Object
// ---------------------------------------------------------------------------

export class ContentGenerationPage {
  readonly page: Page
  private readonly loc = ContentGenerationLocators

  constructor(page: Page) {
    this.page = page
  }

  // ==========================================================================
  // NAVIGATION
  // ==========================================================================

  async navigate(tenantSlug: string, locale = 'es') {
    await this.page.goto(`/${locale}/${tenantSlug}/admin/content`)
    await this.page.waitForLoadState('networkidle')
  }

  // ==========================================================================
  // CONFIG PANEL
  // ==========================================================================

  async clickGenerate() {
    await this.page.getByTestId('generate-content-btn').click()
  }

  async assertConfigPanelVisible() {
    await expect(this.page.getByTestId('generation-config-panel')).toBeVisible({ timeout: 5000 })
  }

  async fillPrompt(text: string) {
    const input = this.page.getByTestId('generation-prompt-input')
    await expect(input).toBeVisible({ timeout: 5000 })
    await input.clear()
    await input.fill(text)
  }

  async selectQuality(value: string) {
    const select = this.page.getByTestId('generation-quality-select')
    await expect(select).toBeVisible({ timeout: 3000 })
    await select.selectOption(value)
  }

  async selectRatio(value: string) {
    const select = this.page.getByTestId('generation-ratio-select')
    await expect(select).toBeVisible({ timeout: 3000 })
    await select.selectOption(value)
  }

  async setImageCount(value: string) {
    const input = this.page.getByTestId('generation-image-count')
    await expect(input).toBeVisible({ timeout: 3000 })
    await input.clear()
    await input.fill(value)
  }

  async toggleVideo(enable: boolean) {
    const toggle = this.page.getByTestId('generation-video-toggle')
    await expect(toggle).toBeVisible({ timeout: 3000 })
    const checked = await toggle.isChecked()
    if (checked !== enable) {
      await toggle.click()
    }
  }

  async toggleReels(enable: boolean) {
    const toggle = this.page.getByTestId('generation-reels-toggle')
    await expect(toggle).toBeVisible({ timeout: 3000 })
    const checked = await toggle.isChecked()
    if (checked !== enable) {
      await toggle.click()
    }
  }

  async isReelsToggleEnabled(): Promise<boolean> {
    const toggle = this.page.getByTestId('generation-reels-toggle')
    const disabled = await toggle.isDisabled()
    return !disabled
  }

  async confirmGeneration() {
    const btn = this.page.getByTestId('generation-confirm-btn')
    await expect(btn).toBeVisible({ timeout: 5000 })
    await btn.click()
  }

  async isConfirmDisabled(): Promise<boolean> {
    return await this.page.getByTestId('generation-confirm-btn').isDisabled()
  }

  /**
   * Fill config panel with all options and confirm
   */
  async configureAndGenerate(config: GenerationConfig) {
    await this.fillPrompt(config.prompt)
    if (config.quality) await this.selectQuality(config.quality)
    if (config.ratio) await this.selectRatio(config.ratio)
    if (config.imageCount) await this.setImageCount(config.imageCount)
    if (config.enableVideo !== undefined) await this.toggleVideo(config.enableVideo)
    if (config.enableReels !== undefined) await this.toggleReels(config.enableReels)
    await this.confirmGeneration()
  }

  // ==========================================================================
  // PROGRESS TRACKING
  // ==========================================================================

  async assertProgressVisible() {
    await expect(this.page.getByTestId('generation-progress')).toBeVisible({ timeout: 10000 })
  }

  async getStatusBadgeText(): Promise<string> {
    const badge = this.page.getByTestId('progress-status-badge')
    await expect(badge).toBeVisible({ timeout: 5000 })
    return (await badge.textContent()) ?? ''
  }

  async assertStepImagesVisible() {
    await expect(this.page.getByTestId('progress-step-images')).toBeVisible({ timeout: 5000 })
  }

  async assertStepVideoVisible() {
    await expect(this.page.getByTestId('progress-step-video')).toBeVisible({ timeout: 5000 })
  }

  async assertStepReelsVisible() {
    await expect(this.page.getByTestId('progress-step-reels')).toBeVisible({ timeout: 5000 })
  }

  async cancelGeneration() {
    const btn = this.page.getByTestId('progress-cancel-btn')
    await expect(btn).toBeVisible({ timeout: 5000 })
    await btn.click()
  }

  async assertErrorVisible() {
    await expect(this.page.getByTestId('progress-error')).toBeVisible({ timeout: 5000 })
  }

  async getErrorText(): Promise<string> {
    const el = this.page.getByTestId('progress-error')
    await expect(el).toBeVisible({ timeout: 5000 })
    return (await el.textContent()) ?? ''
  }

  // ==========================================================================
  // ASSET GALLERY
  // ==========================================================================

  async assertGalleryVisible() {
    await expect(this.page.getByTestId('asset-gallery')).toBeVisible({ timeout: 10000 })
  }

  async assertImageCardVisible(index: number) {
    await expect(this.page.locator(this.loc.gallery.imageCard(index))).toBeVisible({
      timeout: 5000,
    })
  }

  async assertVideoCardVisible(index: number) {
    await expect(this.page.locator(this.loc.gallery.videoCard(index))).toBeVisible({
      timeout: 5000,
    })
  }

  async assertReelCardVisible(index: number) {
    await expect(this.page.locator(this.loc.gallery.reelCard(index))).toBeVisible({ timeout: 5000 })
  }

  async clickDownloadAsset() {
    const btn = this.page.getByTestId('download-asset-btn')
    await expect(btn).toBeVisible({ timeout: 5000 })
    await btn.click()
  }

  async clickDownloadAll() {
    const btn = this.page.getByTestId('download-all-btn')
    await expect(btn).toBeVisible({ timeout: 5000 })
    await btn.click()
  }

  async isDownloadAllVisible(): Promise<boolean> {
    return await this.page
      .getByTestId('download-all-btn')
      .isVisible({ timeout: 2000 })
      .catch(() => false)
  }

  // ==========================================================================
  // GENERATION HISTORY
  // ==========================================================================

  async assertHistoryVisible() {
    await expect(this.page.getByTestId('generation-history')).toBeVisible({ timeout: 5000 })
  }

  async isHistoryVisible(): Promise<boolean> {
    return await this.page
      .getByTestId('generation-history')
      .isVisible({ timeout: 2000 })
      .catch(() => false)
  }

  async assertHistoryItemVisible(index: number) {
    await expect(this.page.locator(this.loc.history.item(index))).toBeVisible({ timeout: 5000 })
  }

  async toggleHistoryItem(index: number) {
    const toggle = this.page.locator(this.loc.history.itemToggle(index))
    await expect(toggle).toBeVisible({ timeout: 5000 })
    await toggle.click()
  }

  // ==========================================================================
  // USAGE QUOTA
  // ==========================================================================

  async assertQuotaVisible() {
    await expect(this.page.getByTestId('generation-usage-quota')).toBeVisible({ timeout: 5000 })
  }

  async getQuotaText(): Promise<string> {
    const el = this.page.getByTestId('generation-usage-quota')
    await expect(el).toBeVisible({ timeout: 5000 })
    return (await el.textContent()) ?? ''
  }

  // ==========================================================================
  // API MOCKING HELPERS
  // ==========================================================================

  /**
   * Mock POST /api/content/generate → 202
   */
  async mockGenerateSuccess(jobId = 'job-001') {
    await this.page.route(this.loc.api.generate, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 202,
          contentType: 'application/json',
          body: JSON.stringify({
            generation: { id: jobId, status: 'pending' },
          }),
        })
      } else {
        await route.continue()
      }
    })
  }

  /**
   * Mock POST /api/content/generate → 500
   */
  async mockGenerateError(status = 500, message = 'Internal Server Error') {
    await this.page.route(this.loc.api.generate, async (route) => {
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
   * Mock GET /api/content/jobs/[id] with sequential status transitions.
   * First call returns processing, subsequent calls return completed with assets.
   */
  async mockJobPolling(jobId = 'job-001', finalAssets: GenerationJob['assets'] = []) {
    let callCount = 0
    await this.page.route(this.loc.api.jobStatus, async (route) => {
      if (route.request().method() === 'GET') {
        callCount++
        const isComplete = callCount >= 2
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: jobId,
            status: isComplete ? 'completed' : 'processing',
            assets: isComplete ? finalAssets : [],
          }),
        })
      } else {
        await route.continue()
      }
    })
  }

  /**
   * Mock GET /api/content/jobs/[id] → failed
   */
  async mockJobFailed(jobId = 'job-001') {
    await this.page.route(this.loc.api.jobStatus, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: jobId,
            status: 'failed',
            error: 'Provider error: generation failed',
            assets: [],
          }),
        })
      } else {
        await route.continue()
      }
    })
  }

  /**
   * Mock DELETE /api/content/jobs/[id] → cancelled
   */
  async mockCancelJob(jobId = 'job-001') {
    await this.page.route(this.loc.api.cancelJob, async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            generation: { id: jobId, status: 'cancelled' },
          }),
        })
      } else {
        await route.continue()
      }
    })
  }

  /**
   * Mock GET /api/content/history
   */
  async mockHistory(generations: Array<Record<string, unknown>> = [], total = 0) {
    await this.page.route(this.loc.api.history, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ generations, total }),
      })
    })
  }

  /**
   * Mock GET /api/content/usage
   */
  async mockUsage(data: UsageData) {
    await this.page.route(this.loc.api.usage, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      })
    })
  }

  /**
   * Mock GET /api/content/usage → exhausted quota
   */
  async mockUsageExhausted() {
    await this.mockUsage({
      images_used: 100,
      videos_used: 10,
      images_limit: 100,
      videos_limit: 10,
      plan: 'starter',
    })
  }
}
