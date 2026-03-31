/**
 * POST /api/authors/[id]/generate-landing
 * Calls Claude API, stores draft, returns content JSON.
 * Vercel timeout: set to 60s (Claude call can take ~10s).
 */

export const maxDuration = 60

import { NextResponse } from 'next/server'
import { isSuperadmin } from '@/lib/auth/constants'
import { generateLandingRequestSchema } from '@/lib/schemas/author-landing'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { AuthorLandingService } from '@/lib/services/author-landing-service'

function parseId(id: string): number | null {
  const n = parseInt(id, 10)
  return Number.isNaN(n) ? null : n
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await request.json().catch(() => ({}))
    const parsed = generateLandingRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const service = new AuthorLandingService(createServiceRoleClient())
    const author = await service.getAuthor(authorId)
    if (!author) {
      return NextResponse.json({ error: 'Author not found.' }, { status: 404 })
    }

    // Tenant ownership check
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

    const landing = await service.generateLanding({
      authorId,
      customPrompt: parsed.data.custom_prompt,
    })

    return NextResponse.json({ landing }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/authors/[id]/generate-landing error:', err)

    if (err.message?.includes('Author not found')) {
      return NextResponse.json({ error: 'Author not found.' }, { status: 404 })
    }

    if (err.message?.includes('Claude') || err.message?.includes('structured output')) {
      return NextResponse.json(
        { error: 'AI generation failed. Please try again.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
