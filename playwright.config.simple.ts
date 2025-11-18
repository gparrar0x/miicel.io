import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

/**
 * Playwright Configuration - Permissive Mode
 * Uses global-setup-simple which allows existing test data
 * Useful for gallery template tests that don't need seed data
 */
export default defineConfig({
  testDir: './tests/e2e/specs',
  globalSetup: require.resolve('./tests/global-setup-simple.ts'),
  timeout: 20 * 1000,
  globalTimeout: 10 * 60 * 1000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ['html', { outputFolder: 'tests/reports' }],
    ['json', { outputFile: 'tests/test-results.json' }],
    ['junit', { outputFile: 'tests/junit.xml' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
})
