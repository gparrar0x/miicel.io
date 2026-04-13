/**
 * GET    /api/social/posts/[id] — get post detail.
 * DELETE /api/social/posts/[id] — cancel a scheduled post.
 * PATCH  /api/social/posts/[id] — edit a scheduled/draft post.
 *
 * Query: tenant_id required (ownership check).
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { editPostSchema } from '@/lib/schemas/social'
import { createClientFromRequest } from '@/lib/supabase/server'
import { SocialService } from '@/services/social.service'
import { SocialRepo } from '@/services/repositories/social.repo'
import { InstagramService } from '@/services/instagram.service'

type Params = { params: Promise<{ id: string }> }

async function resolveContext(request: Request, params: Params) {
  const supabase = createClientFromRequest(request)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { error: 'Unauthorized', status: 401 as const }

  const { searchParams } = new URL(request.url)
  const tenantId = Number(searchParams.get('tenant_id'))
  if (!tenantId || !Number.isInteger(tenantId) || tenantId <= 0) {
    return { error: 'tenant_id query param required', status: 400 as const }
  }

  // Verify tenant ownership
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, owner_id')
    .eq('id', tenantId)
    .maybeSingle()

  if (tenantError || !tenant) return { error: 'Tenant not found', status: 404 as const }
  if (tenant.owner_id !== user.id) return { error: 'Forbidden', status: 403 as const }

  const { id } = await params.params
  const service = new SocialService(new SocialRepo(supabase), new InstagramService())

  return { id, tenantId, service, supabase }
}

export async function GET(request: Request, params: Params) {
  try {
    const ctx = await resolveContext(request, params)
    if ('error' in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status })
    }

    const post = await ctx.service.getPost(ctx.id, ctx.tenantId)
    return NextResponse.json({ post })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('GET /api/social/posts/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function DELETE(request: Request, params: Params) {
  try {
    const ctx = await resolveContext(request, params)
    if ('error' in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status })
    }

    const post = await ctx.service.cancelScheduled(ctx.id, ctx.tenantId)
    return NextResponse.json({ post })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('DELETE /api/social/posts/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function PATCH(request: Request, params: Params) {
  try {
    const ctx = await resolveContext(request, params)
    if ('error' in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status })
    }

    const body = await request.json()
    const parsed = editPostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const post = await ctx.service.editScheduled(ctx.id, ctx.tenantId, parsed.data)
    return NextResponse.json({ post })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('PATCH /api/social/posts/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
