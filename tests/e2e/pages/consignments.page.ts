/**
 * Consignments Dashboard Page Object
 *
 * Reusable methods for testing consignment management flows.
 * Encapsulates all interaction logic, delegates selectors to locators.
 *
 * Usage:
 *   const page = new ConsignmentsPage(playwrightPage)
 *   await page.navigateToDashboard()
 *   await page.createLocation({ name: 'Gallery X', city: 'Madrid' })
 */

import { expect, type Page } from '@playwright/test'
import { CONSIGNMENTS } from '../locators/consignments.locators'

export interface CreateLocationData {
  name: string
  city: string
  country: string
  address?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  description?: string
}

export interface AssignArtworkData {
  productId: string
  status?: 'in_gallery' | 'in_transit' | 'sold' | 'returned' | 'pending'
  notes?: string
}

export class ConsignmentsPage {
  constructor(private page: Page) {}

  // ========== NAVIGATION ==========

  private getBaseUrl(): string {
    const baseURL = (this.page.context() as any).baseURL || 'http://localhost:3000'
    return baseURL
  }

  async navigateToDashboard(tenantSlug: string = 'demo_galeria') {
    const baseURL = this.getBaseUrl()
    const url = `${baseURL}/es/${tenantSlug}/dashboard/consignments`
    await this.page.goto(url)
    await this.page.waitForURL(url)
  }

  async navigateToLocation(tenantSlug: string, locationId: string) {
    const baseURL = this.getBaseUrl()
    const url = `${baseURL}/es/${tenantSlug}/dashboard/consignments/locations/${locationId}`
    await this.page.goto(url)
    await this.page.waitForURL(url)
  }

  // ========== OVERVIEW TAB ==========

  async getOverviewStats() {
    const totalWorks = await this.page
      .getByTestId(CONSIGNMENTS.OVERVIEW.STATS.TOTAL_WORKS)
      .textContent()
    const activeLocations = await this.page
      .getByTestId(CONSIGNMENTS.OVERVIEW.STATS.ACTIVE_LOCATIONS)
      .textContent()
    const worksInGallery = await this.page
      .getByTestId(CONSIGNMENTS.OVERVIEW.STATS.WORKS_IN_GALLERY)
      .textContent()
    const soldThisMonth = await this.page
      .getByTestId(CONSIGNMENTS.OVERVIEW.STATS.SOLD_THIS_MONTH)
      .textContent()

    return {
      totalWorks: parseInt(totalWorks || '0', 10),
      activeLocations: parseInt(activeLocations || '0', 10),
      worksInGallery: parseInt(worksInGallery || '0', 10),
      soldThisMonth: parseInt(soldThisMonth || '0', 10),
    }
  }

  async verifyOverviewVisible() {
    const container = this.page.getByTestId(CONSIGNMENTS.OVERVIEW.CONTAINER)
    await expect(container).toBeVisible()
  }

  // ========== LOCATIONS LIST ==========

  async getLocationsCount() {
    const cards = this.page.locator(`[data-testid^="location-card-"]`)
    return await cards.count()
  }

  async verifyLocationInList(locationName: string) {
    await expect(this.page.getByText(locationName)).toBeVisible()
  }

  async searchLocation(query: string) {
    const searchInput = this.page.getByTestId(CONSIGNMENTS.LOCATIONS.SEARCH_INPUT)
    await searchInput.fill(query)
    await this.page.waitForTimeout(300) // Wait for filter to apply
  }

  async filterByCity(city: string) {
    const filterBtn = this.page.getByTestId(CONSIGNMENTS.LOCATIONS.CITY_FILTER(city))
    if (await filterBtn.isVisible()) {
      await filterBtn.click()
    }
  }

  // ========== CREATE LOCATION ==========

  async clickAddLocationButton() {
    // Wait for page to be ready
    await this.page.waitForLoadState('domcontentloaded')

    const addBtn = this.page.getByTestId(CONSIGNMENTS.LOCATIONS.ADD_BUTTON)
    const addFirstBtn = this.page.getByTestId(CONSIGNMENTS.LOCATIONS.ADD_FIRST_BUTTON)

    // Try the main button first (most common case)
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click()
      return
    }

