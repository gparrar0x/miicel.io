/**
 * POST /api/admin/modifier-groups
 * Create a modifier group for a product. Admin auth required.
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertTenantAccess } from '@/lib/auth/tenant-access'
import { createClientFromRequest, createServiceRoleClient } from '@/lib/supabase/server'

const createSchema = z.object({
  product_id: z.number(),
  name: z.string().min(1),
  min_selections: z.number().int().min(0).default(0),
  max_selections: z.number().int().min(1).default(1),
  display_order: z.number().int().default(0),
})

export async function POST(request: Request) {
  try {
    const supabase = createClientFromRequest(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Validate product ownership via tenant access
    const serviceClient = createServiceRoleClient()
    const { data: product } = await serviceClient
      .from('products')
      .select('id, tenant_id')
      .eq('id', parsed.data.product_id)
      .maybeSingle()

    if (!product || product.tenant_id === null) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const access = await assertTenantAccess(supabase, user, product.tenant_id, {
      minRole: 'tenant_admin',
    })
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    if (parsed.data.min_selections > parsed.data.max_selections) {
      return NextResponse.json(
        { error: 'min_selections must be <= max_selections' },
        { status: 400 },
      )
    }

    const { data: group, error } = await serviceClient
      .from('modifier_groups')
      .insert({
        tenant_id: product.tenant_id,
        product_id: parsed.data.product_id,
        name: parsed.data.name,
        min_selections: parsed.data.min_selections,
        max_selections: parsed.data.max_selections,
        display_order: parsed.data.display_order,
      })
      .select()
      .single()

    if (error) {
      console.error('Create modifier group error:', error)
      return NextResponse.json({ error: 'Failed to create modifier group' }, { status: 500 })
    }

    return NextResponse.json({ group }, { status: 201 })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('POST /api/admin/modifier-groups error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
