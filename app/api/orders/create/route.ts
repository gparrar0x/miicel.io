/**
 * POST /api/orders/create - Create Order
 *
 * SKY-4 T2: Creates order with product ownership validation, stock checks, customer management
 * Uses service-role client to bypass RLS
 */

import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema
const orderRequestSchema = z.object({
  tenantSlug: z.string().min(1),
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
    email: z.string().email(),
  }),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number().min(1),
      sizeId: z.string().optional(), // For products with size variants
    })
  ).min(1),
  paymentMethod: z.literal('mercadopago'), // Solo digital por ahora
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    // Parse & validate
    const body = await request.json()
    const validationResult = orderRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { tenantSlug, customer, items, paymentMethod, notes } = validationResult.data

    // Use service role client (bypasses RLS)
    const supabase = createServiceRoleClient()

    // Get tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, template')
      .eq('slug', tenantSlug)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const tenantId = tenant.id

    // Validate product ownership & stock (CRITICAL SECURITY)
    const productIds = items.map(item => item.productId)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, tenant_id, stock, price, active, name, metadata')
      .in('id', productIds)

    if (productsError || !products) {
      return NextResponse.json(
        { error: 'Failed to validate products' },
        { status: 500 }
      )
    }

    // Security check: verify ALL products belong to tenant
    const invalidProducts = products.filter(p => p.tenant_id !== tenantId)
    if (invalidProducts.length > 0) {
      return NextResponse.json(
        { error: 'Forbidden: Product ownership mismatch' },
        { status: 403 }
      )
    }

    // Check stock & active status
    const orderItems: Array<{
      product_id: number
      name: string
      quantity: number
      unit_price: number
      size_id: string | null
    }> = []
    let total = 0

    for (const item of items) {
      const product = products.find(p => p.id === item.productId)

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        )
      }

      if (!product.active) {
        return NextResponse.json(
          { error: `Product ${product.name} is not available` },
          { status: 400 }
        )
      }

      // Validate stock based on size (if applicable) or general stock
      let availableStock = product.stock ?? 0
      let stockLabel = product.name
      
      // If product has size variants and sizeId is provided, validate size-specific stock
      const metadata = product.metadata as { sizes?: Array<{ id: string; label: string; stock: number }> } | null
      if (item.sizeId && metadata?.sizes) {
        const selectedSize = metadata.sizes.find((s: any) => s.id === item.sizeId)
        
        if (!selectedSize) {
          return NextResponse.json(
            { error: `Invalid size for ${product.name}` },
            { status: 400 }
          )
        }
        
        availableStock = selectedSize.stock ?? 0
        stockLabel = `${product.name} (${selectedSize.label})`
      }
      
      // Gastronomy template: Ignore stock levels (infinite supply)
      // Other templates: Enforce stock limits
      if (tenant.template !== 'gastronomy' && availableStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${stockLabel}. Available: ${availableStock}` },
          { status: 400 }
        )
      }

      orderItems.push({
        product_id: product.id,
        name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        size_id: item.sizeId || null, // Include size for stock validation/decrement
      })

      total += product.price * item.quantity
    }

    // Create/update customer
    let customerId: number

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('phone', customer.phone)
      .eq('email', customer.email)
      .maybeSingle()

    if (existingCustomer) {
      customerId = existingCustomer.id
      // Update customer info
      await supabase
        .from('customers')
        .update({
          name: customer.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId)
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          tenant_id: tenantId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        })
        .select('id')
        .single()

      if (customerError || !newCustomer) {
        console.error('Error creating customer:', customerError)
        return NextResponse.json(
          {
            error: 'Failed to create customer',
            details: customerError?.message || 'Unknown error',
            code: customerError?.code,
          },
          { status: 500 }
        )
      }

      customerId = newCustomer.id
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        tenant_id: tenantId,
        customer_id: customerId,
        items: orderItems,
        total,
        status: 'pending',
        payment_method: paymentMethod,
        notes: notes || null,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        {
          error: 'Failed to create order',
          details: orderError?.message || 'Unknown error',
          code: orderError?.code,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      total,
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/orders/create:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
