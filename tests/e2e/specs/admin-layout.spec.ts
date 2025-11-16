import { test, expect } from '@playwright/test'
import { AdminLayoutPage } from '../pages/admin-layout.page'
import { loginAsOwner, loginAsNonOwner, logout } from '../fixtures/auth.fixture'

/**
 * E2E Test Suite: Admin Dashboard Layout (SKY-6)
 *
 * Covers:
 * - Sidebar navigation and rendering
 * - Auth guard (redirect non-owners)
 * - Responsive behavior (mobile toggle)
 * - Active route highlighting
 * - Logout flow
 * - Unauthenticated redirects
 *
 * Test Data:
 * - Owner: owner@test.com (has admin access)
 * - Non-Owner: nonowner@test.com (redirect to public)
 * - Tenant: test-store
 */

test.describe('Admin Layout - SKY-6', () => {
  test.describe('Navigation & Rendering', () => {
    test('should render admin sidebar with all nav items', async ({ page }) => {
      await loginAsOwner(page)
      const adminPage = new AdminLayoutPage(page)
      await adminPage.goto()

      // Verify sidebar is visible
      await expect(adminPage.sidebar).toBeVisible()

      // Verify all navigation items are visible
      await expect(adminPage.navDashboard).toBeVisible()
      await expect(adminPage.navProducts).toBeVisible()
      await expect(adminPage.navOrders).toBeVisible()
      await expect(adminPage.navSettings).toBeVisible()
      await expect(adminPage.btnLogout).toBeVisible()

      // Verify nav items are enabled
      await expect(adminPage.navProducts).toBeEnabled()
      await expect(adminPage.navOrders).toBeEnabled()
      await expect(adminPage.navSettings).toBeEnabled()
    })

    test('should navigate to Products page', async ({ page }) => {
      await loginAsOwner(page)
      const adminPage = new AdminLayoutPage(page)
      await adminPage.goto()

      // Click products nav
      await adminPage.navigateToProducts()

      // Verify URL changed
      expect(page.url()).toContain('/dashboard/products')

      // Verify products is now active
      const isActive = await adminPage.isActiveRoute('products')
      expect(isActive).toBe(true)
    })

    test('should navigate to Orders page', async ({ page }) => {
      await loginAsOwner(page)
      const adminPage = new AdminLayoutPage(page)
      await adminPage.goto()

      // Click orders nav
      await adminPage.navigateToOrders()

      // Verify URL changed
      expect(page.url()).toContain('/dashboard/orders')

      // Verify orders is now active
      const isActive = await adminPage.isActiveRoute('orders')
      expect(isActive).toBe(true)
    })

    test('should navigate to Settings page', async ({ page }) => {
      await loginAsOwner(page)
      const adminPage = new AdminLayoutPage(page)
      await adminPage.goto()

      // Click settings nav
      await adminPage.navigateToSettings()

      // Verify URL changed
      expect(page.url()).toContain('/dashboard/settings')

      // Verify settings is now active
      const isActive = await adminPage.isActiveRoute('settings')
      expect(isActive).toBe(true)
    })

    test('should highlight active route correctly', async ({ page }) => {
      await loginAsOwner(page)
      const adminPage = new AdminLayoutPage(page)
      await adminPage.goto()

      // Dashboard should be active by default
      let dashboardActive = await adminPage.isActiveRoute('dashboard')
      let productsActive = await adminPage.isActiveRoute('products')
      expect(dashboardActive).toBe(true)
      expect(productsActive).toBe(false)

      // Navigate to products
      await adminPage.navigateToProducts()
      dashboardActive = await adminPage.isActiveRoute('dashboard')
      productsActive = await adminPage.isActiveRoute('products')
      expect(dashboardActive).toBe(false)
      expect(productsActive).toBe(true)

      // Navigate to orders
      await adminPage.navigateToOrders()
      productsActive = await adminPage.isActiveRoute('products')
      const ordersActive = await adminPage.isActiveRoute('orders')
      expect(productsActive).toBe(false)
      expect(ordersActive).toBe(true)
    })
  })

  test.describe('Logout Flow', () => {
    test('should logout successfully', async ({ page }) => {
      await loginAsOwner(page)
      const adminPage = new AdminLayoutPage(page)
      await adminPage.goto()

      // Click logout
      await adminPage.logout()

      // Verify redirected away from dashboard
      const url = page.url()
      expect(url).not.toContain('/dashboard')

      // Verify not authenticated (can't access dashboard)
      await page.goto('http://localhost:3000/test-store/dashboard')
      const finalUrl = page.url()
      expect(finalUrl).not.toContain('/dashboard')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('should hide sidebar on mobile and show with toggle', async ({ page }) => {
      await loginAsOwner(page)
      const adminPage = new AdminLayoutPage(page)

      // Set mobile viewport
      await adminPage.setMobileViewport()
      await adminPage.goto()

      // Sidebar should not be in viewport on mobile (hidden)
      let sidebarVisible = await adminPage.isSidebarInViewport()
      expect(sidebarVisible).toBe(false)

      // Toggle sidebar (open)
      await adminPage.toggleSidebarMobile()

      // Sidebar should now be visible
      sidebarVisible = await adminPage.isSidebarInViewport()
      expect(sidebarVisible).toBe(true)

      // Toggle sidebar (close)
      await adminPage.toggleSidebarMobile()

      // Sidebar should be hidden again
      sidebarVisible = await adminPage.isSidebarInViewport()
      expect(sidebarVisible).toBe(false)
    })

    test('should keep sidebar visible on desktop', async ({ page }) => {
      await loginAsOwner(page)
      const adminPage = new AdminLayoutPage(page)

      // Set desktop viewport
      await adminPage.setDesktopViewport()
      await adminPage.goto()

      // Sidebar should be visible on desktop
      const sidebarVisible = await adminPage.isSidebarInViewport()
      expect(sidebarVisible).toBe(true)
    })
  })

  test.describe('Auth Guard', () => {
    test('should redirect non-owner from dashboard', async ({ page }) => {
      await loginAsNonOwner(page)
      const adminPage = new AdminLayoutPage(page)

      // Try to navigate to dashboard
      await adminPage.goto()

      // Should be redirected to public page (not in dashboard)
      const url = page.url()
      expect(url).not.toContain('/dashboard')
    })

    test('should redirect unauthenticated user to login', async ({ page }) => {
      // Don't login, just try to access dashboard
      await page.goto('http://localhost:3000/test-store/dashboard')

      // Should be redirected away from dashboard
      const url = page.url()
      expect(url).not.toContain('/dashboard')
    })
  })
})
