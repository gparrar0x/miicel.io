/**
 * POST /api/content/generate — start a content generation job.
 * Thin handler: validate → auth → service.startGeneration (fire-and-forget pipeline).
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { assertTenantAccess } from '@/lib/auth/tenant-access'
import { generateRequestSchema } from '@/lib/schemas/content-generation'
import { createClientFromRequest, createServiceRoleClient } from '@/lib/supabase/server'
import { ContentGenerationService } from '@/services/content-generation.service'
import { ContentGenerationRepo } from '@/services/repositories/content-generation.repo'

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
    const parsed = generateRequestSchema.safeParse(body)

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

    // RLS only allows service_role to INSERT — use service client for writes
    const writeClient = createServiceRoleClient()
    const service = new ContentGenerationService(new ContentGenerationRepo(writeClient))
    const generation = await service.startGeneration(parsed.data)

    return NextResponse.json({ generation }, { status: 202 })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('POST /api/content/generate error:', err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    )
  }
}
