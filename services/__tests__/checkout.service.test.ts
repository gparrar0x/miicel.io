import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutService } from '../checkout.service'
import type { ICustomerRepo } from '../repositories/customer.repo'
import type { IOrderRepo } from '../repositories/order.repo'
import type { IProductRepo, ProductRow } from '../repositories/product.repo'
import type { ITenantRepo } from '../repositories/tenant.repo'

// ---- Mocks ----

const mockTenantRepo = (): ITenantRepo => ({
  findById: vi.fn(),
  findBySlug: vi.fn(),
  findBySlugWithToken: vi.fn(),
  findBySlugWithNequi: vi.fn(),
  findByIdWithNequi: vi.fn(),
})

const mockCustomerRepo = (): ICustomerRepo => ({
  findByEmail: vi.fn(),
  findByEmailAndPhone: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
})

const mockOrderRepo = (): IOrderRepo => ({
  create: vi.fn(),
  findByIdWithTenant: vi.fn(),
  updateStatus: vi.fn(),
  list: vi.fn(),
})

const mockProductRepo = (): IProductRepo => ({
  list: vi.fn(),
  findById: vi.fn(),
  findByIdWithOwner: vi.fn(),
  findByIds: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
})

// Default DB product stub (no discount)
const dbProduct: ProductRow = {
  id: 1,
  tenant_id: 42,
  name: 'Widget',
  description: null,
  price: 100,
  category: null,
  stock: 10,
  image_url: null,
  active: true,
  metadata: null,
}

// ---- Fixture ----

const baseInput = {
  customer: { name: 'Juan Perez', phone: '1122334455', email: 'juan@test.com' },
  paymentMethod: 'cash' as const,
  items: [{ productId: 1, name: 'Widget', price: 999, quantity: 2, currency: 'ARS' }], // client sends wrong price
  total: 200,
  currency: 'ARS',
  tenantSlug: 'test-store',
}

// ---- Tests ----

