/**
 * GET    /api/products/[id] — public product detail
 * PATCH  /api/products/[id] — update (auth)
 * DELETE /api/products/[id] — soft delete (auth)
 * Thin handlers delegating to ProductService.
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { productUpdateSchema } from '@/lib/schemas/order'
import { createClient } from '@/lib/supabase/server'
import { ProductService } from '@/services/product.service'
import { ProductRepo } from '@/services/repositories/product.repo'
import { TenantRepo } from '@/services/repositories/tenant.repo'

function parseId(id: string): number | null {
  const n = parseInt(id, 10)
  return Number.isNaN(n) ? null : n
}

function makeService(supabase: any): ProductService {
  return new ProductService(new ProductRepo(supabase), new TenantRepo(supabase))
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productId = parseId(id)
    if (productId === null)
      return NextResponse.json({ error: 'Invalid product ID.' }, { status: 400 })

    const supabase = await createClient()
    const service = makeService(supabase)
    const result = await service.getById(productId)

    return NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=120, stale-while-revalidate=300' },
    })
  } catch (err: any) {
    if (err instanceof AppError)
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    console.error('GET /api/products/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user)
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })

    const { id } = await params
    const productId = parseId(id)
    if (productId === null)
      return NextResponse.json({ error: 'Invalid product ID.' }, { status: 400 })

    const body = await request.json()
    const parsed = productUpdateSchema.safeParse(body)
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

    const service = makeService(supabase)
    const updated = await service.update(productId, parsed.data, {
      userId: user.id,
      userEmail: user.email,
    })

    return NextResponse.json({ product: updated })
  } catch (err: any) {
    if (err instanceof AppError)
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    console.error('PATCH /api/products/[id] error:', err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user)
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })

    const { id } = await params
    const productId = parseId(id)
    if (productId === null)
      return NextResponse.json({ error: 'Invalid product ID.' }, { status: 400 })

    const service = makeService(supabase)
    const deleted = await service.softDelete(productId, { userId: user.id, userEmail: user.email })

    return NextResponse.json({ success: true, product: deleted })
  } catch (err: any) {
    if (err instanceof AppError)
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    console.error('DELETE /api/products/[id] error:', err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    )
  }
}
