import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object Model for Admin Dashboard Layout
 * Encapsulates all admin layout interactions and locators
 *
 * Data-testid contract:
 * - sidebar: admin layout sidebar container
 * - nav-dashboard: dashboard nav link
 * - nav-products: products nav link
 * - nav-orders: orders nav link
 * - nav-settings: settings nav link
 * - btn-logout: logout button
 * - btn-toggle-sidebar: mobile menu toggle
 */
export class AdminLayoutPage {
  readonly page: Page
  readonly sidebar: Locator
  readonly navDashboard: Locator
  readonly navProducts: Locator
  readonly navOrders: Locator
  readonly navSettings: Locator
  readonly btnLogout: Locator
  readonly btnSidebarToggle: Locator
  readonly mobileMenuOverlay: Locator

  constructor(page: Page) {
    this.page = page
    this.sidebar = page.getByTestId('admin-sidebar')
    this.navDashboard = page.getByTestId('nav-dashboard')
    this.navProducts = page.getByTestId('nav-products')
    this.navOrders = page.getByTestId('nav-orders')
    this.navSettings = page.getByTestId('nav-settings')
    this.btnLogout = page.getByTestId('btn-logout')
    this.btnSidebarToggle = page.getByTestId('btn-toggle-sidebar')
    this.mobileMenuOverlay = page.locator('div[class*="bg-black"][class*="bg-opacity-50"]')
  }

  /**
   * Navigate to dashboard page
   * @param tenant - Tenant slug
   */
  async goto(tenant: string = 'test-store') {
    await this.page.goto(`http://localhost:3000/${tenant}/dashboard`)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Navigate to dashboard/products
   */
  async navigateToProducts() {
    await this.navProducts.click()
    await this.page.waitForURL(/\/dashboard\/products/)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Navigate to dashboard/orders
   */
  async navigateToOrders() {
    await this.navOrders.click()
    await this.page.waitForURL(/\/dashboard\/orders/)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Navigate to dashboard/settings
   */
  async navigateToSettings() {
    await this.navSettings.click()
    await this.page.waitForURL(/\/dashboard\/settings/)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Navigate to dashboard (home)
   */
  async navigateToDashboard() {
    await this.navDashboard.click()
    await this.page.waitForURL(/\/dashboard\/?$/)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Click logout button and wait for redirect
   */
  async logout() {
    await this.btnLogout.click()
    // Wait for redirect to public page or login
    await this.page.waitForURL(/\/(login|test-store)/, { waitUntil: 'networkidle' })
  }

  /**
   * Toggle sidebar on mobile
   */
  async toggleSidebarMobile() {
    await this.btnSidebarToggle.click()
    // Wait for sidebar animation
    await this.page.waitForTimeout(300)
  }

  /**
   * Check if nav item is active
   * @param route - Route name (dashboard, products, orders, settings)
   * @returns true if route is active
   */
  async isActiveRoute(route: 'dashboard' | 'products' | 'orders' | 'settings'): Promise<boolean> {
    const locator = route === 'dashboard'
      ? this.navDashboard
      : route === 'products'
      ? this.navProducts
      : route === 'orders'
      ? this.navOrders
      : this.navSettings

    const classList = await locator.getAttribute('class')
    // Check for active indicator classes (bg-blue-50, text-blue-700)
    return classList?.includes('bg-blue') || classList?.includes('text-blue') || false
  }

  /**
   * Check if sidebar is visible
   */
  async isSidebarVisible(): Promise<boolean> {
    return await this.sidebar.isVisible()
  }

  /**
   * Check if mobile menu is open
   */
  async isMobileMenuOpen(): Promise<boolean> {
    // Check if sidebar is visible (mobile menu is open when sidebar is visible on mobile)
    const sidebar = await this.sidebar.boundingBox()
    return sidebar !== null && sidebar.x >= 0
  }

  /**
   * Get current URL pathname
   */
  getCurrentPath(): string {
    return new URL(this.page.url()).pathname
  }

  /**
   * Get tenant slug from URL
   */
  getTenantSlug(): string {
    const parts = this.getCurrentPath().split('/').filter(Boolean)
    return parts[0]
  }

  /**
   * Wait for sidebar to be visible with timeout
   */
  async waitForSidebar(timeout = 5000) {
    await expect(this.sidebar).toBeVisible({ timeout })
  }

  /**
   * Wait for sidebar to be hidden with timeout
   */
  async waitForSidebarHidden(timeout = 5000) {
    await expect(this.sidebar).not.toBeVisible({ timeout })
  }

  /**
   * Click outside mobile menu to close
   */
  async closeMobileMenu() {
    if (await this.mobileMenuOverlay.isVisible()) {
      await this.mobileMenuOverlay.click()
      await this.page.waitForTimeout(300)
    }
  }

  /**
   * Get viewport size
   */
  async getViewportSize() {
    return await this.page.viewportSize()
  }

  /**
   * Set viewport to mobile size (iPhone 12)
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 390, height: 844 })
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Set viewport to desktop size
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 })
    await this.page.waitForLoadState('networkidle')
  }
}
