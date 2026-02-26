import { expect, type Locator, type Page } from '@playwright/test'
import { AdminLayoutPage } from './admin-layout.page'

/**
 * Page Object Model for Products Dashboard
 * Encapsulates admin products page interactions
 */
export class ProductsDashboardPage {
  readonly page: Page
  readonly adminLayout: AdminLayoutPage
  readonly addProductBtn: Locator
  readonly productsTable: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    this.page = page
    this.adminLayout = new AdminLayoutPage(page)
    this.addProductBtn = page.locator('button:has-text("Add Product")')
    this.productsTable = page.locator('table')
    this.emptyState = page.locator('text=No products yet')
  }

  /**
   * Navigate to products dashboard
   */
  async goto(tenant: string = 'test-store') {
    await this.page.goto(`http://localhost:3000/${tenant}/dashboard/products`)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Click Add Product button to open form modal
   */
  async clickAddProduct() {
    await this.addProductBtn.click()
  }

  /**
   * Wait for products page to load
   */
  async waitForPageLoad(timeout = 5000) {
    await expect(this.page.locator('text=Products')).toBeVisible({ timeout })
  }

  /**
   * Check if product exists in list by name
   */
  async productExists(name: string): Promise<boolean> {
    try {
      await expect(this.page.locator(`text=${name}`)).toBeVisible({ timeout: 2000 })
      return true
    } catch {
      return false
    }
  }

  /**
   * Get product row by name
   */
  getProductRow(name: string): Locator {
    return this.page.locator(`tr:has-text("${name}")`)
  }

  /**
   * Click edit button on product row
   */
  async editProduct(name: string) {
    const row = this.getProductRow(name)
    await row.locator('button:has-text("Edit")').click()
  }

  /**
   * Delete product by name
   */
  async deleteProduct(name: string) {
    const row = this.getProductRow(name)
    const deleteBtn = row.locator('button:has-text("Delete")')
    await deleteBtn.click()
    // Confirm deletion if modal appears
    await this.page.locator('button:has-text("Delete")').last().click()
  }

  /**
   * Wait for product to appear in list
   */
  async waitForProductInList(name: string, timeout = 10000) {
    await expect(this.page.locator(`text=${name}`)).toBeVisible({ timeout })
  }

  /**
   * Get all product names visible on page
   */
  async getProductNames(): Promise<string[]> {
    const rows = await this.page.locator('tbody tr')
    const count = await rows.count()
    const names: string[] = []

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i)
      const nameCell = row.locator('td').first()
      const name = await nameCell.textContent()
      if (name) names.push(name.trim())
    }

    return names
  }
}
