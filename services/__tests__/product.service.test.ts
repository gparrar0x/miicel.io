import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductService } from '../product.service'
import type { IProductRepo, ProductRow } from '../repositories/product.repo'
import type { ITenantRepo } from '../repositories/tenant.repo'

// ---- Mocks ----

const mockProductRepo = (): IProductRepo => ({
  list: vi.fn(),
  findById: vi.fn(),
  findByIdWithOwner: vi.fn(),
  findByIds: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
})

const mockTenantRepo = (): ITenantRepo => ({
  findBySlug: vi.fn(),
  findBySlugWithToken: vi.fn(),
})

// ---- Fixtures ----

const baseProduct: ProductRow = {
  id: 1,
  tenant_id: 10,
  name: 'Test Product',
  description: 'A great product',
  price: 99.99,
  category: 'Electronics',
  stock: 50,
  image_url: 'https://example.com/img.jpg',
  active: true,
  metadata: null,
}

// ---- Tests ----

describe('ProductService.list', () => {
  let repo: IProductRepo
  let tenantRepo: ITenantRepo
  let service: ProductService

  beforeEach(() => {
    repo = mockProductRepo()
    tenantRepo = mockTenantRepo()
    service = new ProductService(repo, tenantRepo)
  })

  it('returns products from repo', async () => {
    vi.mocked(repo.list).mockResolvedValue([baseProduct])

    const result = await service.list({ tenant_id: 10 })

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Test Product')
    expect(repo.list).toHaveBeenCalledWith({ tenant_id: 10 })
  })

  it('passes filters through to repo', async () => {
    vi.mocked(repo.list).mockResolvedValue([])

    await service.list({ category: 'Food', active: true, search: 'burger' })

    expect(repo.list).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Food', active: true, search: 'burger' }),
    )
  })
})

describe('ProductService.getById', () => {
  let repo: IProductRepo
  let tenantRepo: ITenantRepo
  let service: ProductService

  beforeEach(() => {
    repo = mockProductRepo()
    tenantRepo = mockTenantRepo()
    service = new ProductService(repo, tenantRepo)
  })

  it('returns mapped product response', async () => {
    vi.mocked(repo.findById).mockResolvedValue({
      ...baseProduct,
      tenants: { slug: 'my-store' },
    } as any)

    const result = await service.getById(1)

    expect(result).toMatchObject({
      id: '1',
      name: 'Test Product',
      price: 99.99,
      currency: '$',
      stock: 50,
      category: 'Electronics',
    })
    expect(result.images).toEqual(['https://example.com/img.jpg'])
  })

  it('throws NotFoundError when product not found', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null)

    await expect(service.getById(999)).rejects.toThrow('Product not found')
  })

  it('returns empty images array when no image_url', async () => {
    vi.mocked(repo.findById).mockResolvedValue({
      ...baseProduct,
      image_url: null,
      tenants: { slug: 'my-store' },
    } as any)

    const result = await service.getById(1)
    expect(result.images).toEqual([])
  })

  it('returns default category when category is null', async () => {
    vi.mocked(repo.findById).mockResolvedValue({
      ...baseProduct,
      category: null,
      tenants: { slug: 'my-store' },
    } as any)

    const result = await service.getById(1)
    expect(result.category).toBe('General')
  })
})

describe('ProductService.update', () => {
  let repo: IProductRepo
  let tenantRepo: ITenantRepo
  let service: ProductService

  beforeEach(() => {
    repo = mockProductRepo()
    tenantRepo = mockTenantRepo()
    service = new ProductService(repo, tenantRepo)
  })

  it('updates product for owner', async () => {
    vi.mocked(repo.findByIdWithOwner).mockResolvedValue({
      ...baseProduct,
      tenants: { owner_id: 'user-1' },
    } as any)
    const updated = { ...baseProduct, name: 'Updated Name' }
    vi.mocked(repo.update).mockResolvedValue(updated)

    const result = await service.update(1, { name: 'Updated Name' }, { userId: 'user-1' })

    expect(result.name).toBe('Updated Name')
    expect(repo.update).toHaveBeenCalledWith(1, { name: 'Updated Name' })
  })

  it('allows superadmin to update any product', async () => {
    vi.mocked(repo.findByIdWithOwner).mockResolvedValue({
      ...baseProduct,
      tenants: { owner_id: 'other-user' },
    } as any)
    vi.mocked(repo.update).mockResolvedValue(baseProduct)

    await service.update(
      1,
      { price: 50 },
      { userId: 'any-id', userEmail: 'gparrar@skywalking.dev' },
    )

    expect(repo.update).toHaveBeenCalled()
  })

  it('throws ForbiddenError for non-owner', async () => {
    vi.mocked(repo.findByIdWithOwner).mockResolvedValue({
      ...baseProduct,
      tenants: { owner_id: 'real-owner' },
    } as any)

    await expect(service.update(1, { price: 10 }, { userId: 'attacker' })).rejects.toThrow(
      'You do not own this product',
    )
  })

  it('throws NotFoundError when product does not exist', async () => {
    vi.mocked(repo.findByIdWithOwner).mockResolvedValue(null)

    await expect(service.update(999, { name: 'X' }, { userId: 'user-1' })).rejects.toThrow(
      'Product not found',
    )
  })
})

describe('ProductService.softDelete', () => {
  let repo: IProductRepo
  let tenantRepo: ITenantRepo
  let service: ProductService

  beforeEach(() => {
    repo = mockProductRepo()
    tenantRepo = mockTenantRepo()
    service = new ProductService(repo, tenantRepo)
  })

  it('soft deletes product for owner', async () => {
    vi.mocked(repo.findByIdWithOwner).mockResolvedValue({
      ...baseProduct,
      tenants: { owner_id: 'user-1' },
    } as any)
    const deleted = { ...baseProduct, active: false }
    vi.mocked(repo.softDelete).mockResolvedValue(deleted)

    const result = await service.softDelete(1, { userId: 'user-1' })

    expect(result.active).toBe(false)
    expect(repo.softDelete).toHaveBeenCalledWith(1)
  })

  it('throws ForbiddenError for non-owner', async () => {
    vi.mocked(repo.findByIdWithOwner).mockResolvedValue({
      ...baseProduct,
      tenants: { owner_id: 'real-owner' },
    } as any)

    await expect(service.softDelete(1, { userId: 'hacker' })).rejects.toThrow(
      'You do not own this product',
    )
  })

  it('throws NotFoundError when product not found', async () => {
    vi.mocked(repo.findByIdWithOwner).mockResolvedValue(null)

    await expect(service.softDelete(999, { userId: 'user-1' })).rejects.toThrow('Product not found')
  })
})
