/**
 * GET /api/content/history — list generations for a product.
 * Query params: tenant_id (required), product_id (required), limit (optional)
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { assertTenantAccess } from '@/lib/auth/tenant-access'
import { createClientFromRequest, createServiceRoleClient } from '@/lib/supabase/server'
import { ContentGenerationService } from '@/services/content-generation.service'
import { ContentGenerationRepo } from '@/services/repositories/content-generation.repo'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantIdParam = searchParams.get('tenant_id')
    const productIdParam = searchParams.get('product_id')
    const limitParam = searchParams.get('limit')

    if (!tenantIdParam || !productIdParam) {
      return NextResponse.json({ error: 'tenant_id and product_id are required.' }, { status: 400 })
    }

    const tenantId = parseInt(tenantIdParam, 10)
    const productId = parseInt(productIdParam, 10)
    const limit = limitParam ? parseInt(limitParam, 10) : undefined

    if (isNaN(tenantId) || isNaN(productId)) {
      return NextResponse.json(
        { error: 'tenant_id and product_id must be integers.' },
        { status: 400 },
      )
    }

    const supabase = createClientFromRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const access = await assertTenantAccess(supabase, user, tenantId, { minRole: 'staff' })
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const isSA = access.role === 'superadmin'
    const readClient = isSA ? createServiceRoleClient() : supabase
    const service = new ContentGenerationService(new ContentGenerationRepo(readClient))
    const generations = await service.getHistory(tenantId, productId, limit)

    return NextResponse.json({ generations, total: generations.length })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('GET /api/content/history error:', err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    )
  }
}
