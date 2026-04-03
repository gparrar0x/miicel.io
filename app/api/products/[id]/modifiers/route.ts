/**
 * GET /api/products/[id]/modifiers
 * Public endpoint — returns modifier groups with nested options for a product.
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const { data: groups, error } = await supabase
      .from('modifier_groups')
      .select(`
        id, tenant_id, product_id, name, min_selections, max_selections,
        display_order, active, created_at,
        modifier_options (
          id, tenant_id, modifier_group_id, name, price_delta,
          active, display_order
        )
      `)
      .eq('product_id', id)
      .eq('active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('GET modifiers error:', error)
      return NextResponse.json({ error: 'Failed to fetch modifiers' }, { status: 500 })
    }

    // Filter inactive options and sort them
    const result = (groups ?? []).map((g) => ({
      ...g,
      options: (g.modifier_options ?? [])
        .filter((o: any) => o.active)
        .sort((a: any, b: any) => a.display_order - b.display_order),
    }))

    // Remove the raw modifier_options key
    const cleaned = result.map(({ modifier_options, ...rest }) => rest)

    return NextResponse.json({ modifiers: cleaned })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('GET /api/products/[id]/modifiers error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
