import { expect, type Locator, type Page } from '@playwright/test'
import { AuthorLandingsLocators } from '../locators/author-landings.locators'

/**
 * Page Object Model for Author Landings (Dashboard Editor + Public Landing)
 * Encapsulates author landing interactions and assertions.
 */
export class AuthorLandingsPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // ============================================================================
  // DASHBOARD EDITOR METHODS
  // ============================================================================

  /**
   * Wait for author select dropdown to be visible
   */
  async waitForAuthorSelect(timeout = 5000) {
    await expect(
      this.page.locator(AuthorLandingsLocators.dashboard.authorSelectDropdown),
    ).toBeVisible({ timeout })
  }

  /**
   * Select an author from dropdown by name
   */
  async selectAuthor(authorName: string) {
    // Click trigger to open dropdown
    const trigger = this.page.locator(AuthorLandingsLocators.dashboard.authorSelectTrigger)
    await trigger.click()

    // Wait for content to appear
    await this.page.waitForSelector(AuthorLandingsLocators.dashboard.authorSelectContent, {
      timeout: 5000,
    })

    // Find and click the option matching authorName
    const option = this.page.locator(`[role="option"]:has-text("${authorName}")`).first()
    await option.click()

    // Verify selection took
    await expect(option).toHaveAttribute('aria-selected', 'true')
  }

  /**
   * Upload author image via file input
   */
  async uploadAuthorImage(filePath: string) {
    const fileInput = this.page.locator(AuthorLandingsLocators.dashboard.authorImageInput)
    await fileInput.setInputFiles(filePath)

    // Wait for preview to appear
    await expect(
      this.page.locator(AuthorLandingsLocators.dashboard.authorImagePreview),
    ).toBeVisible({
      timeout: 5000,
    })
  }

  /**
   * Set custom prompt textarea value
   */
  async setCustomPrompt(prompt: string) {
    const textarea = this.page.locator(AuthorLandingsLocators.dashboard.authorPromptTextarea)
    await textarea.fill(prompt)
    await expect(textarea).toHaveValue(prompt)
  }

  /**
   * Clear custom prompt
   */
  async clearCustomPrompt() {
    const textarea = this.page.locator(AuthorLandingsLocators.dashboard.authorPromptTextarea)
    await textarea.clear()
  }

  /**
   * Click Generate button to start generation
   */
  async clickGenerate() {
    const button = this.page.locator(AuthorLandingsLocators.dashboard.authorGenerateBtn)
    await expect(button).toBeEnabled()
    await button.click()
  }

  /**
   * Click Regenerate button
   */
  async clickRegenerate() {
    const button = this.page.locator(AuthorLandingsLocators.dashboard.authorRegenerateBtn)
    await expect(button).toBeEnabled()
    await button.click()
  }

  /**
   * Click Publish button
   */
  async clickPublish() {
    const button = this.page.locator(AuthorLandingsLocators.dashboard.authorPublishBtn)
    await expect(button).toBeEnabled()
    await button.click()
  }

  /**
   * Wait for preview to appear with content
   */
  async waitForPreview(timeout = 10000) {
    const container = this.page.locator(AuthorLandingsLocators.preview.container)
    await expect(container).toBeVisible({ timeout })
  }

  /**
   * Verify preview contains text
   */
  async verifyPreviewText(text: string) {
    const container = this.page.locator(AuthorLandingsLocators.preview.container)
    await expect(container).toContainText(text)
  }

  /**
   * Get current status badge text
   */
  async getStatus(): Promise<string | null> {
    const badge = this.page.locator(AuthorLandingsLocators.dashboard.authorStatusBadge)
    try {
      return await badge.textContent()
    } catch {
      return null
    }
  }

  /**
   * Wait for status to change to published
   */
  async waitForPublished(timeout = 10000) {
    await expect(
      this.page.locator(AuthorLandingsLocators.dashboard.authorStatusBadge),
    ).toContainText(/published|publicado/i, { timeout })
  }

  /**
   * Wait for generation to complete (loading spinner disappears)
   */
  async waitForGenerationComplete(timeout = 15000) {
    const spinner = this.page.locator(AuthorLandingsLocators.dashboard.authorGeneratingSpinner)
    await expect(spinner).not.toBeVisible({ timeout })
  }

  // ============================================================================
  // PUBLIC LANDING PAGE METHODS
  // ============================================================================

  /**
   * Navigate to author public landing
   */
  async navigateToPublicLanding(locale: string, tenantSlug: string, authorSlug: string) {
    const url = `/${locale}/${tenantSlug}/a/${authorSlug}`
    await this.page.goto(url)
  }

  /**
   * Wait for hero section to be visible
   */
  async waitForHero(timeout = 5000) {
    await expect(this.page.locator(AuthorLandingsLocators.public.heroSection)).toBeVisible({
      timeout,
    })
  }

  /**
   * Verify hero headline text
   */
  async verifyHeroHeadline(expectedText: string) {
    const headline = this.page.locator(AuthorLandingsLocators.public.heroHeadline)
    await expect(headline).toContainText(expectedText)
  }

  /**
   * Verify hero subheadline text
   */
  async verifyHeroSubheadline(expectedText: string) {
    const subheadline = this.page.locator(AuthorLandingsLocators.public.heroSubheadline).first()
    await expect(subheadline).toContainText(expectedText)
  }

  /**
   * Verify author image is visible
   */
  async verifyAuthorImageVisible() {
    const img = this.page.locator(AuthorLandingsLocators.public.authorImage)
    await expect(img).toBeVisible()
  }

  /**
   * Verify author image src contains expected path
   */
  async verifyAuthorImageSrc(expectedPath: string) {
    const img = this.page.locator(AuthorLandingsLocators.public.authorImage + ' img')
    await expect(img).toHaveAttribute('src', new RegExp(expectedPath))
  }

  /**
   * Verify bio section is visible
   */
  async verifyBioVisible() {
    const section = this.page.locator(AuthorLandingsLocators.public.bioSection)
    await expect(section).toBeVisible()
  }

  /**
   * Verify bio title (author name)
   */
  async verifyBioTitle(expectedText: string) {
    const title = this.page.locator(AuthorLandingsLocators.public.bioTitle)
    await expect(title).toContainText(expectedText)
  }

  /**
   * Verify bio text (long bio)
   */
  async verifyBioText(expectedText: string) {
    const text = this.page.locator(AuthorLandingsLocators.public.bioText)
    await expect(text).toContainText(expectedText)
  }

  /**
   * Verify CTA button is visible
   */
  async verifyCTAVisible() {
    const button = this.page.locator(AuthorLandingsLocators.public.ctaButton)
    await expect(button).toBeVisible()
  }

  /**
   * Verify CTA button text
   */
  async verifyCTAText(expectedText: string) {
    const button = this.page.locator(AuthorLandingsLocators.public.ctaButton)
    await expect(button).toContainText(expectedText)
  }

  /**
   * Verify CTA button links to storefront
   */
  async verifyCTAHref(expectedHref: string | RegExp) {
    const button = this.page.locator(AuthorLandingsLocators.public.ctaButton)
    await expect(button).toHaveAttribute('href', expectedHref)
  }

  /**
   * Verify page returns 404 (unpublished landing)
   */
  async verifyNotFound() {
    // Check for 404 status code
    const response = await this.page.goto(this.page.url(), { waitUntil: 'load' })
    expect(response?.status()).toBe(404)
  }

  /**
   * Get CTA button href
   */
  async getCTAHref(): Promise<string | null> {
    const button = this.page.locator(AuthorLandingsLocators.public.ctaButton)
    return await button.getAttribute('href')
  }
}
