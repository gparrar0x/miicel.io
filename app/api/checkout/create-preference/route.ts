/**
 * POST /api/checkout/create-preference
 * Thin handler: validate → call CheckoutService → return response.
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getClientIp, rateLimitExceededResponse, ratelimitStrict } from '@/lib/rate-limit'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { CheckoutService } from '@/services/checkout.service'
import { CustomerRepo } from '@/services/repositories/customer.repo'
import { OrderRepo } from '@/services/repositories/order.repo'
import { TenantRepo } from '@/services/repositories/tenant.repo'

const checkoutRequestSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^\d{10}$/),
    email: z.string().email(),
    notes: z.string().optional(),
  }),
  paymentMethod: z.enum(['cash', 'mercadopago']),
  items: z.array(
    z.object({
      productId: z.number(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
      currency: z.string(),
      image: z.string().optional(),
      sizeId: z.string().optional(),
      color: z.object({ id: z.number(), name: z.string() }).optional(),
    }),
  ),
  total: z.number(),
  currency: z.string(),
  tenantId: z.string(),
  returnUrl: z.string().optional(),
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { success, limit, remaining, reset } = await ratelimitStrict.limit(ip)
  if (!success) return rateLimitExceededResponse(limit, remaining, reset)

  try {
    const body = await request.json()
    const parsed = checkoutRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { customer, paymentMethod, items, total, currency, tenantId, returnUrl } = parsed.data

    const supabase = createServiceRoleClient()
    const service = new CheckoutService(
      new TenantRepo(supabase),
      new CustomerRepo(supabase),
      new OrderRepo(supabase),
    )

    const result = await service.execute({
      customer,
      paymentMethod,
      items,
      total,
      currency,
      tenantSlug: tenantId,
      returnUrl,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('POST /api/checkout/create-preference error:', err)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : String(err),
        debug: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
      },
      { status: 500 },
    )
  }
}
