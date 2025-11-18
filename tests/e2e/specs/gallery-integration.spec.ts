import { test, expect } from '@playwright/test'

test('Gallery template loads without runtime errors', async ({ page }) => {
  // Navigate to artmonkeys (gallery template)
  await page.goto('http://localhost:3000/artmonkeys')
  
  // Wait for products grid to load
  await page.waitForSelector('[data-testid="product-grid"]', { timeout: 10000 })
  
  // Verify no console errors
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  // Verify grid is visible
  const grid = page.locator('[data-testid="product-grid"]')
  await expect(grid).toBeVisible()
  
  // Verify at least one product card
  const cards = page.locator('[data-testid="product-card-gallery"]')
  const count = await cards.count()
  expect(count).toBeGreaterThan(0)
  
  // Verify Quick View button exists and has gold color
  const quickViewButton = cards.first().locator('[data-testid="action-quickview"]')
  await expect(quickViewButton).toBeVisible()
  
  const color = await quickViewButton.evaluate(el => {
    return window.getComputedStyle(el).backgroundColor
  })
  
  console.log('Quick View color:', color)
  expect(color).toBe('rgb(184, 134, 11)') // GOLD
  
  // Report any console errors
  if (errors.length > 0) {
    console.error('Console errors found:', errors)
    throw new Error(`Found ${errors.length} console errors`)
  }
})

test('Quick View button navigates to product page', async ({ page }) => {
  await page.goto('http://localhost:3000/artmonkeys')
  
  // Wait for grid
  await page.waitForSelector('[data-testid="product-grid"]')
  
  // Click first Quick View button
  const firstCard = page.locator('[data-testid="product-card-gallery"]').first()
  const quickViewButton = firstCard.locator('[data-testid="action-quickview"]')
  
  await quickViewButton.click()
  
  // Wait for navigation
  await page.waitForURL(/\/artmonkeys\/product\/\d+/)
  
  // Verify URL matches pattern
  const url = page.url()
  expect(url).toMatch(/\/artmonkeys\/product\/\d+/)
})
