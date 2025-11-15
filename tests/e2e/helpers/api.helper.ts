/**
 * API Helper for E2E Tests
 *
 * Provides utility functions for making API calls during E2E tests.
 * Useful for setup/teardown and verifying API behavior.
 *
 * Usage:
 * const result = await apiHelper.validateSlug('my-store')
 */

import { APIRequestContext } from '@playwright/test'

interface SlugValidationResponse {
  available: boolean
  suggestion?: string
  error?: string
}

interface SignupResponse {
  userId: string
  tenantSlug: string
  error?: string
}

export class ApiHelper {
  constructor(private context: APIRequestContext, private baseURL: string) {}

  /**
   * Call the slug validation API
   *
   * @param slug - Slug to validate
   * @returns Validation response with availability status
   */
  async validateSlug(slug: string): Promise<SlugValidationResponse> {
    const response = await this.context.post(`${this.baseURL}/api/signup/validate-slug`, {
      data: { slug },
      headers: { 'Content-Type': 'application/json' },
    })

    return await response.json()
  }

  /**
   * Call the signup API to create a new tenant
   *
   * @param data - Signup form data
   * @returns Signup response with userId and tenantSlug
   */
  async signup(data: {
    email: string
    password: string
    businessName: string
    slug: string
  }): Promise<SignupResponse> {
    const response = await this.context.post(`${this.baseURL}/api/signup`, {
      data,
      headers: { 'Content-Type': 'application/json' },
    })

    return await response.json()
  }

  /**
   * Verify a slug is available via API (useful for test setup)
   *
   * @param slug - Slug to check
   * @returns true if available, false otherwise
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    const result = await this.validateSlug(slug)
    return result.available
  }

  /**
   * Wait for slug to become available (useful for cleanup verification)
   *
   * @param slug - Slug to wait for
   * @param maxRetries - Maximum number of retries
   * @param delayMs - Delay between retries in milliseconds
   */
  async waitForSlugAvailable(slug: string, maxRetries: number = 10, delayMs: number = 500): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      if (await this.isSlugAvailable(slug)) {
        return true
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
    return false
  }

  /**
   * Get all response details from an API call (for debugging)
   *
   * @param slug - Slug to validate
   * @returns Full response object with headers and status
   */
  async getSlugValidationDetails(slug: string) {
    const response = await this.context.post(`${this.baseURL}/api/signup/validate-slug`, {
      data: { slug },
      headers: { 'Content-Type': 'application/json' },
    })

    return {
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      body: await response.json(),
    }
  }
}
