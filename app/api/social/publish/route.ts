/**
 * POST /api/social/publish — publish immediately or schedule an IG post.
 * If scheduled_at is present → schedule. Otherwise → publish now.
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { assertTenantAccess } from '@/lib/auth/tenant-access'
import { publishRequestSchema } from '@/lib/schemas/social'
import { createClientFromRequest } from '@/lib/supabase/server'
import { SocialService } from '@/services/social.service'
import { SocialRepo } from '@/services/repositories/social.repo'
import { InstagramService } from '@/services/instagram.service'

export async function POST(request: Request) {
  try {
    const supabase = createClientFromRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = publishRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Verify tenant access
    const access = await assertTenantAccess(supabase, user, parsed.data.tenant_id, {
      minRole: 'tenant_admin',
    })
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const service = new SocialService(new SocialRepo(supabase), new InstagramService())
    const isScheduled = Boolean(parsed.data.scheduled_at)

    const post = isScheduled
      ? await service.schedulePost(parsed.data)
      : await service.publishPost(parsed.data)

    return NextResponse.json({ post }, { status: isScheduled ? 201 : 202 })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('POST /api/social/publish error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
