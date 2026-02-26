/**
 * GET /api/products  — list products with filters
 * POST /api/products — create product (auth required)
 * Thin handlers delegating to ProductService.
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { productCreateSchema } from '@/lib/schemas/order'
import { createClient } from '@/lib/supabase/server'
import { ProductService } from '@/services/product.service'
import { ProductRepo } from '@/services/repositories/product.repo'
import { TenantRepo } from '@/services/repositories/tenant.repo'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenant_id = searchParams.get('tenant_id')
    const category = searchParams.get('category') ?? undefined
    const active = searchParams.get('active')
    const search = searchParams.get('search') ?? undefined

    const supabase = await createClient()
    const service = new ProductService(new ProductRepo(supabase), new TenantRepo(supabase))

    const products = await service.list({
      tenant_id: tenant_id ? parseInt(tenant_id, 10) : undefined,
      category,
      active: active !== null ? active === 'true' : undefined,
      search,
    })

    return NextResponse.json({ products })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('GET /api/products error:', err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = productCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // POST create uses auth client (RLS enforced); serviceRole not needed
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq('id', parsed.data.tenant_id)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
    }

    const isSuperadmin = user.email?.toLowerCase().trim() === 'gparrar@skywalking.dev'
    if (!isSuperadmin && tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this tenant.' }, { status: 403 })
    }

    const service = new ProductService(new ProductRepo(supabase), new TenantRepo(supabase))
    const _product = await service.list({ tenant_id: undefined }) // warm service
    // Direct creation via repo to keep RLS on auth client
    const repo = new ProductRepo(supabase)
    const created = await repo.create(parsed.data)

    return NextResponse.json({ product: created }, { status: 201 })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('POST /api/products error:', err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    )
  }
}
