/**
 * GET /api/products/[id] - Get Product Details (Public)
 * PATCH /api/products/[id] - Update Product
 * DELETE /api/products/[id] - Soft Delete Product
 *
 * GET is public (for storefront), PATCH/DELETE require authentication.
 * DELETE performs soft delete (sets active = false).
 *
 * Security:
 * - RLS enforced via ownership check
 * - Validation via Zod schemas
 * - Always updates updated_at timestamp
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { productUpdateSchema } from '@/lib/schemas/order'

/**
 * GET /api/products/[id] - Get product details
 *
 * Public endpoint for storefront pages to display product details.
 * Returns product with full details including images, colors, stock.
 *
 * Cache: 2 minutes (products change less frequently than tenant config)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID.' },
        { status: 400 }
      )
    }

    // Query product with tenant info for currency
    const { data: product, error } = await supabase
      .from('products')
      .select('*, tenants(slug)')
      .eq('id', productId)
      .eq('active', true)
      .maybeSingle()

    if (error) {
      console.error('Error fetching product:', error)
      return NextResponse.json(
        { error: 'Failed to fetch product.' },
        { status: 500 }
      )
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      )
    }

    // Build response matching frontend Product interface
    const response = {
      id: product.id.toString(),
      name: product.name,
      description: product.description || '',
      price: product.price,
      currency: '$', // TODO: Make configurable per tenant
      images: product.image_url ? [product.image_url] : [],
      colors: [], // TODO: Add colors support when product variants are implemented
      stock: product.stock || 0,
      category: product.category || 'General',
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/products/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/products/[id] - Update existing product
 *
 * Request body (all fields optional):
 * {
 *   name?: string,
 *   description?: string,
 *   price?: number,
 *   category?: string,
 *   stock?: number,
 *   image_url?: string,
 *   active?: boolean
 * }
 *
 * Requires:
 * - User must be authenticated
 * - User must own the tenant that owns this product
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Step 2: Parse product ID
    const { id } = await params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID.' },
        { status: 400 }
      )
    }

    // Step 3: Parse and validate request body
    const body = await request.json()
    const validationResult = productUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    // Step 4: Verify product exists and user owns it
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, tenant_id, tenants!inner(owner_id)')
      .eq('id', productId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching product:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch product. Please try again.' },
        { status: 500 }
      )
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      )
    }

    // Type assertion for nested relation
    const tenants = product.tenants as unknown as { owner_id: string }
    if (tenants.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden. You do not own this product.' },
        { status: 403 }
      )
    }

    // Step 5: Update product
    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating product:', updateError)
      return NextResponse.json(
        { error: 'Failed to update product. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product: updated })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/products/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/[id] - Soft delete product
 *
 * Sets active = false instead of removing from database.
 * Preserves data integrity for historical orders.
 *
 * Requires:
 * - User must be authenticated
 * - User must own the tenant that owns this product
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Step 2: Parse product ID
    const { id } = await params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID.' },
        { status: 400 }
      )
    }

    // Step 3: Verify product exists and user owns it
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, tenant_id, active, tenants!inner(owner_id)')
      .eq('id', productId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching product:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch product. Please try again.' },
        { status: 500 }
      )
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      )
    }

    // Type assertion for nested relation
    const tenants = product.tenants as unknown as { owner_id: string }
    if (tenants.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden. You do not own this product.' },
        { status: 403 }
      )
    }

    // Step 4: Soft delete (set active = false)
    const { data: deleted, error: deleteError } = await supabase
      .from('products')
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select()
      .single()

    if (deleteError) {
      console.error('Error deleting product:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete product. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      product: deleted,
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/products/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
