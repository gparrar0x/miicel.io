import { NextResponse } from 'next/server'
import { isSuperadmin } from '@/lib/auth/constants'

export function parseId(id: string): number | null {
  const n = parseInt(id, 10)
  return Number.isNaN(n) ? null : n
}

export async function assertTenantOwnership(
  supabase: any,
  userId: string,
  userEmail: string | undefined,
  tenantId: number,
): Promise<NextResponse | null> {
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('id, owner_id')
    .eq('id', tenantId)
    .maybeSingle()

  if (error || !tenant) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
  }

  if (!isSuperadmin(userEmail) && tenant.owner_id !== userId) {
    return NextResponse.json({ error: 'Forbidden. You do not own this tenant.' }, { status: 403 })
  }

  return null
}
