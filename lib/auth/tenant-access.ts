/**
 * assertTenantAccess — centralized tenant authorization helper.
 *
 * Role resolution order:
 *   1. user null → 401
 *   2. isSuperadmin(email) → role 'superadmin', bypass
 *   3. tenant.owner_id === user.id → role 'owner' (fallback for legacy rows missing from public.users)
 *   4. public.users query (auth_user_id + tenant_id + is_active=true) → row.role
 *   5. platform_admin (tenant_id IS NULL or any tenant) → bypass like superadmin
 *   6. no match → 403
 *
 * Max 2 DB queries: tenants + public.users (never more).
 */

import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import { isSuperadmin } from '@/lib/auth/constants'

export type TenantRole = 'owner' | 'tenant_admin' | 'staff' | 'platform_admin' | 'superadmin'

export type TenantAccessResult =
  | { ok: true; tenantId: number; tenantSlug: string; role: TenantRole }
  | { ok: false; status: 401 | 403 | 404; error: string }

export interface AssertTenantAccessOptions {
  minRole?: 'owner' | 'tenant_admin' | 'staff'
}

// Role hierarchy: higher index = higher privilege
const ROLE_HIERARCHY: TenantRole[] = [
  'staff',
  'tenant_admin',
  'owner',
  'platform_admin',
  'superadmin',
]

function roleRank(role: TenantRole): number {
  const idx = ROLE_HIERARCHY.indexOf(role)
  return idx === -1 ? -1 : idx
}

function meetsMinRole(role: TenantRole, minRole?: 'owner' | 'tenant_admin' | 'staff'): boolean {
  if (!minRole) return true
  return roleRank(role) >= roleRank(minRole)
}

export async function assertTenantAccess(
  supabase: SupabaseClient<Database>,
  user: User | null,
  tenantParam: string | number,
  opts?: AssertTenantAccessOptions,
): Promise<TenantAccessResult> {
  // 1. Auth check
  if (!user) {
    return { ok: false, status: 401, error: 'Unauthorized. Please log in.' }
  }

  // 2. Resolve tenant (numeric id or slug string)
  const numericId =
    typeof tenantParam === 'number' ? tenantParam : parseInt(String(tenantParam), 10)
  const isByNumericId = typeof tenantParam === 'number' || !Number.isNaN(numericId)

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, slug, owner_id')
    .eq(isByNumericId ? 'id' : 'slug', isByNumericId ? numericId : String(tenantParam))
    .maybeSingle()

  if (tenantError) {
    console.error('[assertTenantAccess] tenant query error:', tenantError)
    return { ok: false, status: 404, error: 'Tenant not found.' }
  }

  if (!tenant) {
    return { ok: false, status: 404, error: 'Tenant not found.' }
  }

  // 3. Superadmin bypass (email-based)
  if (isSuperadmin(user.email)) {
    const role: TenantRole = 'superadmin'
    return { ok: true, tenantId: tenant.id, tenantSlug: tenant.slug, role }
  }

  // 4. Owner fallback — historical compat: owner_id match even if no public.users row
  if (tenant.owner_id === user.id) {
    const role: TenantRole = 'owner'
    if (!meetsMinRole(role, opts?.minRole)) {
      return { ok: false, status: 403, error: 'Forbidden. Insufficient role.' }
    }
    return { ok: true, tenantId: tenant.id, tenantSlug: tenant.slug, role }
  }

  // 5. Query public.users for staff/admin rows
  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('role, tenant_id, is_active')
    .eq('auth_user_id', user.id)
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .maybeSingle()

  if (userError) {
    console.error('[assertTenantAccess] users query error:', userError)
    return { ok: false, status: 403, error: 'Forbidden.' }
  }

  if (userRow) {
    // platform_admin bypasses minRole restriction
    if (userRow.role === 'platform_admin') {
      const role: TenantRole = 'platform_admin'
      return { ok: true, tenantId: tenant.id, tenantSlug: tenant.slug, role }
    }

    const role = userRow.role as TenantRole
    if (!meetsMinRole(role, opts?.minRole)) {
      return { ok: false, status: 403, error: 'Forbidden. Insufficient role.' }
    }
    return { ok: true, tenantId: tenant.id, tenantSlug: tenant.slug, role }
  }

  // 6. Check platform_admin without specific tenant (tenant_id IS NULL)
  const { data: platformAdminRow, error: platformError } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('auth_user_id', user.id)
    .eq('role', 'platform_admin')
    .eq('is_active', true)
    .is('tenant_id', null)
    .maybeSingle()

  if (!platformError && platformAdminRow) {
    const role: TenantRole = 'platform_admin'
    return { ok: true, tenantId: tenant.id, tenantSlug: tenant.slug, role }
  }

  // 7. No match
  return { ok: false, status: 403, error: 'Forbidden.' }
}
