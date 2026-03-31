/**
 * POST /api/authors/[id]/publish-landing
 * Sets latest landing status='published', published_at=now().
 */

import { NextResponse } from 'next/server'
import { isSuperadmin } from '@/lib/auth/constants'
import { createClient } from '@/lib/supabase/server'
import { AuthorLandingService } from '@/lib/services/author-landing-service'

function parseId(id: string): number | null {
  const n = parseInt(id, 10)
  return Number.isNaN(n) ? null : n
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq('id', author.tenant_id)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
    }

    const isSuperadminUser = isSuperadmin(user.email)
    if (!isSuperadminUser && tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this tenant.' }, { status: 403 })
    }

    const landing = await service.publishLanding(authorId)
    return NextResponse.json({ landing })
  } catch (err: any) {
    console.error('POST /api/authors/[id]/publish-landing error:', err)

    if (err.message?.includes('No landing found')) {
      return NextResponse.json({ error: 'No landing found. Generate one first.' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
