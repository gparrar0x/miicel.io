/**
 * API Route to fix MangoBajito product image URLs
 *
 * This is a temporary endpoint to update all mangobajito product images
 * to point to the correct public folder paths.
 *
 * Usage:
 *   Open in browser: http://localhost:3000/api/fix-images
 *
 * This will update all product image_urls for mangobajito tenant
 * from blob URLs to /tenants/mangobajito/product_XX.webp
 */

import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    // 1. Find mangobajito tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, slug')
      .eq('slug', 'mangobajito')
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        {
          error: 'MangoBajito tenant not found',
          details: tenantError?.message,
        },
        { status: 404 },
      )
    }

    // 2. Get all products for this tenant
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, image_url')
      .eq('tenant_id', tenant.id)
      .order('id')

    if (productsError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch products',
          details: productsError.message,
        },
        { status: 500 },
      )
    }

    // 3. Update each product's image_url
    const updates = []
    for (const product of products || []) {
      const newImageUrl = `/tenants/mangobajito/product_${product.id}.webp`

      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: newImageUrl })
        .eq('id', product.id)

      updates.push({
        id: product.id,
        name: product.name,
        oldUrl: product.image_url,
        newUrl: newImageUrl,
        success: !updateError,
        error: updateError?.message,
      })
    }

    return NextResponse.json({
      success: true,
      tenant: tenant.name,
      totalProducts: products?.length || 0,
      updates,
    })
  } catch (error) {
    console.error('Error fixing images:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
