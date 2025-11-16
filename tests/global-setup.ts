import { seedTestData } from './e2e/fixtures/seed-test-data'
import type { FullConfig } from '@playwright/test'

/**
 * Global setup for Playwright tests
 * Runs once before all tests in the entire session
 *
 * Tasks:
 * - Seed test database with owner, tenant, and non-owner user
 * - Set up environment for E2E tests
 */
async function globalSetup(config: FullConfig) {
  console.log('\n')
  console.log('════════════════════════════════════════════════════════')
  console.log('  PLAYWRIGHT GLOBAL SETUP')
  console.log('════════════════════════════════════════════════════════')
  console.log('\n')

  try {
    // Seed test data
    const result = await seedTestData()

    console.log('\n')
    console.log('────────────────────────────────────────────────────────')
    console.log('  SETUP SUMMARY')
    console.log('────────────────────────────────────────────────────────')
    console.log(`Owner User ID:    ${result.owner.id}`)
    console.log(`Tenant ID:        ${result.tenant.id}`)
    console.log(`Non-Owner User:   ${result.nonOwner.id}`)
    console.log('────────────────────────────────────────────────────────')
    console.log('\n')
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  }
}

export default globalSetup
