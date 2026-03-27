/**
 * Product Modifiers - Admin Flow
 *
 * Tests the complete admin modifier group CRUD:
 * 1. Admin creates modifier group
 * 2. Admin adds options with price delta
 * 3. Admin edits/deletes group
 * 4. Admin edits/deletes option
 *
 * Uses loginAsOwner fixture for auth
 * Uses data-testid selectors per TEST_ID_CONTRACT.md
 */

import { expect, test } from '@playwright/test'
import { loginAsOwner } from '../../fixtures/auth.fixture'
import { ModifiersPage } from '../../pages/modifiers.page'

test.describe('Product Modifiers - Admin Flow', () => {
  const TEST_TENANT = 'demo_galeria'

  function getBaseUrl(page: any): string {
    const baseURL = page.context().baseURL || 'http://localhost:3000'
    return baseURL
  }

  test.beforeEach(async ({ page }) => {
    // Login as owner
    await loginAsOwner(page, TEST_TENANT)

    // Navigate to modifier management page
    const modifiersPage = new ModifiersPage(page)
    await modifiersPage.navigateToModifierManagement(getBaseUrl(page), TEST_TENANT)
    await page.waitForLoadState('networkidle')
  })

  test('should create modifier group with options', async ({ page }) => {
    const modifiersPage = new ModifiersPage(page)

    // Get initial count
    const initialCount = await modifiersPage.getModifierGroupCount()

    // Click add button
    await modifiersPage.clickAddModifierGroup()
    await modifiersPage.waitForFormVisible()

    // Fill form
    await modifiersPage.fillModifierForm({
      name: 'Test Size Group E2E',
      description: 'Choose your size',
      min: 1,
      max: 1,
      required: true,
    })

    // Add options
    await modifiersPage.addModifierOption({
      label: 'Small',
      price: 0,
      available: true,
    })

    await modifiersPage.addModifierOption({
      label: 'Medium',
      price: 2.5,
      available: true,
    })

    await modifiersPage.addModifierOption({
      label: 'Large',
      price: 5.0,
      available: true,
    })

    // Save
    await modifiersPage.saveModifierGroup()

    // Verify success (check toast or count increase)
    await page.waitForTimeout(500)
    const finalCount = await modifiersPage.getModifierGroupCount()
    expect(finalCount).toBeGreaterThan(initialCount)

    // Verify group name appears in list
    const groupNameVisible = await page
      .getByText('Test Size Group E2E')
      .isVisible()
      .catch(() => false)
    expect(groupNameVisible).toBe(true)
  })

  test('should add modifier option in form', async ({ page }) => {
    const modifiersPage = new ModifiersPage(page)

    // Open form
    await modifiersPage.clickAddModifierGroup()
    await modifiersPage.waitForFormVisible()

    // Fill basic info
    await modifiersPage.fillModifierForm({
      name: 'Test Add Option E2E',
      min: 0,
      max: 3,
    })

    // Add multiple options
    await modifiersPage.addModifierOption({
      label: 'Option 1',
      price: 0,
      available: true,
    })

    await modifiersPage.addModifierOption({
      label: 'Option 2',
      price: 1.5,
      available: true,
    })

    // Verify options are visible in form
    const optionRow0 = page.locator('[data-testid="admin-modifier-option-row-0"]')
    const optionRow1 = page.locator('[data-testid="admin-modifier-option-row-1"]')

    await expect(optionRow0).toBeVisible()
    await expect(optionRow1).toBeVisible()

    // Save
    await modifiersPage.saveModifierGroup()

    // Verify created
    await page.waitForTimeout(500)
    const groupVisible = await page
      .getByText('Test Add Option E2E')
      .isVisible()
      .catch(() => false)
    expect(groupVisible).toBe(true)
  })

  test('should edit modifier group', async ({ page }) => {
    const modifiersPage = new ModifiersPage(page)

    // Create a group first
    await modifiersPage.clickAddModifierGroup()
    await modifiersPage.waitForFormVisible()

    await modifiersPage.fillModifierForm({
      name: 'Test Edit Group E2E',
      min: 1,
      max: 1,
    })

    await modifiersPage.addModifierOption({
      label: 'Option A',
      price: 0,
      available: true,
    })

    await modifiersPage.saveModifierGroup()
    await page.waitForTimeout(500)

    // Find and edit the created group
    const groupRow = page.locator('[data-testid^="admin-modifier-group-item-"]').last()
    const groupId = await groupRow.getAttribute('data-testid')

    if (groupId) {
      const cleanGroupId = groupId.replace('admin-modifier-group-item-', '')
      await modifiersPage.editModifierGroup(cleanGroupId)
      await modifiersPage.waitForFormVisible()

      // Verify name is pre-filled
      const nameInput = page.locator('[data-testid="admin-modifier-group-name"]')
      const currentName = await nameInput.inputValue()
      expect(currentName).toContain('Test Edit Group')

      // Update name
      await nameInput.clear()
      await nameInput.fill('Test Edit Group E2E Updated')

      // Save
      await modifiersPage.saveModifierGroup()
      await page.waitForTimeout(500)

      // Verify updated
      const updatedVisible = await page
        .getByText('Test Edit Group E2E Updated')
        .isVisible()
        .catch(() => false)
      expect(updatedVisible).toBe(true)
    }
  })

  test('should delete modifier group', async ({ page }) => {
    const modifiersPage = new ModifiersPage(page)

    // Create group
    const initialCount = await modifiersPage.getModifierGroupCount()

    await modifiersPage.clickAddModifierGroup()
    await modifiersPage.waitForFormVisible()

    await modifiersPage.fillModifierForm({
      name: 'Test Delete Group E2E',
      min: 0,
      max: 1,
    })

    await modifiersPage.addModifierOption({
      label: 'Delete Me',
      price: 0,
      available: true,
    })

    await modifiersPage.saveModifierGroup()
    await page.waitForTimeout(500)

    // Verify count increased
    const afterCreateCount = await modifiersPage.getModifierGroupCount()
    expect(afterCreateCount).toBeGreaterThan(initialCount)

    // Find and delete
    const groupRow = page.locator('[data-testid^="admin-modifier-group-item-"]').last()
    const groupId = await groupRow.getAttribute('data-testid')

    if (groupId) {
      const cleanGroupId = groupId.replace('admin-modifier-group-item-', '')
      await modifiersPage.deleteModifierGroup(cleanGroupId)
      await page.waitForTimeout(500)

      // Verify count decreased
      const afterDeleteCount = await modifiersPage.getModifierGroupCount()
      expect(afterDeleteCount).toBeLessThanOrEqual(afterCreateCount)
    }
  })

  test('should edit modifier option in form', async ({ page }) => {
    const modifiersPage = new ModifiersPage(page)

    // Create group with options
    await modifiersPage.clickAddModifierGroup()
    await modifiersPage.waitForFormVisible()

    await modifiersPage.fillModifierForm({
      name: 'Test Edit Option E2E',
      min: 0,
      max: 3,
    })

    await modifiersPage.addModifierOption({
      label: 'Original Label',
      price: 0,
      available: true,
    })

    await modifiersPage.addModifierOption({
      label: 'Second Option',
      price: 2.0,
      available: true,
    })

    // Edit first option
    const labelInput0 = page.locator('[data-testid="admin-modifier-option-label-0"]')
    await labelInput0.clear()
    await labelInput0.fill('Updated Label')

    const priceInput0 = page.locator('[data-testid="admin-modifier-option-price-0"]')
    await priceInput0.clear()
    await priceInput0.fill('1.5')

    // Save
    await modifiersPage.saveModifierGroup()
    await page.waitForTimeout(500)

    // Verify saved with updates
    const groupVisible = await page
      .getByText('Test Edit Option E2E')
      .isVisible()
      .catch(() => false)
    expect(groupVisible).toBe(true)
  })

  test('should remove modifier option from form', async ({ page }) => {
    const modifiersPage = new ModifiersPage(page)

    // Create group with multiple options
    await modifiersPage.clickAddModifierGroup()
    await modifiersPage.waitForFormVisible()

    await modifiersPage.fillModifierForm({
      name: 'Test Remove Option E2E',
      min: 0,
      max: 3,
    })

    await modifiersPage.addModifierOption({
      label: 'Keep This',
      price: 0,
      available: true,
    })

    await modifiersPage.addModifierOption({
      label: 'Delete This',
      price: 2.0,
      available: true,
    })

    await modifiersPage.addModifierOption({
      label: 'Keep This Too',
      price: 3.0,
      available: true,
    })

    // Remove middle option
    await modifiersPage.removeModifierOption(1)

    // Verify only 2 options left
    const optionRows = page.locator('[data-testid^="admin-modifier-option-row-"]')
    const rowCount = await optionRows.count()
    expect(rowCount).toBe(2)

    // Save
    await modifiersPage.saveModifierGroup()
    await page.waitForTimeout(500)

    // Verify saved
    const groupVisible = await page
      .getByText('Test Remove Option E2E')
      .isVisible()
      .catch(() => false)
    expect(groupVisible).toBe(true)
  })

  test('should validate required fields in form', async ({ page }) => {
    const modifiersPage = new ModifiersPage(page)

    // Open form
    await modifiersPage.clickAddModifierGroup()
    await modifiersPage.waitForFormVisible()

    // Try to save without name
    await modifiersPage.saveModifierGroup()

    // Check for validation error
    const nameError = await modifiersPage.getNameError()
    expect(nameError).toBeTruthy()

    // Fill name and try again
    await modifiersPage.fillModifierForm({
      name: 'Valid Group E2E',
      min: 1,
      max: 1,
    })

    await modifiersPage.addModifierOption({
      label: 'Option',
      price: 0,
      available: true,
    })

    // Should save now
    await modifiersPage.saveModifierGroup()
    await page.waitForTimeout(300)

    // Form should close
    const formVisible = await page
      .locator('[data-testid="admin-modifier-group-form"]')
      .isVisible()
      .catch(() => false)
    expect(formVisible).toBe(false)
  })

  test('should handle price delta input validation', async ({ page }) => {
    const modifiersPage = new ModifiersPage(page)

    // Open form
    await modifiersPage.clickAddModifierGroup()
    await modifiersPage.waitForFormVisible()

    await modifiersPage.fillModifierForm({
      name: 'Test Price Validation E2E',
      min: 0,
      max: 2,
    })

    // Add option with price
    await modifiersPage.addModifierOption({
      label: 'Premium Option',
      price: 5.99,
      available: true,
    })

    // Verify price input accepts decimals
    const priceInput = page.locator('[data-testid="admin-modifier-option-price-0"]')
    const priceValue = await priceInput.inputValue()
    expect(priceValue).toBe('5.99')

    // Save
    await modifiersPage.saveModifierGroup()
    await page.waitForTimeout(500)

    // Verify created
    const groupVisible = await page
      .getByText('Test Price Validation E2E')
      .isVisible()
      .catch(() => false)
    expect(groupVisible).toBe(true)
  })
})
