/**
 * GET  /api/authors — list authors for tenant (with latest landing status)
 * POST /api/authors — create author
 */

import { NextResponse } from 'next/server'
import { isSuperadmin } from '@/lib/auth/constants'
import { authorCreateSchema } from '@/lib/schemas/author-landing'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

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

    const adminClient = createServiceRoleClient()
    const { data, error } = await adminClient
      .from('authors')
      .select(
        `
        id, tenant_id, name, slug, image_url, created_at,
        author_landings(id, status, generated_at)
      `,
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .order('generated_at', { ascending: false, referencedTable: 'author_landings' })
      .limit(1, { referencedTable: 'author_landings' })

    if (error) {
      return NextResponse.json(
        { error: `Failed to list authors: ${error.message}` },
        { status: 500 },
      )
    }

    const authors = ((data ?? []) as any[]).map((row) => {
      const latest = (row.author_landings ?? [])[0] ?? null

      return {
        id: row.id,
        tenant_id: row.tenant_id,
        name: row.name,
        slug: row.slug,
        image_url: row.image_url,
        created_at: row.created_at,
        latest_landing: latest
          ? { id: latest.id, status: latest.status, generated_at: latest.generated_at }
          : null,
      }
    })

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
    const { data: author, error: createError } = await adminClient
      .from('authors')
      .insert({
        tenant_id: parsed.data.tenant_id,
        name: parsed.data.name,
        slug: parsed.data.slug,
        image_url: parsed.data.image_url ?? null,
      })
      .select()
      .single()

    if (createError || !author) {
      if (createError?.message?.includes('unique') || createError?.message?.includes('duplicate')) {
        return NextResponse.json({ error: 'Slug already exists for this tenant.' }, { status: 409 })
      }
      return NextResponse.json(
        { error: `Failed to create author: ${createError?.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ author }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/authors error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