describe('CheckoutService', () => {
  let tenantRepo: ITenantRepo
  let customerRepo: ICustomerRepo
  let orderRepo: IOrderRepo
  let productRepo: IProductRepo
  let service: CheckoutService

  beforeEach(() => {
    tenantRepo = mockTenantRepo()
    customerRepo = mockCustomerRepo()
    orderRepo = mockOrderRepo()
    productRepo = mockProductRepo()
    service = new CheckoutService(tenantRepo, customerRepo, orderRepo, productRepo)
  })

  describe('cash payment — happy path', () => {
    it('creates order and returns orderId for cash payment', async () => {
      vi.mocked(tenantRepo.findBySlugWithNequi).mockResolvedValue({
        id: 42,
        mp_access_token: null,
        secure_config: null,
        currency: 'ARS',
      })
      vi.mocked(productRepo.findByIds).mockResolvedValue([dbProduct])
      vi.mocked(customerRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(customerRepo.create).mockResolvedValue({ id: 7 })
      vi.mocked(orderRepo.create).mockResolvedValue({ id: 99 })

      const result = await service.execute(baseInput)

      expect(result).toEqual({ success: true, orderId: 99 })
      expect(tenantRepo.findBySlugWithNequi).toHaveBeenCalledWith('test-store')
      expect(customerRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenant_id: 42, email: 'juan@test.com' }),
      )
      // total must use DB price (100), not client price (999)
      expect(orderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenant_id: 42, customer_id: 7, total: 200 }),
      )
    })

    it('uses DB price, ignores client-sent price', async () => {
      vi.mocked(tenantRepo.findBySlugWithNequi).mockResolvedValue({
        id: 42,
        mp_access_token: null,
        secure_config: null,
        currency: 'ARS',
      })
      vi.mocked(productRepo.findByIds).mockResolvedValue([{ ...dbProduct, price: 50 }])
      vi.mocked(customerRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(customerRepo.create).mockResolvedValue({ id: 7 })
      vi.mocked(orderRepo.create).mockResolvedValue({ id: 99 })

      await service.execute(baseInput)

      // total = DB price 50 * qty 2 = 100 (not client total 200 or client price 999)
      expect(orderRepo.create).toHaveBeenCalledWith(expect.objectContaining({ total: 100 }))
    })

    it('applies active discount from DB product', async () => {
      const discountedProduct: ProductRow = {
        ...dbProduct,
        price: 100,
        discount_type: 'percentage',
        discount_value: 20,
      }
      vi.mocked(tenantRepo.findBySlugWithNequi).mockResolvedValue({
        id: 42,
        mp_access_token: null,
        secure_config: null,
        currency: 'ARS',
      })
      vi.mocked(productRepo.findByIds).mockResolvedValue([discountedProduct])
      vi.mocked(customerRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(customerRepo.create).mockResolvedValue({ id: 7 })
      vi.mocked(orderRepo.create).mockResolvedValue({ id: 99 })

      await service.execute(baseInput)

      // effective price = 80, qty 2 → total 160
      expect(orderRepo.create).toHaveBeenCalledWith(expect.objectContaining({ total: 160 }))
    })

    it('updates existing customer instead of creating new one', async () => {
      vi.mocked(tenantRepo.findBySlugWithNequi).mockResolvedValue({
        id: 42,
        mp_access_token: null,
        secure_config: null,
        currency: 'ARS',
      })
      vi.mocked(productRepo.findByIds).mockResolvedValue([dbProduct])
      vi.mocked(customerRepo.findByEmail).mockResolvedValue({ id: 5 })
      vi.mocked(customerRepo.update).mockResolvedValue(undefined)
      vi.mocked(orderRepo.create).mockResolvedValue({ id: 100 })

      const result = await service.execute(baseInput)

      expect(result.orderId).toBe(100)
      expect(customerRepo.create).not.toHaveBeenCalled()
      expect(customerRepo.update).toHaveBeenCalledWith(
        5,
        expect.objectContaining({ name: 'Juan Perez' }),
      )
    })
  })

  describe('error paths', () => {
    it('throws NotFoundError when tenant not found', async () => {
      vi.mocked(tenantRepo.findBySlugWithToken).mockResolvedValue(null)

      await expect(service.execute(baseInput)).rejects.toThrow('Tenant not found')
    })

    it('throws NotFoundError when product not found in DB', async () => {
      vi.mocked(tenantRepo.findBySlugWithNequi).mockResolvedValue({
        id: 42,
        mp_access_token: null,
        secure_config: null,
        currency: 'ARS',
      })
      vi.mocked(productRepo.findByIds).mockResolvedValue([]) // product missing

      await expect(service.execute(baseInput)).rejects.toThrow('Product 1 not found')
    })

    it('throws when customer creation fails', async () => {
      vi.mocked(tenantRepo.findBySlugWithNequi).mockResolvedValue({
        id: 42,
        mp_access_token: null,
        secure_config: null,
        currency: 'ARS',
      })
      vi.mocked(productRepo.findByIds).mockResolvedValue([dbProduct])
      vi.mocked(customerRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(customerRepo.create).mockRejectedValue(
        new Error('Failed to create customer: DB error'),
      )

      await expect(service.execute(baseInput)).rejects.toThrow('Failed to create customer')
    })

    it('throws when order creation fails', async () => {
      vi.mocked(tenantRepo.findBySlugWithNequi).mockResolvedValue({
        id: 42,
        mp_access_token: null,
        secure_config: null,
        currency: 'ARS',
      })
      vi.mocked(productRepo.findByIds).mockResolvedValue([dbProduct])
      vi.mocked(customerRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(customerRepo.create).mockResolvedValue({ id: 7 })
      vi.mocked(orderRepo.create).mockRejectedValue(new Error('Failed to create order: DB error'))

      await expect(service.execute(baseInput)).rejects.toThrow('Failed to create order')
    })

    it('throws ValidationError when MP not configured for mercadopago payment', async () => {
      vi.mocked(tenantRepo.findBySlugWithNequi).mockResolvedValue({
        id: 42,
        mp_access_token: null,
        secure_config: null,
        currency: 'ARS',
      })
      vi.mocked(productRepo.findByIds).mockResolvedValue([dbProduct])
      vi.mocked(customerRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(customerRepo.create).mockResolvedValue({ id: 7 })
      vi.mocked(orderRepo.create).mockResolvedValue({ id: 88 })

      await expect(service.execute({ ...baseInput, paymentMethod: 'mercadopago' })).rejects.toThrow(
        'MercadoPago not configured',
      )
    })
  })
})
