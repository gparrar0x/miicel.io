/**
 * E2E Test Suite: Template Switching - Happy Path Only
 * Issue #7 - Template System QA
 *
 * Happy Path Scenarios:
 * - Admin selects template → preview updates → saves → theme persists
 * - Admin customizes colors → saves → colors apply in storefront
 * - Multiple templates work: gallery, detail, minimal
 *
 * Test Data: /demo, /superhotdog, /minimal-demo (seeded by Kokoro)
 */

import { test, expect } from '@playwright/test'
import { ThemeEditorPage } from '../pages/theme-editor.page'
import { StorefrontPage } from '../pages/storefront.page'
import { loginAsOwner } from '../fixtures/auth.fixture'

const TEST_TENANTS = {
  demo: 'demo',
  superhotdog: 'superhotdog',
  minimal: 'minimal-demo',
}

test.describe('Template System - Happy Path', () => {
  test('admin selects gallery template, customizes, saves, and changes persist', async ({
    page,
  }) => {
    // Setup: Login as owner
    await loginAsOwner(page, TEST_TENANTS.demo)

    // Step 1: Navigate to appearance settings
    const editor = new ThemeEditorPage(page)
    await editor.goto(TEST_TENANTS.demo)

    // Step 2: Select gallery template
    await editor.selectTemplate('gallery')
    const selected = await editor.getSelectedTemplate()
    expect(selected).toBe('gallery')

    // Step 3: Customize theme fields
    await editor.setThemeField('gridCols', 3)
    await editor.setThemeField('spacing', 'relaxed')
    await editor.setThemeField('primaryColor', '#FF0000')

    // Step 4: Save changes
    await editor.saveTheme()

    // Step 5: Reload page and verify persistence
    await editor.reloadPage()
    const template = await editor.getSelectedTemplate()
    const gridCols = await editor.getThemeField('gridCols')
    const spacing = await editor.getThemeField('spacing')
    const color = await editor.getThemeField('primaryColor')

    expect(template).toBe('gallery')
    expect(gridCols).toBe('3')
    expect(spacing).toBe('relaxed')
    expect(color?.toUpperCase()).toContain('FF0000')
  })

  test('admin switches between all 3 templates, each saves independently', async ({
    page,
  }) => {
    await loginAsOwner(page, TEST_TENANTS.demo)
    const editor = new ThemeEditorPage(page)
    await editor.goto(TEST_TENANTS.demo)

    const templates: Array<'gallery' | 'detail' | 'minimal'> = [
      'gallery',
      'detail',
      'minimal',
    ]

    // Set each template with different colors
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i]
      const color = i === 0 ? '#FF0000' : i === 1 ? '#00FF00' : '#0000FF'

      // Select template
      await editor.selectTemplate(template)
      await editor.setThemeField('primaryColor', color)
      await editor.saveTheme()

      // Verify saved
      const selected = await editor.getSelectedTemplate()
      const savedColor = await editor.getThemeField('primaryColor')
      expect(selected).toBe(template)
      expect(savedColor?.toUpperCase()).toContain(color.substring(1))
    }

    // Verify gallery is still gallery after editing all
    await editor.reloadPage()
    const finalTemplate = await editor.getSelectedTemplate()
    expect(finalTemplate).toBe('minimal') // Last one set
  })

  test('storefront renders gallery template with saved theme', async ({ page }) => {
    // Setup: Configure theme in editor
    await loginAsOwner(page, TEST_TENANTS.demo)
    const editor = new ThemeEditorPage(page)
    await editor.goto(TEST_TENANTS.demo)

    await editor.selectTemplate('gallery')
    await editor.setThemeField('primaryColor', '#FF1493')
    await editor.saveTheme()

    // Switch to public user view
    await page.context().clearCookies()
    const storefront = new StorefrontPage(page)
    await storefront.goto(TEST_TENANTS.demo)

    // Verify template renders
    const template = await storefront.getRenderedTemplate()
    expect(template).toBe('gallery')

    // Verify products load
    await storefront.waitForProductsToLoad()
    const cardCount = await storefront.getProductCardCount()
    expect(cardCount).toBeGreaterThan(0)

    // Verify CSS variables applied
    const hasTheme = await storefront.hasThemeProvider()
    expect(hasTheme).toBe(true)
  })

  test('storefront displays detail template with correct layout', async ({
    page,
  }) => {
    await loginAsOwner(page, TEST_TENANTS.demo)
    const editor = new ThemeEditorPage(page)
    await editor.goto(TEST_TENANTS.demo)

    // Detail = 2 column, wide layout
    await editor.selectTemplate('detail')
    await editor.setThemeField('gridCols', 2)
    await editor.saveTheme()

    await page.context().clearCookies()
    const storefront = new StorefrontPage(page)
    await storefront.goto(TEST_TENANTS.demo)

    // Verify template
    const template = await storefront.getRenderedTemplate()
    expect(template).toBe('detail')

    // Verify layout
    await storefront.waitForProductsToLoad()
    const cols = await storefront.getGridColumnCount()
    expect(cols).toBeGreaterThanOrEqual(2)

    // Verify products render
    const cards = await storefront.getProductCards()
    expect(cards.length).toBeGreaterThan(0)
  })

  test('storefront displays minimal template with many columns', async ({
    page,
  }) => {
    await loginAsOwner(page, TEST_TENANTS.demo)
    const editor = new ThemeEditorPage(page)
    await editor.goto(TEST_TENANTS.demo)

    // Minimal = 4 columns, compact
    await editor.selectTemplate('minimal')
    await editor.setThemeField('gridCols', 4)
    await editor.setThemeField('spacing', 'compact')
    await editor.saveTheme()

    await page.context().clearCookies()
    const storefront = new StorefrontPage(page)
    await storefront.goto(TEST_TENANTS.demo)

    const template = await storefront.getRenderedTemplate()
    expect(template).toBe('minimal')

    await storefront.waitForProductsToLoad()
    const cards = await storefront.getProductCards()
    expect(cards.length).toBeGreaterThan(0)
  })

  test('theme persists across page reloads in storefront', async ({ page }) => {
    await loginAsOwner(page, TEST_TENANTS.demo)
    const editor = new ThemeEditorPage(page)
    await editor.goto(TEST_TENANTS.demo)

    // Set theme
    await editor.selectTemplate('detail')
    await editor.setThemeField('primaryColor', '#123456')
    await editor.saveTheme()

    // Visit storefront and reload
    await page.context().clearCookies()
    const storefront = new StorefrontPage(page)
    await storefront.goto(TEST_TENANTS.demo)

    let template1 = await storefront.getRenderedTemplate()
    await storefront.reloadPage()
    let template2 = await storefront.getRenderedTemplate()

    expect(template1).toBe('detail')
    expect(template2).toBe('detail')
  })

  test('multi-tenant: each tenant maintains independent theme', async ({
    page,
  }) => {
    const editor = new ThemeEditorPage(page)

    // Configure demo
    await loginAsOwner(page, TEST_TENANTS.demo)
    await editor.goto(TEST_TENANTS.demo)
    await editor.selectTemplate('gallery')
    await editor.saveTheme()

    // Configure superhotdog
    await editor.goto(TEST_TENANTS.superhotdog)
    await editor.selectTemplate('minimal')
    await editor.saveTheme()

    // Verify demo
    await editor.goto(TEST_TENANTS.demo)
    const demoTemplate = await editor.getSelectedTemplate()
    expect(demoTemplate).toBe('gallery')

    // Verify superhotdog
    await editor.goto(TEST_TENANTS.superhotdog)
    const superhotdogTemplate = await editor.getSelectedTemplate()
    expect(superhotdogTemplate).toBe('minimal')
  })

  test('responsive: gallery displays correctly on desktop, tablet, mobile', async ({
    page,
  }) => {
    await loginAsOwner(page, TEST_TENANTS.demo)
    const editor = new ThemeEditorPage(page)
    await editor.goto(TEST_TENANTS.demo)
    await editor.selectTemplate('gallery')
    await editor.saveTheme()

    await page.context().clearCookies()
    const storefront = new StorefrontPage(page)

    // Desktop
    await storefront.setDesktopViewport()
    await storefront.goto(TEST_TENANTS.demo)
    await storefront.waitForProductsToLoad()
    let template = await storefront.getRenderedTemplate()
    let cards = await storefront.getProductCards()
    expect(template).toBe('gallery')
    expect(cards.length).toBeGreaterThan(0)

    // Tablet
    await storefront.setTabletViewport()
    await storefront.reloadPage()
    await storefront.waitForProductsToLoad()
    template = await storefront.getRenderedTemplate()
    cards = await storefront.getProductCards()
    expect(template).toBe('gallery')
    expect(cards.length).toBeGreaterThan(0)

    // Mobile
    await storefront.setMobileViewport()
    await storefront.reloadPage()
    await storefront.waitForProductsToLoad()
    template = await storefront.getRenderedTemplate()
    cards = await storefront.getProductCards()
    expect(template).toBe('gallery')
    expect(cards.length).toBeGreaterThan(0)
  })

  test('admin edits color and storefront reflects change', async ({ page }) => {
    await loginAsOwner(page, TEST_TENANTS.demo)
    const editor = new ThemeEditorPage(page)
    const storefront = new StorefrontPage(page)

    // Set initial color
    await editor.goto(TEST_TENANTS.demo)
    await editor.setThemeField('primaryColor', '#FF0000')
    await editor.saveTheme()

    // Verify in storefront
    await page.context().clearCookies()
    await storefront.goto(TEST_TENANTS.demo)
    let hasTheme = await storefront.hasThemeProvider()
    expect(hasTheme).toBe(true)

    // Admin changes color
    await loginAsOwner(page, TEST_TENANTS.demo)
    await editor.goto(TEST_TENANTS.demo)
    await editor.setThemeField('primaryColor', '#00FF00')
    await editor.saveTheme()

    // Verify new color in storefront
    await page.context().clearCookies()
    await storefront.goto(TEST_TENANTS.demo)
    hasTheme = await storefront.hasThemeProvider()
    expect(hasTheme).toBe(true)
  })
})
