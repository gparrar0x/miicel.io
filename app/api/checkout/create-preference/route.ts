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
  returnUrl: z.string().optional(), // Client-provided base URL (e.g., window.location.origin)
})

export async function POST(request: Request) {
  try {
    // Step 1: Parse and validate request body
    const body = await request.json()
    console.log('📦 Received checkout request:', {
      tenantId: body.tenantId,
      paymentMethod: body.paymentMethod,
      hasReturnUrl: !!body.returnUrl,
      returnUrl: body.returnUrl,
      itemCount: body.items?.length
    })
    
    const validationResult = checkoutRequestSchema.safeParse(body)

    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.issues)
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { customer, paymentMethod, items, total, currency, tenantId, returnUrl } = validationResult.data

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
      // Use client-provided returnUrl if available (more reliable than env var)
      const baseUrl = returnUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const isProduction = !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')
      const locale = 'es' // Default locale for MP redirects
      
      console.log('💳 Creating MP preference:', { 
        baseUrl, 
        isProduction, 
        hasReturnUrl: !!returnUrl,
        source: returnUrl ? 'client' : 'env' 
      })

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
          success: `${baseUrl}/${locale}/${tenantId}/checkout/success`,
          failure: `${baseUrl}/${locale}/${tenantId}/checkout/failure`,
          pending: `${baseUrl}/${locale}/${tenantId}/checkout/pending`,
        },
        external_reference: order.id.toString(),
      }

      // Only add auto_return and notification_url in production
      // MP REJECTS auto_return with localhost URLs (even though back_urls work)
      if (isProduction) {
        preferenceData.auto_return = 'approved'
        preferenceData.notification_url = `${baseUrl}/api/webhooks/mercadopago`
        console.log('✅ Production mode - auto_return enabled')
      } else {
        console.log('⚠️  Localhost detected:')
        console.log('   - auto_return DISABLED (MP rejects it with localhost)')
        console.log('   - back_urls enabled → "Volver al sitio" button will appear')
        console.log('   - webhook DISABLED (needs public URL)')
      }

      console.log('Creating MP preference with data:', JSON.stringify(preferenceData, null, 2))
      
      // Validate back_urls before sending to MP
      if (!preferenceData.back_urls?.success) {
        throw new Error('back_urls.success is required but missing')
      }

      let result
      try {
        result = await preference.create({ body: preferenceData as any })
        console.log('✅ MP preference created:', result.id)
      } catch (mpError: any) {
        console.error('💥 MercadoPago SDK error:')
        console.error('Full error object:', JSON.stringify(mpError, null, 2))
        console.error('Error message:', mpError?.message || mpError?.error || String(mpError))
        console.error('Error cause:', mpError?.cause)
        console.error('API response:', mpError?.api_response)
        
        // Re-throw with better message
        throw new Error(
          `MercadoPago API error: ${mpError?.message || mpError?.error || 'Unknown error'}. ${
            mpError?.cause?.message ? `Cause: ${mpError.cause.message}` : ''
          }`
        )
      }

      // Note: checkout_id field not yet in types - will add in future migration
      // Migration 028 adds checkout_id column but types need regeneration

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
  } catch (error: any) {
    console.error('💥 Unexpected error in POST /api/checkout/create-preference:')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error is Error instance?:', error instanceof Error)
    console.error('Error object keys:', error ? Object.keys(error) : 'null')
    
    // Handle both Error instances and plain objects
    let errorMessage = 'Internal server error'
    let errorDetails = null
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack
    } else if (typeof error === 'object' && error !== null) {
      // Try to extract meaningful info from object
      errorMessage = error.message || error.error || error.error_description || JSON.stringify(error)
      errorDetails = JSON.stringify(error, null, 2)
      console.error('Error as JSON:', errorDetails)
    } else {
      errorMessage = String(error)
    }
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    )
  }
}

