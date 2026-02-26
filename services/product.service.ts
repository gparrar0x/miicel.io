/**
 * ProductService — business logic for product CRUD.
 * Auth checks: ownership via tenants.owner_id, superadmin bypass.
 */

import { ForbiddenError, NotFoundError } from '@skywalking/core/errors'
import type {
  CreateProductInput,
  IProductRepo,
  ProductRow,
  UpdateProductInput,
} from './repositories/product.repo'
import type { ITenantRepo } from './repositories/tenant.repo'

const SUPERADMIN_EMAIL = 'gparrar@skywalking.dev'

export interface ListProductsInput {
  tenant_id?: number
  category?: string
  active?: boolean
  search?: string
}

export interface GetProductResult {
  id: string
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  colors: unknown[]
  stock: number
  category: string
}

export interface AuthContext {
  userId: string
  userEmail?: string
}

export class ProductService {
  constructor(
    private readonly productRepo: IProductRepo,
    private readonly tenantRepo: ITenantRepo,
  ) {}

  async list(filters: ListProductsInput): Promise<ProductRow[]> {
    return this.productRepo.list(filters)
  }

  async getById(id: number): Promise<GetProductResult> {
    const product = await this.productRepo.findById(id)
    if (!product) throw new NotFoundError('Product')

    return {
      id: product.id.toString(),
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      currency: '$',
      images: product.image_url ? [product.image_url] : [],
      colors: [],
      stock: product.stock ?? 0,
      category: product.category ?? 'General',
    }
  }

  async create(
    input: CreateProductInput & { userId: string; userEmail?: string },
  ): Promise<ProductRow> {
    const { userId, userEmail, ...productData } = input

    // Verify tenant ownership
    const tenant =
      (await (this.tenantRepo as any).findById?.(productData.tenant_id)) ??
      (await this._getTenantOwner(productData.tenant_id))

    const isSuperadmin = userEmail?.toLowerCase().trim() === SUPERADMIN_EMAIL
    if (!isSuperadmin && tenant.owner_id !== userId) {
      throw new ForbiddenError('You do not own this tenant')
    }

    return this.productRepo.create(productData)
  }

  async update(
    productId: number,
    updateData: UpdateProductInput,
    auth: AuthContext,
  ): Promise<ProductRow> {
    const product = await this.productRepo.findByIdWithOwner(productId)
    if (!product) throw new NotFoundError('Product')

    const tenants = product.tenants as { owner_id: string }
    const isSuperadmin = auth.userEmail?.toLowerCase().trim() === SUPERADMIN_EMAIL
    if (!isSuperadmin && tenants.owner_id !== auth.userId) {
      throw new ForbiddenError('You do not own this product')
    }

    return this.productRepo.update(productId, updateData)
  }

  async softDelete(productId: number, auth: AuthContext): Promise<ProductRow> {
    const product = await this.productRepo.findByIdWithOwner(productId)
    if (!product) throw new NotFoundError('Product')

    const tenants = product.tenants as { owner_id: string }
    const isSuperadmin = auth.userEmail?.toLowerCase().trim() === SUPERADMIN_EMAIL
    if (!isSuperadmin && tenants.owner_id !== auth.userId) {
      throw new ForbiddenError('You do not own this product')
    }

    return this.productRepo.softDelete(productId)
  }

  // Fallback: fetch tenant owner_id via tenantRepo (which may not expose findById)
  private async _getTenantOwner(_tenantId: number): Promise<{ owner_id: string }> {
    // TenantRepo only has findBySlug; for create product we get owner from Supabase
    // via the route handler which passes auth context directly.
    // This path is hit when tenantRepo.findById is not available.
    throw new NotFoundError('Tenant')
  }
}
