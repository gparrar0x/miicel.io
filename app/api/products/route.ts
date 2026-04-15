/**
 * GET /api/products  — list products with filters
 * POST /api/products — create product (auth required)
 * Thin handlers delegating to ProductService.
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { assertTenantAccess } from '@/lib/auth/tenant-access'
import { computeEffectivePrice, isDiscountActive } from '@/lib/pricing'
import { productCreateSchema } from '@/lib/schemas/order'
import { createClientFromRequest } from '@/lib/supabase/server'
import { ProductService } from '@/services/product.service'
import type { ProductRow } from '@/services/repositories/product.repo'
import { ProductRepo } from '@/services/repositories/product.repo'
import { TenantRepo } from '@/services/repositories/tenant.repo'

function withDiscountFields(product: ProductRow) {
  return {
    ...product,
    original_price: product.price,
    discount_active: isDiscountActive(product),
    effective_price: computeEffectivePrice(product),
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenant_id = searchParams.get('tenant_id')
    const category = searchParams.get('category') ?? undefined
    const active = searchParams.get('active')
    const search = searchParams.get('search') ?? undefined

    const supabase = createClientFromRequest(request)
    const service = new ProductService(new ProductRepo(supabase), new TenantRepo(supabase))

    const products = await service.list({
      tenant_id: tenant_id ? parseInt(tenant_id, 10) : undefined,
      category,
      active: active !== null ? active === 'true' : undefined,
      search,
    })

    return NextResponse.json({ products: products.map(withDiscountFields) })
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
    const supabase = createClientFromRequest(request)

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
    const access = await assertTenantAccess(supabase, user, parsed.data.tenant_id, {
      minRole: 'tenant_admin',
    })
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status })
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