    // Fallback to empty state button
    if (await addFirstBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addFirstBtn.click()
      return
    }

    throw new Error('No add location button found')
  }

  async fillLocationForm(data: CreateLocationData) {
    await this.page.getByTestId(CONSIGNMENTS.FORM.NAME_INPUT).fill(data.name)
    await this.page.getByTestId(CONSIGNMENTS.FORM.CITY_INPUT).fill(data.city)
    await this.page.getByTestId(CONSIGNMENTS.FORM.COUNTRY_INPUT).fill(data.country)

    if (data.address) {
      await this.page.getByTestId(CONSIGNMENTS.FORM.ADDRESS_INPUT).fill(data.address)
    }
    if (data.contactName) {
      const contactNameInput = this.page.getByTestId(CONSIGNMENTS.FORM.CONTACT_NAME_INPUT)
      if (await contactNameInput.isVisible()) {
        await contactNameInput.fill(data.contactName)
      }
    }
    if (data.contactEmail) {
      const contactEmailInput = this.page.getByTestId(CONSIGNMENTS.FORM.CONTACT_EMAIL_INPUT)
      if (await contactEmailInput.isVisible()) {
        await contactEmailInput.fill(data.contactEmail)
      }
    }
    if (data.contactPhone) {
      const contactPhoneInput = this.page.getByTestId(CONSIGNMENTS.FORM.CONTACT_PHONE_INPUT)
      if (await contactPhoneInput.isVisible()) {
        await contactPhoneInput.fill(data.contactPhone)
      }
    }
  }

  async submitLocationForm() {
    await this.page.getByTestId(CONSIGNMENTS.FORM.SAVE_BTN).click()
    // Wait for modal to close and toast to appear/disappear
    await this.page.waitForTimeout(500)
  }

  async createLocation(data: CreateLocationData) {
    await this.clickAddLocationButton()
    await expect(this.page.getByTestId(CONSIGNMENTS.FORM.MODAL)).toBeVisible()
    await this.fillLocationForm(data)
    await this.submitLocationForm()
    // Verify success toast or location appears in list
    await expect(
      this.page.getByText(/creado|creada|actualizado|actualizada|success|éxito/i),
    ).toBeVisible({
      timeout: 5000,
    })
  }

  // ========== EDIT LOCATION ==========

  async clickEditLocation(locationId: string) {
    await this.page.getByTestId(CONSIGNMENTS.LOCATIONS.CARD_EDIT_BTN(locationId)).click()
    await expect(this.page.getByTestId(CONSIGNMENTS.FORM.MODAL)).toBeVisible()
  }

  async editLocation(locationId: string, updates: Partial<CreateLocationData>) {
    await this.clickEditLocation(locationId)
    if (updates.name) {
      const nameInput = this.page.getByTestId(CONSIGNMENTS.FORM.NAME_INPUT)
      await nameInput.clear()
      await nameInput.fill(updates.name)
    }
    if (updates.city) {
      const cityInput = this.page.getByTestId(CONSIGNMENTS.FORM.CITY_INPUT)
      await cityInput.clear()
      await cityInput.fill(updates.city)
    }
    if (updates.address) {
      const addressInput = this.page.getByTestId(CONSIGNMENTS.FORM.ADDRESS_INPUT)
      await addressInput.clear()
      await addressInput.fill(updates.address)
    }
    await this.submitLocationForm()
    await expect(this.page.getByText(/actualizado|actualizada|success|éxito/i)).toBeVisible({
      timeout: 5000,
    })
  }

  // ========== DELETE LOCATION ==========

  async deleteLocation(locationId: string) {
    // Register dialog handler BEFORE clicking delete (must happen before dialog appears)
    this.page.once('dialog', (dialog) => dialog.accept())

    // Trigger the delete action
    await this.page.getByTestId(CONSIGNMENTS.LOCATIONS.CARD_DELETE_BTN(locationId)).click()

    // Wait for mutation to complete and toast to appear
    try {
      await expect(this.page.getByText(/eliminado|eliminada|borrado|success|éxito/i)).toBeVisible({
        timeout: 5000,
      })
    } catch (_error) {
      // If toast doesn't appear, check if location card is gone (alternative success indicator)
      const card = this.page.getByTestId(CONSIGNMENTS.LOCATIONS.CARD(locationId))
      const stillVisible = await card.isVisible().catch(() => false)
      if (stillVisible) {
        throw new Error('Delete location: toast not found and location card still visible')
      }
    }
  }

  // ========== ASSIGN ARTWORK ==========

  async clickAssignArtwork() {
    // Look for button near location card or in modal
    const assignBtn = this.page.locator('button:has-text("Asignar Obra")')
    if (await assignBtn.isVisible()) {
      await assignBtn.click()
    }
  }

  async selectProductInModal(productId: string) {
    // In SelectProductModal, click product option
    const productOption = this.page.getByTestId(
      CONSIGNMENTS.SELECT_PRODUCT.PRODUCT_OPTION(productId),
    )
    if (await productOption.isVisible()) {
      await productOption.click()
    } else {
      // Try via search or direct click
      await this.page.getByText(new RegExp(productId, 'i')).click()
    }
  }

  async setAssignmentStatus(status: string) {
    const statusSelect = this.page.getByTestId(CONSIGNMENTS.ASSIGN_ARTWORK.STATUS_SELECT)
    if (await statusSelect.isVisible()) {
      await statusSelect.click()
      await this.page.getByRole('option', { name: new RegExp(status, 'i') }).click()
    }
  }

  async confirmAssignment() {
    await this.page.getByTestId(CONSIGNMENTS.ASSIGN_ARTWORK.CONFIRM_BTN).click()
    await this.page.waitForTimeout(500)
  }

  async assignArtwork(data: AssignArtworkData) {
    await this.clickAssignArtwork()
    await expect(this.page.getByTestId(CONSIGNMENTS.ASSIGN_ARTWORK.MODAL)).toBeVisible()
    await this.selectProductInModal(data.productId)
    if (data.status) {
      await this.setAssignmentStatus(data.status)
    }
    await this.confirmAssignment()
    await expect(this.page.getByText(/asignado|asignada|success|éxito/i)).toBeVisible({
      timeout: 5000,
    })
  }

  // ========== CONSIGNMENT HISTORY ==========

  async verifyHistoryVisible() {
    const history = this.page.getByTestId(CONSIGNMENTS.HISTORY.CONTAINER)
    await expect(history).toBeVisible()
  }

  async getHistoryEventCount() {
    const events = this.page.locator(`[data-testid^="timeline-event-"]`)
    return await events.count()
  }

  async verifyHistoryEventExists(movementId: string) {
    const event = this.page.getByTestId(CONSIGNMENTS.HISTORY.TIMELINE_EVENT(movementId))
    await expect(event).toBeVisible()
  }

  // ========== WAIT HELPERS ==========

  async waitForLocationsLoaded() {
    // Wait for either the grid or empty state to be visible
    const grid = this.page.getByTestId(CONSIGNMENTS.LOCATIONS.GRID)
    const emptyState = this.page.getByTestId(CONSIGNMENTS.LOCATIONS.EMPTY_STATE)
    const container = this.page.getByTestId(CONSIGNMENTS.LOCATIONS.CONTAINER)

    // Wait for container first, then check for grid or empty state
    await expect(container).toBeVisible({ timeout: 10000 })

    // Either grid or empty state should be visible
    const gridVisible = await grid.isVisible().catch(() => false)
    const emptyVisible = await emptyState.isVisible().catch(() => false)

    if (!gridVisible && !emptyVisible) {
      // Fallback: just wait a bit for content to load
      await this.page.waitForTimeout(1000)
    }
  }

  async waitForFormLoaded() {
    await expect(this.page.getByTestId(CONSIGNMENTS.FORM.MODAL)).toBeVisible()
  }

  async closeForm() {
    const closeBtn = this.page.getByTestId(CONSIGNMENTS.FORM.CLOSE_MODAL_BTN)
    if (await closeBtn.isVisible()) {
      await closeBtn.click()
      await this.page.waitForTimeout(300)
    }
  }

  async cancelForm() {
    const cancelBtn = this.page.getByTestId(CONSIGNMENTS.FORM.CANCEL_BTN)
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click()
      await this.page.waitForTimeout(300)
    }
  }
}
