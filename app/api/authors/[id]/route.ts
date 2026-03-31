/**
 * GET    /api/authors/[id] — get author
 * PUT    /api/authors/[id] — update author
 * DELETE /api/authors/[id] — delete author
 */

import { NextResponse } from 'next/server'
import { isSuperadmin } from '@/lib/auth/constants'
import { authorUpdateSchema } from '@/lib/schemas/author-landing'
import { createClient } from '@/lib/supabase/server'
import { AuthorLandingService } from '@/lib/services/author-landing-service'

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

  return null // ok
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

    const service = new AuthorLandingService(supabase)
    const author = await service.getAuthor(authorId)

    if (!author) {
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

    const service = new AuthorLandingService(supabase)
    const existing = await service.getAuthor(authorId)
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

    const author = await service.updateAuthor(authorId, parsed.data)
    return NextResponse.json({ author })
  } catch (err: any) {
    console.error('PUT /api/authors/[id] error:', err)
    if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
      return NextResponse.json({ error: 'Slug already exists for this tenant.' }, { status: 409 })
    }
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

    const service = new AuthorLandingService(supabase)
    const existing = await service.getAuthor(authorId)
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

    await service.deleteAuthor(authorId)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE /api/authors/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
