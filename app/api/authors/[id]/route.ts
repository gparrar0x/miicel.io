/**
 * GET    /api/authors/[id] — get author
 * PUT    /api/authors/[id] — update author
 * DELETE /api/authors/[id] — delete author
 */

import { NextResponse } from 'next/server'
import { isSuperadmin } from '@/lib/auth/constants'
import { authorUpdateSchema } from '@/lib/schemas/author-landing'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

function parseId(id: string): number | null {
  const n = parseInt(id, 10)
  return Number.isNaN(n) ? null : n
}

async function assertTenantOwnership(
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

  const isSuperadminUser = isSuperadmin(userEmail)
  if (!isSuperadminUser && tenant.owner_id !== userId) {
    return NextResponse.json({ error: 'Forbidden. You do not own this tenant.' }, { status: 403 })
  }

  return null
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authorId = parseId(id)
    if (authorId === null) {
      return NextResponse.json({ error: 'Invalid author ID.' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const admin = createServiceRoleClient()
    const { data: author, error } = await admin
      .from('authors')
      .select('*')
      .eq('id', authorId)
      .maybeSingle()

    if (error || !author) {
      return NextResponse.json({ error: 'Author not found.' }, { status: 404 })
    }

    const ownershipError = await assertTenantOwnership(
      supabase,
      user.id,
      user.email,
      author.tenant_id,
    )
    if (ownershipError) return ownershipError

    return NextResponse.json({ author })
  } catch (err: any) {
    console.error('GET /api/authors/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authorId = parseId(id)
    if (authorId === null) {
      return NextResponse.json({ error: 'Invalid author ID.' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = authorUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const admin = createServiceRoleClient()
    const { data: existing } = await admin
      .from('authors')
      .select('*')
      .eq('id', authorId)
      .maybeSingle()
    if (!existing) {
      return NextResponse.json({ error: 'Author not found.' }, { status: 404 })
    }

    const ownershipError = await assertTenantOwnership(
      supabase,
      user.id,
      user.email,
      existing.tenant_id,
    )
    if (ownershipError) return ownershipError

    const { data: author, error: updateError } = await admin
      .from('authors')
      .update(parsed.data)
      .eq('id', authorId)
      .select()
      .single()

    if (updateError || !author) {
      if (updateError?.message?.includes('unique') || updateError?.message?.includes('duplicate')) {
        return NextResponse.json({ error: 'Slug already exists for this tenant.' }, { status: 409 })
      }
      return NextResponse.json(
        { error: `Failed to update: ${updateError?.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ author })
  } catch (err: any) {
    console.error('PUT /api/authors/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authorId = parseId(id)
    if (authorId === null) {
      return NextResponse.json({ error: 'Invalid author ID.' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const admin = createServiceRoleClient()
    const { data: existing } = await admin
      .from('authors')
      .select('*')
      .eq('id', authorId)
      .maybeSingle()
    if (!existing) {
      return NextResponse.json({ error: 'Author not found.' }, { status: 404 })
    }

    const ownershipError = await assertTenantOwnership(
      supabase,
      user.id,
      user.email,
      existing.tenant_id,
    )
    if (ownershipError) return ownershipError

    const { error: deleteError } = await admin.from('authors').delete().eq('id', authorId)
    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to delete: ${deleteError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE /api/authors/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
