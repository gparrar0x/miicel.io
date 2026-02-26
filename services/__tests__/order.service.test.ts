import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrderService } from '../order.service'
import type { ICustomerRepo } from '../repositories/customer.repo'
import type { IOrderRepo } from '../repositories/order.repo'
import type { IProductRepo } from '../repositories/product.repo'
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

const mockProductRepo = (): IProductRepo => ({
  list: vi.fn(),
  findById: vi.fn(),
  findByIdWithOwner: vi.fn(),
  findByIds: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
})

// ---- Fixtures ----

const tenant = { id: 10, template: 'gallery' }
const product = {
  id: 1,
  tenant_id: 10,
  name: 'Widget',
  price: 50,
  active: true,
  stock: 100,
  metadata: null,
  description: null,
  category: null,
  image_url: null,
}

const createInput = {
  tenantSlug: 'my-store',
  customer: { name: 'Ana Garcia', phone: '1234567890', email: 'ana@test.com' },
  items: [{ productId: 1, quantity: 2 }],
  paymentMethod: 'mercadopago',
}

// ---- Tests ----

describe('OrderService.createOrder', () => {
  let tenantRepo: ITenantRepo
  let customerRepo: ICustomerRepo
  let orderRepo: IOrderRepo
  let productRepo: IProductRepo
  let service: OrderService

  beforeEach(() => {
    tenantRepo = mockTenantRepo()
    customerRepo = mockCustomerRepo()
    orderRepo = mockOrderRepo()
    productRepo = mockProductRepo()
    service = new OrderService(tenantRepo, customerRepo, orderRepo, productRepo)
  })

  describe('happy path', () => {
    it('creates order and returns total', async () => {
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue(tenant)
      vi.mocked(productRepo.findByIds).mockResolvedValue([product])
      vi.mocked(customerRepo.findByEmailAndPhone).mockResolvedValue(null)
      vi.mocked(customerRepo.create).mockResolvedValue({ id: 3 })
      vi.mocked(orderRepo.create).mockResolvedValue({ id: 55 })

      const result = await service.createOrder(createInput)

      expect(result).toEqual({ success: true, orderId: 55, total: 100 })
      expect(orderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenant_id: 10, customer_id: 3, total: 100 }),
      )
    })

    it('reuses existing customer', async () => {
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue(tenant)
      vi.mocked(productRepo.findByIds).mockResolvedValue([product])
      vi.mocked(customerRepo.findByEmailAndPhone).mockResolvedValue({ id: 9 })
      vi.mocked(customerRepo.update).mockResolvedValue(undefined)
      vi.mocked(orderRepo.create).mockResolvedValue({ id: 56 })

      const result = await service.createOrder(createInput)

      expect(result.orderId).toBe(56)
      expect(customerRepo.create).not.toHaveBeenCalled()
    })

    it('skips stock check for gastronomy template', async () => {
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue({ id: 10, template: 'gastronomy' })
      vi.mocked(productRepo.findByIds).mockResolvedValue([{ ...product, stock: 0 }])
      vi.mocked(customerRepo.findByEmailAndPhone).mockResolvedValue(null)
      vi.mocked(customerRepo.create).mockResolvedValue({ id: 3 })
      vi.mocked(orderRepo.create).mockResolvedValue({ id: 57 })

      // Should NOT throw even with stock=0
      const result = await service.createOrder(createInput)
      expect(result.success).toBe(true)
    })
  })

  describe('error paths', () => {
    it('throws NotFoundError when tenant not found', async () => {
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue(null)

      await expect(service.createOrder(createInput)).rejects.toThrow('Tenant not found')
    })

    it('throws ForbiddenError for cross-tenant product', async () => {
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue(tenant)
      vi.mocked(productRepo.findByIds).mockResolvedValue([{ ...product, tenant_id: 999 }])

      await expect(service.createOrder(createInput)).rejects.toThrow('Product ownership mismatch')
    })

    it('throws ValidationError for inactive product', async () => {
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue(tenant)
      vi.mocked(productRepo.findByIds).mockResolvedValue([{ ...product, active: false }])

      await expect(service.createOrder(createInput)).rejects.toThrow('is not available')
    })

    it('throws ValidationError when stock insufficient', async () => {
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue(tenant)
      vi.mocked(productRepo.findByIds).mockResolvedValue([{ ...product, stock: 1 }])

      await expect(
        service.createOrder({ ...createInput, items: [{ productId: 1, quantity: 5 }] }),
      ).rejects.toThrow('Insufficient stock')
    })

    it('throws ValidationError for invalid size', async () => {
      const productWithSizes = {
        ...product,
        metadata: { sizes: [{ id: 'S', label: 'Small', stock: 10 }] },
      }
      vi.mocked(tenantRepo.findBySlug).mockResolvedValue(tenant)
      vi.mocked(productRepo.findByIds).mockResolvedValue([productWithSizes])

      await expect(
        service.createOrder({
          ...createInput,
          items: [{ productId: 1, quantity: 1, sizeId: 'XL' }],
        }),
      ).rejects.toThrow('Invalid size')
    })
  })
})

