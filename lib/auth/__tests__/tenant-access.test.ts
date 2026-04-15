/**
 * Unit tests for assertTenantAccess helper.
 * Supabase client is fully mocked — no DB calls.
 */

import type { User } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import type { TenantAccessResult } from '@/lib/auth/tenant-access'
import { assertTenantAccess } from '@/lib/auth/tenant-access'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SUPERADMIN_EMAIL = 'gparrar@skywalking.dev'

function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-abc',
    email: 'user@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    ...overrides,
  } as User
}

type ChainResult = { data: unknown; error: unknown }

/**
 * Builds a minimal chainable Supabase mock.
 *
 * fromMap controls what each .from() call returns:
 *   - 'tenants' → tenantResult
 *   - 'users'   → usersResults (array, consumed in order per from('users') call)
 */
function buildMockClient(
  tenantResult: ChainResult,
  usersResults: ChainResult[] = [{ data: null, error: null }],
) {
  let usersCallCount = 0

  const makeChain = (finalResult: ChainResult) => {
    const chain: Record<string, unknown> = {}
    const self = new Proxy(chain, {
      get(_target, prop) {
        if (prop === 'maybeSingle') {
          return () => Promise.resolve(finalResult)
        }
        // All other methods return the same chain (select, eq, is, etc.)
        return () => self
      },
    })
    return self
  }

  return {
    from: vi.fn((table: string) => {
      if (table === 'tenants') return makeChain(tenantResult)
      if (table === 'users') {
        const result = usersResults[usersCallCount] ?? { data: null, error: null }
        usersCallCount++
        return makeChain(result)
      }
      return makeChain({ data: null, error: null })
    }),
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('assertTenantAccess', () => {
  // ── 401 ──────────────────────────────────────────────────────────────────

  it('returns 401 when user is null', async () => {
    const client = buildMockClient({ data: null, error: null })
    const result = await assertTenantAccess(client as any, null, 1)
    expect(result.ok).toBe(false)
    expect((result as any).status).toBe(401)
  })

  // ── 404 ──────────────────────────────────────────────────────────────────

  it('returns 404 when tenant does not exist (numeric id)', async () => {
    const client = buildMockClient({ data: null, error: null })
    const result = await assertTenantAccess(client as any, mockUser(), 999)
    expect(result.ok).toBe(false)
    expect((result as any).status).toBe(404)
  })

  it('returns 404 when tenant does not exist (slug)', async () => {
    const client = buildMockClient({ data: null, error: null })
    const result = await assertTenantAccess(client as any, mockUser(), 'no-such-tenant')
    expect(result.ok).toBe(false)
    expect((result as any).status).toBe(404)
  })

  // ── Owner fallback ────────────────────────────────────────────────────────

  it('returns ok role=owner via tenants.owner_id fallback (no row in public.users)', async () => {
    const tenant = { id: 7, slug: 'sazon-criollo', owner_id: 'user-abc' }
    const client = buildMockClient({ data: tenant, error: null }, [{ data: null, error: null }])
    const result = await assertTenantAccess(client as any, mockUser({ id: 'user-abc' }), 7)
    expect(result.ok).toBe(true)
    expect((result as TenantAccessResult & { ok: true }).role).toBe('owner')
  })

  it('returns ok role=owner when both tenants.owner_id matches and public.users has owner row', async () => {
    // owner_id match takes priority before querying public.users
    const tenant = { id: 7, slug: 'sazon-criollo', owner_id: 'user-abc' }
    const client = buildMockClient({ data: tenant, error: null })
    const result = await assertTenantAccess(client as any, mockUser({ id: 'user-abc' }), 7)
    expect(result.ok).toBe(true)
    expect((result as TenantAccessResult & { ok: true }).role).toBe('owner')
    // Should NOT have called from('users') since owner_id matched
    expect(client.from).not.toHaveBeenCalledWith('users')
  })

  // ── Superadmin ────────────────────────────────────────────────────────────

  it('returns ok role=superadmin for superadmin email regardless of ownership', async () => {
    const tenant = { id: 1, slug: 'demo', owner_id: 'other-user' }
    const client = buildMockClient({ data: tenant, error: null })
    const result = await assertTenantAccess(
      client as any,
      mockUser({ id: 'superadmin-id', email: SUPERADMIN_EMAIL }),
      1,
    )
    expect(result.ok).toBe(true)
    expect((result as TenantAccessResult & { ok: true }).role).toBe('superadmin')
  })

  // ── platform_admin ────────────────────────────────────────────────────────

  it('returns ok role=platform_admin for platform admin user', async () => {
    const tenant = { id: 1, slug: 'demo', owner_id: 'other-user' }
    const platformRow = { role: 'platform_admin', tenant_id: 1, is_active: true }
    const client = buildMockClient({ data: tenant, error: null }, [
      { data: platformRow, error: null },
    ])
    const result = await assertTenantAccess(client as any, mockUser({ id: 'platform-id' }), 1)
    expect(result.ok).toBe(true)
    expect((result as TenantAccessResult & { ok: true }).role).toBe('platform_admin')
  })

  // ── Staff roles ───────────────────────────────────────────────────────────

  it('returns ok role=tenant_admin for active staff with tenant_admin role', async () => {
    const tenant = { id: 7, slug: 'sazon-criollo', owner_id: 'owner-id' }
    const userRow = { role: 'tenant_admin', tenant_id: 7, is_active: true }
    const client = buildMockClient({ data: tenant, error: null }, [{ data: userRow, error: null }])
    const result = await assertTenantAccess(
      client as any,
      mockUser({ id: 'staff-id', email: 'jfmarinromero@gmail.com' }),
      7,
    )
    expect(result.ok).toBe(true)
    expect((result as TenantAccessResult & { ok: true }).role).toBe('tenant_admin')
  })

  it('returns ok role=staff for active staff with staff role', async () => {
    const tenant = { id: 7, slug: 'sazon-criollo', owner_id: 'owner-id' }
    const userRow = { role: 'staff', tenant_id: 7, is_active: true }
    const client = buildMockClient({ data: tenant, error: null }, [{ data: userRow, error: null }])
    const result = await assertTenantAccess(client as any, mockUser({ id: 'staff-id' }), 7)
    expect(result.ok).toBe(true)
    expect((result as TenantAccessResult & { ok: true }).role).toBe('staff')
  })

  // ── Inactive / no match ───────────────────────────────────────────────────

  it('returns 403 when user has inactive row in public.users (is_active=false)', async () => {
    // is_active=false means it won't be returned by eq('is_active', true) query → data: null
    const tenant = { id: 7, slug: 'sazon-criollo', owner_id: 'owner-id' }
    const client = buildMockClient({ data: tenant, error: null }, [
      { data: null, error: null },
      { data: null, error: null },
    ])
    const result = await assertTenantAccess(client as any, mockUser({ id: 'inactive-id' }), 7)
    expect(result.ok).toBe(false)
    expect((result as any).status).toBe(403)
  })

  it('returns 403 when user has no row in public.users and is not owner/superadmin', async () => {
    const tenant = { id: 7, slug: 'sazon-criollo', owner_id: 'owner-id' }
    const client = buildMockClient({ data: tenant, error: null }, [
      { data: null, error: null },
      { data: null, error: null },
    ])
    const result = await assertTenantAccess(client as any, mockUser({ id: 'random-id' }), 7)
    expect(result.ok).toBe(false)
    expect((result as any).status).toBe(403)
  })

  // ── minRole enforcement ───────────────────────────────────────────────────

  it('respects minRole=tenant_admin → blocks role=staff with 403', async () => {
    const tenant = { id: 7, slug: 'sazon-criollo', owner_id: 'owner-id' }
    const userRow = { role: 'staff', tenant_id: 7, is_active: true }
    const client = buildMockClient({ data: tenant, error: null }, [{ data: userRow, error: null }])
    const result = await assertTenantAccess(client as any, mockUser({ id: 'staff-id' }), 7, {
      minRole: 'tenant_admin',
    })
    expect(result.ok).toBe(false)
    expect((result as any).status).toBe(403)
  })

  it('respects minRole=owner → blocks role=tenant_admin with 403', async () => {
    const tenant = { id: 7, slug: 'sazon-criollo', owner_id: 'owner-id' }
    const userRow = { role: 'tenant_admin', tenant_id: 7, is_active: true }
    const client = buildMockClient({ data: tenant, error: null }, [{ data: userRow, error: null }])
    const result = await assertTenantAccess(client as any, mockUser({ id: 'admin-id' }), 7, {
      minRole: 'owner',
    })
    expect(result.ok).toBe(false)
    expect((result as any).status).toBe(403)
  })

  it('respects minRole=owner → allows superadmin and platform_admin', async () => {
    const tenant = { id: 7, slug: 'sazon-criollo', owner_id: 'owner-id' }
    const client = buildMockClient({ data: tenant, error: null })

    // superadmin
    const r1 = await assertTenantAccess(
      client as any,
      mockUser({ id: 'sa-id', email: SUPERADMIN_EMAIL }),
      7,
      { minRole: 'owner' },
    )
    expect(r1.ok).toBe(true)

    // platform_admin
    const platformRow = { role: 'platform_admin', tenant_id: 7, is_active: true }
    const client2 = buildMockClient({ data: tenant, error: null }, [
      { data: platformRow, error: null },
    ])
    const r2 = await assertTenantAccess(client2 as any, mockUser({ id: 'pa-id' }), 7, {
      minRole: 'owner',
    })
    expect(r2.ok).toBe(true)
  })

  // ── Tenant resolution ─────────────────────────────────────────────────────

  it('resolves tenant by numeric id', async () => {
    const tenant = { id: 7, slug: 'sazon-criollo', owner_id: 'user-abc' }
    const client = buildMockClient({ data: tenant, error: null })
    const result = await assertTenantAccess(client as any, mockUser({ id: 'user-abc' }), 7)
    expect(result.ok).toBe(true)
    expect(client.from).toHaveBeenCalledWith('tenants')
    // Numeric id passed → should use eq('id', 7)
  })

  it('resolves tenant by slug string', async () => {
    const tenant = { id: 7, slug: 'sazon-criollo', owner_id: 'user-abc' }
    const client = buildMockClient({ data: tenant, error: null })
    const result = await assertTenantAccess(
      client as any,
      mockUser({ id: 'user-abc' }),
      'sazon-criollo',
    )
    expect(result.ok).toBe(true)
    expect(client.from).toHaveBeenCalledWith('tenants')
  })
})
