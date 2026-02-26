/**
 * CheckoutService — business logic for checkout/create-preference.
 * Orchestrates: tenant lookup → customer upsert → order creation → MP preference.
 */

import { AppError, NotFoundError, ValidationError } from '@skywalking/core/errors'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { decryptToken } from '@/lib/encryption'
import type { ICustomerRepo } from './repositories/customer.repo'
import type { IOrderRepo } from './repositories/order.repo'
import type { ITenantRepo } from './repositories/tenant.repo'

export interface CheckoutItem {
  productId: number
  name: string
  price: number
  quantity: number
  currency: string
  image?: string
  sizeId?: string
  color?: { id: number; name: string }
}

export interface CheckoutCustomer {
  name: string
  phone: string
  email: string
  notes?: string
}

export interface CheckoutInput {
  customer: CheckoutCustomer
  paymentMethod: 'cash' | 'mercadopago'
  items: CheckoutItem[]
  total: number
  currency: string
  tenantSlug: string
  returnUrl?: string
}

export interface CheckoutResult {
  success: true
  orderId: number
  preferenceId?: string
  initPoint?: string
}

export class CheckoutService {
  constructor(
    private readonly tenantRepo: ITenantRepo,
    private readonly customerRepo: ICustomerRepo,
    private readonly orderRepo: IOrderRepo,
  ) {}

  async execute(input: CheckoutInput): Promise<CheckoutResult> {
    const { customer, paymentMethod, items, total, currency, tenantSlug, returnUrl } = input

    // 1. Resolve tenant
    const tenant = await this.tenantRepo.findBySlug(tenantSlug)
    if (!tenant) throw new NotFoundError('Tenant')
    const tenantId = tenant.id

    // 2. Upsert customer (find by email, update or create)
    const customerId = await this.upsertCustomer(tenantId, customer)

    // 3. Create order
    const order = await this.orderRepo.create({
      tenant_id: tenantId,
      customer_id: customerId,
      // Checkout stores denormalised price/currency/image — cast to satisfy repo type
      items: items.map((item) => ({
        product_id: item.productId,
        name: item.name,
        price: item.price,
        unit_price: item.price,
        quantity: item.quantity,
        currency: item.currency,
        image: item.image,
        color: item.color,
        size_id: item.sizeId ?? null,
      })) as any,
      total,
      status: 'pending',
      payment_method: paymentMethod,
      notes: customer.notes ?? '',
    })

    // 4. Cash — done
    if (paymentMethod === 'cash') {
      return { success: true, orderId: order.id }
    }

    // 5. MercadoPago — build preference
    const tenantData = await this.tenantRepo.findBySlugWithToken(tenantSlug)
    if (!tenantData?.mp_access_token) {
      throw new ValidationError('MercadoPago not configured for this tenant')
    }

    const mpToken = decryptToken(tenantData.mp_access_token)
    const client = new MercadoPagoConfig({ accessToken: mpToken })
    const preference = new Preference(client)

    const baseUrl = returnUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const isProduction = !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')
    const locale = 'es'

    const preferenceData: Record<string, unknown> = {
      items: items.map((item) => ({
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
        success: `${baseUrl}/${locale}/${tenantSlug}/checkout/success`,
        failure: `${baseUrl}/${locale}/${tenantSlug}/checkout/failure`,
        pending: `${baseUrl}/${locale}/${tenantSlug}/checkout/pending`,
      },
      external_reference: order.id.toString(),
    }

    if (isProduction) {
      preferenceData.auto_return = 'approved'
      preferenceData.notification_url = `${baseUrl}/api/webhooks/mercadopago`
    }

    try {
      const result = await preference.create({ body: preferenceData as any })
      return {
        success: true,
        orderId: order.id,
        preferenceId: result.id,
        initPoint: result.init_point,
      }
    } catch (mpError: any) {
      const msg = mpError?.message || mpError?.error || 'Unknown MP error'
      throw new AppError(`MercadoPago API error: ${msg}`, 'MP_ERROR', 502)
    }
  }

  private async upsertCustomer(tenantId: number, customer: CheckoutCustomer): Promise<number> {
    const existing = await this.customerRepo.findByEmail(tenantId, customer.email)

    if (existing) {
      await this.customerRepo.update(existing.id, {
        name: customer.name,
        phone: customer.phone,
      })
      return existing.id
    }

    const created = await this.customerRepo.create({
      tenant_id: tenantId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    })
    return created.id
  }
}
