import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config({ path: '.env' })

/**
 * Playwright Configuration for miicelio
 *
 * Configures browser automation for E2E testing with:
 * - Multiple environments (local and production)
 * - Multiple browser engines (Chromium, Firefox, WebKit)
 * - Headless mode for CI/CD
 * - Headed mode for local debugging
 * - Screenshots and videos on failure
 * - Automatic retries for flaky tests
 */

// Shared configuration for all projects
const sharedConfig = {
  // Screenshot on failure
  screenshot: 'only-on-failure' as const,

  // Video on failure
  video: 'retain-on-failure' as const,

  // Trace on failure
  trace: 'on-first-retry' as const,

  // Network timeout (increased for MercadoPago sandbox)
  navigationTimeout: 60000,
  actionTimeout: 15000,
}

export default defineConfig({
  testDir: './tests/e2e/specs',

  // Global setup (seed test data once before all tests)
  globalSetup: require.resolve('./tests/global-setup.ts'),

  // Maximum time per test (60 seconds for MercadoPago sandbox tests)
  timeout: 60 * 1000,

  // Global timeout for all tests (15 minutes for MercadoPago sandbox tests)
  globalTimeout: 15 * 60 * 1000,

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

  // Projects (environments)
  projects: [
    // Local environment - runs against localhost with auto-start dev server
    {
      name: 'local',
      use: {
        ...sharedConfig,
        baseURL: process.env.BASE_URL || 'http://localhost:3001',
        ...devices['Desktop Chrome'],
      },
    },

    // Production environment - runs against production URL
    {
      name: 'production',
      use: {
        ...sharedConfig,
        baseURL: 'https://miicelio.vercel.app',
        ...devices['Desktop Chrome'],
        // Production may need longer timeouts due to network latency
        navigationTimeout: 60000,
        actionTimeout: 15000,
      },
    },

    // MercadoPago Sandbox tests - requires longer timeouts
    {
      name: 'mercadopago-sandbox',
      testMatch: /.*mercadopago-sandbox\.spec\.ts/,
      use: {
        ...sharedConfig,
        baseURL: process.env.BASE_URL || 'http://localhost:3001',
        ...devices['Desktop Chrome'],
        // Extended timeouts for MP sandbox interactions
        navigationTimeout: 90000,
        actionTimeout: 20000,
      },
      timeout: 120 * 1000, // 2 minutes per test
    },
  ],

  // Web Server configuration (only for local environment)
  // Note: webServer is shared, but production tests won't use it
  webServer: {
    command: 'npm run dev',
    url: process.env.BASE_URL || 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Fullypage screenshots
  snapshotDir: './tests/e2e/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-{platform}{ext}',
})
