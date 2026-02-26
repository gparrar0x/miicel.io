import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckoutService } from '../checkout.service'
import type { ICustomerRepo } from '../repositories/customer.repo'
import type { IOrderRepo } from '../repositories/order.repo'
import type { ITenantRepo } from '../repositories/tenant.repo'

// ---- Mocks ----

const mockTenantRepo = (): ITenantRepo => ({
  findBySlug: vi.fn(),
  findBySlugWithToken: vi.fn(),
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

// ---- Fixture ----

const baseInput = {
  customer: { name: 'Juan Perez', phone: '1122334455', email: 'juan@test.com' },
  paymentMethod: 'cash' as const,
  items: [{ productId: 1, name: 'Widget', price: 100, quantity: 2, currency: 'ARS' }],
  total: 200,
  currency: 'ARS',
  tenantSlug: 'test-store',
}

// ---- Tests ----

describe('CheckoutService', () => {
  let tenantRepo: ITenantRepo
  let customerRepo: ICustomerRepo
  let orderRepo: IOrderRepo
  let service: CheckoutService

  beforeEach(() => {
    tenantRepo = mockTenantRepo()
    customerRepo = mockCustomerRepo()
    orderRepo = mockOrderRepo()
    service = new CheckoutService(tenantRepo, customerRepo, orderRepo)
  })

  describe('cash payment — happy path', () => {
    it('creates order and returns orderId for cash payment', async () => {
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue({ id: 42 })
      vi.mocked(customerRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(customerRepo.create).mockResolvedValue({ id: 7 })
      vi.mocked(orderRepo.create).mockResolvedValue({ id: 99 })

      const result = await service.execute(baseInput)

      expect(result).toEqual({ success: true, orderId: 99 })
      expect(tenantRepo.findBySlug).toHaveBeenCalledWith('test-store')
      expect(customerRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenant_id: 42, email: 'juan@test.com' }),
      )
      expect(orderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenant_id: 42, customer_id: 7, total: 200 }),
      )
    })

    it('updates existing customer instead of creating new one', async () => {
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue({ id: 42 })
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
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue(null)

      await expect(service.execute(baseInput)).rejects.toThrow('Tenant not found')
    })

    it('throws when customer creation fails', async () => {
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue({ id: 42 })
      vi.mocked(customerRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(customerRepo.create).mockRejectedValue(
        new Error('Failed to create customer: DB error'),
      )

      await expect(service.execute(baseInput)).rejects.toThrow('Failed to create customer')
    })

    it('throws when order creation fails', async () => {
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue({ id: 42 })
      vi.mocked(customerRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(customerRepo.create).mockResolvedValue({ id: 7 })
      vi.mocked(orderRepo.create).mockRejectedValue(new Error('Failed to create order: DB error'))

      await expect(service.execute(baseInput)).rejects.toThrow('Failed to create order')
    })

    it('throws ValidationError when MP not configured for mercadopago payment', async () => {
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue({ id: 42 })
      vi.mocked(customerRepo.findByEmail).mockResolvedValue(null)
      vi.mocked(customerRepo.create).mockResolvedValue({ id: 7 })
      vi.mocked(orderRepo.create).mockResolvedValue({ id: 88 })
      vi.mocked(tenantRepo.findBySlugWithToken).mockResolvedValue({
        id: 42,
        mp_access_token: null,
      })

      await expect(service.execute({ ...baseInput, paymentMethod: 'mercadopago' })).rejects.toThrow(
        'MercadoPago not configured',
      )
    })
  })
})
