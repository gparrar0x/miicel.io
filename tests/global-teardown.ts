import type { FullConfig } from '@playwright/test'
import { cleanupTestData } from './e2e/fixtures/seed-test-data'

/**
 * Global teardown for Playwright tests
 * Runs once after all tests complete
 *
 * Tasks:
 * - Clean up test data from database
 * - Reset test environment
 */
async function globalTeardown(_config: FullConfig) {
  console.log('\n')
  console.log('════════════════════════════════════════════════════════')
  console.log('  PLAYWRIGHT GLOBAL TEARDOWN')
  console.log('════════════════════════════════════════════════════════')
  console.log('\n')

  try {
    // Cleanup test data
    await cleanupTestData()

    console.log('\n')
    console.log('────────────────────────────────────────────────────────')
    console.log('  CLEANUP COMPLETED SUCCESSFULLY')
    console.log('────────────────────────────────────────────────────────')
    console.log('\n')
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw to prevent test failures from blocking cleanup
    process.exit(1)
  }
}

export default globalTeardown
