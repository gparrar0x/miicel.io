/**
 * GET /api/social/posts — list IG posts for a tenant.
 * Query: tenant_id (required), status (optional), limit, offset.
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { assertTenantAccess } from '@/lib/auth/tenant-access'
import { listPostsQuerySchema } from '@/lib/schemas/social'
import { createClientFromRequest } from '@/lib/supabase/server'
import { SocialService } from '@/services/social.service'
import { SocialRepo } from '@/services/repositories/social.repo'
import { InstagramService } from '@/services/instagram.service'

export async function GET(request: Request) {
  try {
    const supabase = createClientFromRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const parsed = listPostsQuerySchema.safeParse(Object.fromEntries(searchParams))

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { tenant_id, status, limit, offset } = parsed.data

    // Verify tenant access
    const access = await assertTenantAccess(supabase, user, tenant_id, { minRole: 'staff' })
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const service = new SocialService(new SocialRepo(supabase), new InstagramService())
    const posts = await service.listPosts(tenant_id, { status, limit, offset })

    return NextResponse.json({ posts, total: posts.length })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('GET /api/social/posts error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
