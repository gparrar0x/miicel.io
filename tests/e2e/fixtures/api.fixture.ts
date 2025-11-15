/**
 * API Fixture for E2E Tests
 *
 * Provides API helper to tests for making API calls.
 * Extends the database fixture to include API helpers.
 *
 * Usage in tests:
 * test('my test', async ({ page, apiHelper, dbCleanup }) => {
 *   const isAvailable = await apiHelper.isSlugAvailable('my-store')
 *   // ...
 * })
 */

import { test as dbTest } from './database.fixture'
import { ApiHelper } from '../helpers/api.helper'

export const test = dbTest.extend<{
  apiHelper: ApiHelper
}>({
  apiHelper: async ({ request }, use) => {
    const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
    const apiHelper = new ApiHelper(request, baseURL)

    await use(apiHelper)
  },
})

export { expect } from '@playwright/test'
