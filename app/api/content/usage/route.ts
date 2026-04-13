/**
 * GET /api/content/usage — current period usage + limits for a tenant.
 * Query params: tenant_id (required)
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { isSuperadmin } from '@/lib/auth/constants'
import { createClientFromRequest, createServiceRoleClient } from '@/lib/supabase/server'
import { ContentGenerationService } from '@/services/content-generation.service'
import { ContentGenerationRepo } from '@/services/repositories/content-generation.repo'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantIdParam = searchParams.get('tenant_id')

    if (!tenantIdParam) {
      return NextResponse.json({ error: 'tenant_id is required.' }, { status: 400 })
    }

    const tenantId = parseInt(tenantIdParam, 10)
    if (isNaN(tenantId)) {
      return NextResponse.json({ error: 'tenant_id must be an integer.' }, { status: 400 })
    }

    const supabase = createClientFromRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const { data: tenant } = await supabase
      .from('tenants')
      .select('owner_id')
      .eq('id', tenantId)
      .maybeSingle()

    const isSA = isSuperadmin(user.email)
    if (!tenant || (!isSA && tenant.owner_id !== user.id)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    const readClient = isSA ? createServiceRoleClient() : supabase
    const service = new ContentGenerationService(new ContentGenerationRepo(readClient))
    const { usage, limits, plan } = await service.getUsage(tenantId)

    return NextResponse.json({
      tenant_id: tenantId,
      period_start: new Date().toISOString().slice(0, 7) + '-01',
      images_used: usage?.images_used ?? 0,
      videos_used: usage?.videos_used ?? 0,
      images_limit: limits.images,
      videos_limit: limits.videos,
      plan,
    })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('GET /api/content/usage error:', err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    )
  }
}