describe('OrderService.updateStatus', () => {
  let tenantRepo: ITenantRepo
  let customerRepo: ICustomerRepo
  let orderRepo: IOrderRepo
  let productRepo: IProductRepo
  let service: OrderService

  beforeEach(() => {
    tenantRepo = mockTenantRepo()
    customerRepo = mockCustomerRepo()
    orderRepo = mockOrderRepo()
    productRepo = mockProductRepo()
    service = new OrderService(tenantRepo, customerRepo, orderRepo, productRepo)
  })

  it('updates status for owner', async () => {
    vi.mocked(orderRepo.findByIdWithTenant).mockResolvedValue({
      id: 1,
      status: 'pending',
      tenants: { owner_id: 'user-1' },
    })
    vi.mocked(orderRepo.updateStatus).mockResolvedValue({ id: 1, status: 'preparing' })

    await service.updateStatus({ orderId: 1, userId: 'user-1', newStatus: 'preparing' })

    expect(orderRepo.updateStatus).toHaveBeenCalledWith(1, 'preparing')
  })

  it('throws ForbiddenError for non-owner', async () => {
    vi.mocked(orderRepo.findByIdWithTenant).mockResolvedValue({
      id: 1,
      status: 'pending',
      tenants: { owner_id: 'owner-1' },
    })

    await expect(
      service.updateStatus({ orderId: 1, userId: 'attacker-99', newStatus: 'cancelled' }),
    ).rejects.toThrow('You do not own this order')
  })

  it('throws ValidationError when changing delivered order to non-cancelled', async () => {
    vi.mocked(orderRepo.findByIdWithTenant).mockResolvedValue({
      id: 1,
      status: 'delivered',
      tenants: { owner_id: 'user-1' },
    })

    await expect(
      service.updateStatus({ orderId: 1, userId: 'user-1', newStatus: 'pending' }),
    ).rejects.toThrow('Cannot change status of delivered order')
  })

  it('throws NotFoundError when order not found', async () => {
    vi.mocked(orderRepo.findByIdWithTenant).mockResolvedValue(null)

    await expect(
      service.updateStatus({ orderId: 999, userId: 'user-1', newStatus: 'preparing' }),
    ).rejects.toThrow('Order not found')
  })

  it('superadmin can update any order', async () => {
    vi.mocked(orderRepo.findByIdWithTenant).mockResolvedValue({
      id: 1,
      status: 'pending',
      tenants: { owner_id: 'other-user' },
    })
    vi.mocked(orderRepo.updateStatus).mockResolvedValue({ id: 1, status: 'preparing' })

    await service.updateStatus({
      orderId: 1,
      userId: 'any-id',
      userEmail: 'gparrar@skywalking.dev',
      newStatus: 'preparing',
    })

    expect(orderRepo.updateStatus).toHaveBeenCalled()
  })
})
