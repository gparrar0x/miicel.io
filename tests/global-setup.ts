import type { FullConfig } from '@playwright/test'
import { seedTestData } from './e2e/fixtures/seed-test-data'

/**
 * Global setup for Playwright tests
 * Runs once before all tests in the entire session
 *
 * Tasks:
 * - Detect environment (local or production)
 * - Seed test database with owner, tenant, and non-owner user (conditional)
 * - Set up environment for E2E tests
 */
async function globalSetup(config: FullConfig) {
  // Detect environment from project name or baseURL
  const projectName = config.projects?.[0]?.name || 'local'
  const baseURL =
    config.projects?.find((p) => p.name === projectName)?.use?.baseURL ||
    config.use?.baseURL ||
    'http://localhost:3000'

  const isProduction = baseURL.includes('vercel.app') || baseURL.includes('miicelio.vercel.app')
  const environment = isProduction ? 'production' : 'local'

  console.log('\n')
  console.log('════════════════════════════════════════════════════════')
  console.log('  PLAYWRIGHT GLOBAL SETUP')
  console.log(`  Environment: ${environment.toUpperCase()}`)
  console.log(`  Base URL: ${baseURL}`)
  console.log('════════════════════════════════════════════════════════')
  console.log('\n')

  try {
    // Seed test data (conditional - seedTestData already checks for existing data)
    console.log(`🌱 Seeding test data (conditional - will reuse existing if found)...`)
    const result = await seedTestData()

    console.log('\n')
    console.log('────────────────────────────────────────────────────────')
    console.log('  SETUP SUMMARY')
    console.log('────────────────────────────────────────────────────────')
    console.log(`Environment:      ${environment}`)
    console.log(`Base URL:         ${baseURL}`)
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
