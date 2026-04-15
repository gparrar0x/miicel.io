/**
 * CheckoutService — business logic for checkout/create-preference.
 * Orchestrates: tenant lookup → customer upsert → order creation → MP preference.
 * Prices are always resolved from DB — client-sent prices are ignored for security.
 */

import { AppError, NotFoundError, ValidationError } from '@skywalking/core/errors'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { decryptToken } from '@/lib/encryption'
import { isNequiEnabled } from '@/lib/flags'
import { computeEffectivePrice } from '@/lib/pricing'
import { NequiClient } from './nequi/nequi.client'
import type { ICustomerRepo } from './repositories/customer.repo'
import type { IOrderRepo } from './repositories/order.repo'
import type { IProductRepo } from './repositories/product.repo'
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
  modifiersDelta?: number
  modifiersSummary?: string
}

export interface CheckoutCustomer {
  name: string
  phone: string
  email: string
  notes?: string
}

export interface CheckoutInput {
  customer: CheckoutCustomer
  paymentMethod: 'cash' | 'mercadopago' | 'nequi'
  items: CheckoutItem[]
  total: number
  currency: string
  tenantSlug: string
  returnUrl?: string
  nequiPhoneNumber?: string // buyer's Colombia phone, required when paymentMethod='nequi'
}

export interface CheckoutResult {
  success: true
  orderId: number
  preferenceId?: string
  initPoint?: string
  nequiTransactionId?: string
}

export class CheckoutService {
  constructor(
    private readonly tenantRepo: ITenantRepo,
    private readonly customerRepo: ICustomerRepo,
    private readonly orderRepo: IOrderRepo,
    private readonly productRepo: IProductRepo,
  ) {}

  async execute(input: CheckoutInput): Promise<CheckoutResult> {
    const { customer, paymentMethod, items, currency, tenantSlug, returnUrl } = input

    // 1. Resolve tenant — fetch token + secure_config + currency in one query
    const tenant = await this.tenantRepo.findBySlugWithNequi(tenantSlug)
    if (!tenant) throw new NotFoundError('Tenant')
    const tenantId = tenant.id

    // 2. Resolve authoritative prices from DB — never trust client-sent prices
    const productIds = items.map((i) => i.productId)
    const dbProducts = await this.productRepo.findByIds(productIds)
    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    const resolvedItems = items.map((item) => {
      const dbProduct = productMap.get(item.productId)
      if (!dbProduct) throw new NotFoundError(`Product ${item.productId}`)
      const serverPrice = computeEffectivePrice(dbProduct)
      return { ...item, price: serverPrice }
    })

    const resolvedTotal = resolvedItems.reduce(
      (sum, item) => sum + item.price * item.quantity + (item.modifiersDelta ?? 0) * item.quantity,
      0,
    )

    // 3. Upsert customer (find by email, update or create)
    const customerId = await this.upsertCustomer(tenantId, customer)

    // 4. Create order
    const order = await this.orderRepo.create({
      tenant_id: tenantId,
      customer_id: customerId,
      items: resolvedItems.map((item) => ({
        product_id: item.productId,
        name: item.name,
        price: item.price,
        unit_price: item.price,
        quantity: item.quantity,
        currency: item.currency,
        image: item.image,
        color: item.color,
        size_id: item.sizeId ?? null,
      })),
      total: resolvedTotal,
      status: 'pending',
      payment_method: paymentMethod,
      notes: customer.notes ?? '',
    })

    // 5. Cash — done
    if (paymentMethod === 'cash') {
      return { success: true, orderId: order.id }
    }

    // 6. MercadoPago — build preference using server-resolved prices
    if (paymentMethod === 'mercadopago') {
      if (!tenant.mp_access_token) {
        throw new ValidationError('MercadoPago not configured for this tenant')
      }

      const mpToken = decryptToken(tenant.mp_access_token)
      const client = new MercadoPagoConfig({ accessToken: mpToken })
      const preference = new Preference(client)

      const baseUrl = returnUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const isProduction = !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')
      const locale = 'es'

      const preferenceData: Record<string, unknown> = {
        items: resolvedItems.map((item) => ({
          id: item.productId.toString(),
          title: item.modifiersSummary ? `${item.name} (${item.modifiersSummary})` : item.name,
          unit_price: item.price + (item.modifiersDelta ?? 0),
          quantity: item.quantity,
          currency_id: currency === 'ARS' ? 'ARS' : 'USD',
          description: item.modifiersSummary
            ? `${item.name} + ${item.modifiersSummary}`
            : item.name,
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
        // biome-ignore lint/suspicious/noExplicitAny: MP SDK types are loose
        const result = await preference.create({ body: preferenceData as any })
        return {
          success: true,
          orderId: order.id,
          preferenceId: result.id,
          initPoint: result.init_point,
        }
      } catch (mpError: unknown) {
        const err = mpError as Record<string, unknown>
        const msg = (err?.message as string) || (err?.error as string) || 'Unknown MP error'
        throw new AppError(`MercadoPago API error: ${msg}`, 'MP_ERROR', 502)
      }
    }

    // 7. Nequi push payment
    if (paymentMethod === 'nequi') {
      // Currency gate — Nequi only for COP tenants
      const tenantCurrency = tenant.currency
      if (tenantCurrency !== 'COP') {
        throw new ValidationError('Nequi solo está disponible para tiendas con moneda COP')
      }

      // Feature flag gate
      const nequiOn = await isNequiEnabled(tenantId)
      if (!nequiOn) {
        throw new ValidationError('Nequi no está habilitado para esta tienda')
      }

      // Credentials gate
      const nequiCreds = tenant.secure_config?.nequi
      if (!nequiCreds) {
        throw new ValidationError('Nequi no está configurado para esta tienda')
      }

      // Phone validation — /^3\d{9}$/
      const phoneNumber = input.nequiPhoneNumber
      if (!phoneNumber || !/^3\d{9}$/.test(phoneNumber)) {
        throw new ValidationError('El número Nequi debe iniciar en 3 y tener 10 dígitos')
      }

      // Decrypt credentials
      const clientId = decryptToken(nequiCreds.client_id)
      const apiKey = decryptToken(nequiCreds.api_key)
      const appSecret = decryptToken(nequiCreds.app_secret)

      const nequiClient = new NequiClient({
        clientId,
        apiKey,
        appSecret,
        phoneNumber: nequiCreds.phone_number,
      })

      try {
        const { transactionId } = await nequiClient.requestPayment({
          phoneNumber,
          amount: Math.round(resolvedTotal), // COP integer
          messageId: String(order.id),
        })

        // Persist transactionId as checkout_id for polling
        await this.orderRepo.updateCheckoutId(order.id, transactionId)

        return {
          success: true,
          orderId: order.id,
          nequiTransactionId: transactionId,
        }
      } catch (nequiError: unknown) {
        const err = nequiError as Record<string, unknown>
        const msg = (err?.message as string) || 'Error al conectar con Nequi'
        throw new AppError(`Nequi API error: ${msg}`, 'NEQUI_ERROR', 502)
      }
    }

    throw new AppError('Método de pago no soportado', 'UNSUPPORTED_PAYMENT', 400)
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
