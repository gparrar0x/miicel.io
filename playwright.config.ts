import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config({ path: '.env' })

/**
 * Playwright Configuration for miicelio
 *
 * Configures browser automation for E2E testing with:
 * - Multiple browser engines (Chromium, Firefox, WebKit)
 * - Headless mode for CI/CD
 * - Headed mode for local debugging
 * - Screenshots and videos on failure
 * - Automatic retries for flaky tests
 */

export default defineConfig({
  testDir: './tests/e2e/specs',

  // Global setup (seed test data once before all tests)
  globalSetup: require.resolve('./tests/global-setup.ts'),

  // Maximum time per test (20 seconds)
  timeout: 20 * 1000,

  // Global timeout for all tests (10 minutes)
  globalTimeout: 10 * 60 * 1000,

  // Maximum retries on CI (0 on local)
  retries: process.env.CI ? 2 : 0,

  // Workers (parallel test execution)
  workers: process.env.CI ? 1 : 4,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'tests/reports' }],
    ['json', { outputFile: 'tests/test-results.json' }],
    ['junit', { outputFile: 'tests/junit.xml' }],
    ['list'],
  ],

  // Shared settings for all web browsers
  use: {
    // Base URL for the app
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Trace on failure
    trace: 'on-first-retry',

    // Network timeout
    navigationTimeout: 30000,
    actionTimeout: 10000,
  },

  // Web Server configuration (auto-start Next.js dev server)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Projects (browser engines)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Mobile testing
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },

    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Fullypage screenshots
  snapshotDir: './tests/e2e/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-{platform}{ext}',
})
