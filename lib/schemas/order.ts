/**
 * Zod Schemas for Orders, Customers, Signup, and Onboarding
 *
 * Provides type-safe validation for API inputs and outputs
 * Used across signup, onboarding, and order creation flows
 */

import { z } from 'zod'

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

/**
 * Schema for individual order items
 * Matches the JSONB structure in orders.items column
 */
export const orderItemSchema = z.object({
  product_id: z.number().int().positive('Invalid product ID'),
  name: z.string().min(1, 'Product name required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unit_price: z.number().nonnegative('Price cannot be negative'),
})

export type OrderItem = z.infer<typeof orderItemSchema>

/**
 * Schema for customer information
 * Used in order creation and customer management
 */
export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[0-9\s-()]+$/, 'Invalid phone number').optional(),
  email: z.string().email('Invalid email').optional(),
  notes: z.string().optional(),
})

export type Customer = z.infer<typeof customerSchema>

/**
 * Schema for creating a new order
 * Validates all required fields including items array
 */
export const createOrderSchema = z.object({
  tenant_id: z.number().int().positive('Invalid tenant ID'),
  customer: customerSchema.optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item required'),
  total: z.number().nonnegative('Total cannot be negative'),
  payment_method: z.enum(['mercadopago', 'cash', 'transfer']).optional(),
  notes: z.string().optional(),
})

export type CreateOrder = z.infer<typeof createOrderSchema>

// ============================================================================
// SIGNUP SCHEMAS
// ============================================================================

/**
 * Slug validation rules
 * - Min 3 chars, max 30 chars
 * - Only lowercase letters, numbers, hyphens
 * - Cannot start/end with hyphen
 * - No consecutive hyphens
 */
export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(30, 'Slug cannot exceed 30 characters')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens (no consecutive or leading/trailing hyphens)',
  })

/**
 * Schema for signup request
 * Creates both auth user and tenant in one atomic operation
 */
export const signupRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  slug: slugSchema,
})

export type SignupRequest = z.infer<typeof signupRequestSchema>

/**
 * Schema for signup response
 */
export const signupResponseSchema = z.object({
  userId: z.string().uuid(),
  tenantSlug: z.string(),
  error: z.string().optional(),
})

export type SignupResponse = z.infer<typeof signupResponseSchema>

/**
 * Schema for slug validation request
 */
export const validateSlugRequestSchema = z.object({
  slug: z.string(),
})

export type ValidateSlugRequest = z.infer<typeof validateSlugRequestSchema>

/**
 * Schema for slug validation response
 */
export const validateSlugResponseSchema = z.object({
  available: z.boolean(),
  suggestion: z.string().optional(),
  error: z.string().optional(),
})

export type ValidateSlugResponse = z.infer<typeof validateSlugResponseSchema>

// ============================================================================
// ONBOARDING SCHEMAS
// ============================================================================

/**
 * Schema for tenant configuration colors
 */
export const configColorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
})

/**
 * Schema for tenant public configuration
 * Stored in tenants.config JSONB column
 */
export const tenantConfigSchema = z.object({
  logo: z.string().url('Invalid logo URL').optional(),
  colors: configColorsSchema,
  business_name: z.string().min(2, 'Business name required'),
})

export type TenantConfig = z.infer<typeof tenantConfigSchema>

/**
 * Schema for product to be created during onboarding
 */
export const onboardingProductSchema = z.object({
  name: z.string().min(1, 'Product name required'),
  description: z.string().optional(),
  price: z.number().nonnegative('Price cannot be negative'),
  category: z.string().optional(),
  stock: z.number().int().nonnegative('Stock cannot be negative').optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  active: z.boolean().default(true),
})

export type OnboardingProduct = z.infer<typeof onboardingProductSchema>

/**
 * Schema for onboarding save request
 * Updates tenant config and optionally creates initial products
 */
export const onboardingSaveRequestSchema = z.object({
  config: tenantConfigSchema,
  products: z.array(onboardingProductSchema).optional(),
})

export type OnboardingSaveRequest = z.infer<typeof onboardingSaveRequestSchema>

/**
 * Schema for onboarding save response
 */
export const onboardingSaveResponseSchema = z.object({
  success: z.boolean(),
  tenantId: z.number().int().positive(),
  productsCreated: z.number().optional(),
  error: z.string().optional(),
})

export type OnboardingSaveResponse = z.infer<typeof onboardingSaveResponseSchema>

// ============================================================================
// PRODUCT CRUD SCHEMAS
// ============================================================================

/**
 * Schema for creating a new product
 * Used in POST /api/products
 */
export const productCreateSchema = z.object({
  tenant_id: z.number().int().positive('Invalid tenant ID'),
  name: z.string().min(1, 'Product name required').max(200, 'Product name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  price: z.number().positive('Price must be positive'),
  category: z.string().max(100, 'Category name too long').optional(),
  stock: z.number().int().nonnegative('Stock cannot be negative').optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  active: z.boolean().optional(),
})

export type ProductCreate = z.infer<typeof productCreateSchema>

/**
 * Schema for updating an existing product
 * All fields optional except id (in params)
 * Used in PATCH /api/products/[id]
 */
export const productUpdateSchema = productCreateSchema.partial().omit({ tenant_id: true })

export type ProductUpdate = z.infer<typeof productUpdateSchema>

/**
 * Schema for product response
 * Matches database structure
 */
export const productResponseSchema = z.object({
  id: z.number().int().positive(),
  tenant_id: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  category: z.string().nullable(),
  stock: z.number().int().nullable(),
  image_url: z.string().nullable(),
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type ProductResponse = z.infer<typeof productResponseSchema>

// ============================================================================
// ORDER MANAGEMENT SCHEMAS
// ============================================================================

/**
 * Schema for order list query parameters
 * Used in GET /api/orders/list
 */
export const orderListQuerySchema = z.object({
  tenant_id: z.string().regex(/^\d+$/).transform(Number),
  status: z.enum(['pending', 'paid', 'preparing', 'ready', 'delivered', 'cancelled']).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional()
})

export type OrderListQuery = z.infer<typeof orderListQuerySchema>

/**
 * Schema for updating order status
 * Used in PATCH /api/orders/[id]/status
 */
export const orderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'paid', 'preparing', 'ready', 'delivered', 'cancelled'])
})

export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>

/**
 * Schema for customer in order response
 */
export const orderCustomerSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable()
}).nullable()

export type OrderCustomer = z.infer<typeof orderCustomerSchema>

/**
 * Schema for order response with customer details
 * Used in API responses
 */
export const orderResponseSchema = z.object({
  id: z.number().int().positive(),
  tenant_id: z.number().int().positive(),
  customer: orderCustomerSchema,
  items: z.array(orderItemSchema),
  total: z.number().positive(),
  status: z.string(),
  payment_method: z.string().nullable(),
  payment_id: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
})

export type OrderResponse = z.infer<typeof orderResponseSchema>

/**
 * Schema for paginated order list response
 */
export const orderListResponseSchema = z.object({
  orders: z.array(orderResponseSchema),
  total_count: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  per_page: z.number().int().positive()
})

export type OrderListResponse = z.infer<typeof orderListResponseSchema>
