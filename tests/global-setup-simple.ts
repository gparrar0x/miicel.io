/**
 * Simplified Global Setup for Gallery Template Tests
 *
 * Skips seed data when it fails - allows tests to proceed with existing data
 * Use: --config playwright.config.simple.ts
 */
import { seedTestData } from './e2e/fixtures/seed-test-data'
import type { FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('\n')
  console.log('════════════════════════════════════════════════════════')
  console.log('  PLAYWRIGHT GLOBAL SETUP (Permissive Mode)')
  console.log('════════════════════════════════════════════════════════')
  console.log('\n')

  try {
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
    console.warn('⚠ Setup failed, proceeding anyway (test data may already exist)')
    console.warn(`Error: ${(error as Error).message}`)
    console.log('\n')
    console.log('────────────────────────────────────────────────────────')
    console.log('  PROCEEDING WITH EXISTING DATA')
    console.log('────────────────────────────────────────────────────────')
    console.log('\n')
  }
}

export default globalSetup
