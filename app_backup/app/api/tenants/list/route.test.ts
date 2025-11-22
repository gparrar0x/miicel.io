/**
 * Unit tests for GET /api/tenants/list
 * Validates response structure and field types
 */

import { GET } from './route'

describe('GET /api/tenants/list', () => {
  it('should return array of tenant objects', async () => {
    const response = await GET()
    const data = await response.json()

    expect(Array.isArray(data)).toBe(true)

    if (data.length > 0) {
      const tenant = data[0]

      expect(tenant).toHaveProperty('slug')
      expect(tenant).toHaveProperty('name')
      expect(tenant).toHaveProperty('logo')
      expect(tenant).toHaveProperty('status')

      expect(typeof tenant.slug).toBe('string')
      expect(typeof tenant.name).toBe('string')
      expect(tenant.status).toBe('active')
    }
  })

  it('should only return active tenants', async () => {
    const response = await GET()
    const data = await response.json()

    data.forEach((tenant: { status: string }) => {
      expect(tenant.status).toBe('active')
    })
  })

  it('should handle logo field correctly', async () => {
    const response = await GET()
    const data = await response.json()

    data.forEach((tenant: { logo: string | null }) => {
      expect(
        tenant.logo === null || typeof tenant.logo === 'string'
      ).toBe(true)
    })
  })
})
