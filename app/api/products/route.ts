/**
 * GET /api/products - List Products with Filters
 * POST /api/products - Create New Product
 *
 * GET supports filtering by:
 * - tenant_id (required for owner, optional for public)
 * - category (filter by category)
 * - active (filter by active status)
 * - search (search by name)
 *
 * POST requires authentication and tenant ownership.
 * RLS policies enforce tenant isolation.
 *
 * Performance: <100ms target for GET with proper indexing
 * Security: RLS enforced, input validation via Zod
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { productCreateSchema } from '@/lib/schemas/order'

/**
 * GET /api/products - List products with filters
 *
 * Query params:
 * - tenant_id: number (filter by tenant)
 * - category: string (filter by category)
 * - active: boolean (filter by active status)
 * - search: string (search by name)
 *
 * RLS behavior:
 * - Public users: only see active products
 * - Authenticated owners: see all their products
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenant_id = searchParams.get('tenant_id')
    const category = searchParams.get('category')
    const active = searchParams.get('active')
    const search = searchParams.get('search')

    const supabase = await createClient()

    // Build query with proper error handling
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (tenant_id) {
      query = query.eq('tenant_id', parseInt(tenant_id))
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (active !== null && active !== undefined) {
      query = query.eq('active', active === 'true')
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Unexpected error in GET /api/products:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products - Create new product
 *
 * Request body:
 * {
 *   tenant_id: number,
 *   name: string,
 *   description?: string,
 *   price: number,
 *   category?: string,
 *   stock?: number,
 *   image_url?: string,
 *   active?: boolean
 * }
 *
 * Requires:
 * - User must be authenticated
 * - User must own the tenant
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Step 1: Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Step 2: Parse and validate request body
    const body = await request.json()
    const validationResult = productCreateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const productData = validationResult.data

    // Step 3: Verify user owns the tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq('id', productData.tenant_id)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found.' },
        { status: 404 }
      )
    }

    if (tenant.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden. You do not own this tenant.' },
        { status: 403 }
      )
    }

    // Step 4: Create product (RLS will enforce ownership)
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        tenant_id: productData.tenant_id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        stock: productData.stock ?? 0,
        image_url: productData.image_url,
        active: productData.active ?? true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating product:', insertError)
      return NextResponse.json(
        { error: 'Failed to create product. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/products:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
