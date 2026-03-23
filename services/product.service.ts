/**
 * ProductService — business logic for product CRUD.
 * Auth checks: ownership via tenants.owner_id, superadmin bypass.
 */

import { NotFoundError } from '@skywalking/core/errors'
import { assertOwnership } from '@/lib/auth/constants'
import type {
  CreateProductInput,
  IProductRepo,
  ProductRow,
  UpdateProductInput,
} from './repositories/product.repo'
import type { ITenantRepo } from './repositories/tenant.repo'

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

    const tenant = await this.tenantRepo.findById(productData.tenant_id)
    if (!tenant) throw new NotFoundError('Tenant')
    assertOwnership(userId, userEmail, tenant.owner_id, 'tenant')

    return this.productRepo.create(productData)
  }

  async update(
    productId: number,
    updateData: UpdateProductInput,
    auth: AuthContext,
  ): Promise<ProductRow> {
    const product = await this.productRepo.findByIdWithOwner(productId)
    if (!product) throw new NotFoundError('Product')
    assertOwnership(auth.userId, auth.userEmail, product.tenants.owner_id, 'product')

    return this.productRepo.update(productId, updateData)
  }

  async softDelete(productId: number, auth: AuthContext): Promise<ProductRow> {
    const product = await this.productRepo.findByIdWithOwner(productId)
    if (!product) throw new NotFoundError('Product')
    assertOwnership(auth.userId, auth.userEmail, product.tenants.owner_id, 'product')

    return this.productRepo.softDelete(productId)
  }
}
