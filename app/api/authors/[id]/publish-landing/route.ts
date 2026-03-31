/**
 * POST /api/authors/[id]/publish-landing
 * Sets latest landing status='published', published_at=now().
 */

import { NextResponse } from 'next/server'
import { isSuperadmin } from '@/lib/auth/constants'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

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

    const admin = createServiceRoleClient()

    const { data: author } = await admin
      .from('authors')
      .select('*')
      .eq('id', authorId)
      .maybeSingle()
    if (!author) {
      return NextResponse.json({ error: 'Author not found.' }, { status: 404 })
    }

    const { data: tenant } = await admin
      .from('tenants')
      .select('id, owner_id')
      .eq('id', author.tenant_id)
      .maybeSingle()

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
    }

    const isSuperadminUser = isSuperadmin(user.email)
    if (!isSuperadminUser && tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this tenant.' }, { status: 403 })
    }

    // Get most recent landing
    const { data: landings } = await admin
      .from('author_landings')
      .select('*')
      .eq('author_id', authorId)
      .order('generated_at', { ascending: false })
      .limit(1)

    if (!landings || landings.length === 0) {
      return NextResponse.json({ error: 'No landing found. Generate one first.' }, { status: 404 })
    }

    const { data: updated, error: updateError } = await admin
      .from('author_landings')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', landings[0].id)
      .select()
      .single()

    if (updateError || !updated) {
      return NextResponse.json(
        { error: `Failed to publish: ${updateError?.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ landing: updated })
  } catch (err: any) {
    console.error('POST /api/authors/[id]/publish-landing error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
