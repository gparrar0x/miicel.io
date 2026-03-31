/**
 * GET  /api/authors — list authors for tenant (with latest landing status)
 * POST /api/authors — create author
 */

import { NextResponse } from 'next/server'
import { isSuperadmin } from '@/lib/auth/constants'
import { authorCreateSchema } from '@/lib/schemas/author-landing'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { AuthorLandingService } from '@/lib/services/author-landing-service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantIdStr = searchParams.get('tenant_id')

    if (!tenantIdStr) {
      return NextResponse.json({ error: 'tenant_id is required.' }, { status: 400 })
    }

    const tenantId = parseInt(tenantIdStr, 10)
    if (Number.isNaN(tenantId)) {
      return NextResponse.json({ error: 'Invalid tenant_id.' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    // Use service role to bypass RLS (auth already verified above)
    const adminClient = createServiceRoleClient()
    const service = new AuthorLandingService(adminClient)
    const authors = await service.listAuthors(tenantId)

    return NextResponse.json({ authors })
  } catch (err: any) {
    console.error('GET /api/authors error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = authorCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Verify user owns the tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq('id', parsed.data.tenant_id)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
    }

    const isSuperadminUser = isSuperadmin(user.email)
    if (!isSuperadminUser && tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this tenant.' }, { status: 403 })
    }

    const adminClient = createServiceRoleClient()
    const service = new AuthorLandingService(adminClient)
    const author = await service.createAuthor(parsed.data)

    return NextResponse.json({ author }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/authors error:', err)
    if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
      return NextResponse.json({ error: 'Slug already exists for this tenant.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
