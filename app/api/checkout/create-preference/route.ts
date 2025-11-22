/**
 * POST /api/checkout/create-preference - Create Checkout Preference
 *
 * SKY-4 T3: Creates order and generates real MercadoPago checkout URL
 * Uses MercadoPago SDK with tenant-specific encrypted tokens
 */

import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { z } from 'zod'

// Validation schema
const checkoutRequestSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^\d{10}$/),
    email: z.string().email(),
    notes: z.string().optional(),
  }),
  paymentMethod: z.enum(['cash', 'mercadopago']),
  items: z.array(z.object({
    productId: z.number(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    currency: z.string(),
    image: z.string().optional(),
    sizeId: z.string().optional(), // Add sizeId support for size variants
    color: z.object({
      id: z.number(),
      name: z.string(),
    }).optional(),
  })),
  total: z.number(),
  currency: z.string(),
  tenantId: z.string(),
})

export async function POST(request: Request) {
  try {
    // Step 1: Parse and validate request body
    const body = await request.json()
    const validationResult = checkoutRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { customer, paymentMethod, items, total, currency, tenantId } = validationResult.data

    // Use service role client (bypasses RLS)
    const supabase = createServiceRoleClient()

    // Step 2: Get tenant_id from slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', tenantId)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const tenant_id = tenant.id

    // Step 3: Create or get customer
    let customerId: number

    // Check if customer exists by email
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('email', customer.email)
      .maybeSingle()

    if (existingCustomer) {
      customerId = existingCustomer.id
      // Update customer info
      await supabase
        .from('customers')
        .update({
          name: customer.name,
          phone: customer.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId)
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          tenant_id,
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

    // Step 4: Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        tenant_id,
        customer_id: customerId,
        items: items.map(item => ({
          product_id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          currency: item.currency,
          image: item.image,
          color: item.color,
          size_id: item.sizeId || null, // Include size_id for stock validation/decrement
        })),
        total,
        status: paymentMethod === 'cash' ? 'pending' : 'pending',
        payment_method: paymentMethod,
        notes: customer.notes || '',
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

    // Step 5: Handle payment method
    if (paymentMethod === 'mercadopago') {
      // Get tenant MP access token (encrypted)
      const { data: tenantData, error: tenantTokenError } = await supabase
        .from('tenants')
        .select('mp_access_token')
        .eq('slug', tenantId)
        .single()

      if (tenantTokenError || !tenantData || !tenantData.mp_access_token) {
        return NextResponse.json(
          { error: 'MercadoPago not configured for this tenant' },
          { status: 400 }
        )
      }

      // Decrypt token
      const mpToken = decryptToken(tenantData.mp_access_token)

      // Initialize MP client
      const client = new MercadoPagoConfig({ accessToken: mpToken })
      const preference = new Preference(client)

      // Create preference
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const isProduction = !baseUrl.includes('localhost')

      const preferenceData: any = {
        items: items.map((item, index) => ({
          id: item.productId.toString(),
          title: item.name,
          unit_price: item.price,
          quantity: item.quantity,
          currency_id: currency === 'ARS' ? 'ARS' : 'USD',
          description: item.name,
        })),
        payer: {
          name: customer.name,
          email: customer.email,
          phone: { number: customer.phone },
        },
        back_urls: {
          success: `${baseUrl}/${tenantId}?payment=success`,
          failure: `${baseUrl}/${tenantId}?payment=failure`,
          pending: `${baseUrl}/${tenantId}?payment=pending`,
        },
        external_reference: order.id.toString(),
      }

      // Only add auto_return in production (MP doesn't allow it with localhost)
      if (isProduction) {
        preferenceData.auto_return = 'approved'
        preferenceData.notification_url = `${baseUrl}/api/webhooks/mercadopago`
      }

      console.log('Creating MP preference with data:', JSON.stringify(preferenceData, null, 2))
      const result = await preference.create({ body: preferenceData as any })

      return NextResponse.json({
        success: true,
        orderId: order.id,
        preferenceId: result.id,
        initPoint: result.init_point,
      })
    } else {
      // Cash payment - no redirect needed
      return NextResponse.json({
        success: true,
        orderId: order.id,
      })
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/checkout/create-preference:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

