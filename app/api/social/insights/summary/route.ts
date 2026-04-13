/**
 * GET /api/social/insights/summary — aggregated insights for a tenant.
 * Query: tenant_id (required), period_days (optional, default 30, max 90).
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { insightsSummaryQuerySchema } from '@/lib/schemas/social'
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
    const parsed = insightsSummaryQuerySchema.safeParse(Object.fromEntries(searchParams))

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { tenant_id, period_days } = parsed.data

    // Verify tenant ownership
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq('id', tenant_id)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
    }

    if (tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this tenant.' }, { status: 403 })
    }

    const service = new SocialService(new SocialRepo(supabase), new InstagramService())
    const summary = await service.getInsightsSummary(tenant_id, period_days)

    return NextResponse.json({ summary })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('GET /api/social/insights/summary error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
