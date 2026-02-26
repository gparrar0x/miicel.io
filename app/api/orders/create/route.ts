/**
 * POST /api/orders/create
 * Thin handler: validate → call OrderService → return response.
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getClientIp, rateLimitExceededResponse, ratelimitStrict } from '@/lib/rate-limit'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { OrderService } from '@/services/order.service'
import { CustomerRepo } from '@/services/repositories/customer.repo'
import { OrderRepo } from '@/services/repositories/order.repo'
import { ProductRepo } from '@/services/repositories/product.repo'
import { TenantRepo } from '@/services/repositories/tenant.repo'

const orderRequestSchema = z.object({
  tenantSlug: z.string().min(1),
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
    email: z.string().email(),
  }),
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        sizeId: z.string().optional(),
      }),
    )
    .min(1),
  paymentMethod: z.literal('mercadopago'),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { success, limit, remaining, reset } = await ratelimitStrict.limit(ip)
  if (!success) return rateLimitExceededResponse(limit, remaining, reset)

  try {
    const body = await request.json()
    const parsed = orderRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const service = new OrderService(
      new TenantRepo(supabase),
      new CustomerRepo(supabase),
      new OrderRepo(supabase),
      new ProductRepo(supabase),
    )

    const result = await service.createOrder(parsed.data)

    return NextResponse.json(result)
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('POST /api/orders/create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
