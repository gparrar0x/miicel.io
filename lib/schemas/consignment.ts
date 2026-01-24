/**
 * Zod Validation Schemas for Consignment Management
 * Used in consignment API endpoints
 */

import { z } from 'zod'

/**
 * ConsignmentStatus enum validation
 */
export const consignmentStatusSchema = z.enum([
  'in_gallery',
  'in_transit',
  'sold',
  'returned',
  'pending',
])

/**
 * LocationStatus enum validation
 */
export const locationStatusSchema = z.enum(['active', 'inactive', 'archived'])

/**
 * Latitude validation (-90 to 90)
 */
export const latitudeSchema = z
  .number()
  .min(-90, 'Latitude must be >= -90')
  .max(90, 'Latitude must be <= 90')
  .nullable()
  .optional()

/**
 * Longitude validation (-180 to 180)
 */
export const longitudeSchema = z
  .number()
  .min(-180, 'Longitude must be >= -180')
  .max(180, 'Longitude must be <= 180')
  .nullable()
  .optional()

/**
 * Email validation (optional)
 */
export const optionalEmailSchema = z
  .string()
  .email('Invalid email format')
  .max(255)
  .nullable()
  .optional()

/**
 * Phone validation (optional, basic format check)
 */
export const optionalPhoneSchema = z
  .string()
  .max(50)
  .regex(/^[\d\s\+\-\(\)]+$/, 'Phone must contain only digits, spaces, +, -, (, )')
  .nullable()
  .optional()

/**
 * Create Location Request
 * POST /api/dashboard/consignment-locations
 */
export const createLocationSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(255),
  description: z.string().max(1000).nullable().optional(),
  city: z.string().min(2, 'City is required').max(100),
  country: z.string().min(2, 'Country is required').max(100),
  address: z.string().max(500).nullable().optional(),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  contact_name: z.string().max(255).nullable().optional(),
  contact_email: optionalEmailSchema,
  contact_phone: optionalPhoneSchema,
})

/**
 * Update Location Request
 * PATCH /api/dashboard/consignment-locations/[id]
 */
export const updateLocationSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  city: z.string().min(2).max(100).optional(),
  country: z.string().min(2).max(100).optional(),
  address: z.string().max(500).nullable().optional(),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  contact_name: z.string().max(255).nullable().optional(),
  contact_email: optionalEmailSchema,
  contact_phone: optionalPhoneSchema,
  status: locationStatusSchema.optional(),
})

/**
 * Create Assignment Request
 * POST /api/dashboard/consignment-locations/[id]/artworks
 */
export const createAssignmentSchema = z.object({
  work_id: z.number().int().positive('work_id must be a positive integer'),
  status: consignmentStatusSchema.default('in_gallery'),
  notes: z.string().max(1000).nullable().optional(),
})

/**
 * Update Assignment Request
 * PATCH /api/dashboard/consignment-locations/[id]/artworks/[artworkId]
 */
export const updateAssignmentSchema = z.object({
  status: consignmentStatusSchema.optional(),
  notes: z.string().max(1000).nullable().optional(),
})

/**
 * Query Params for List Locations
 * GET /api/dashboard/consignment-locations?search=...&city=...
 */
export const listLocationsQuerySchema = z.object({
  search: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  status: locationStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(25),
})

/**
 * Query Params for List Artworks with Consignment Status
 * GET /api/dashboard/consignments/works?status=...&location_id=...
 */
export const listWorksQuerySchema = z.object({
  search: z.string().max(255).optional(),
  status: consignmentStatusSchema.optional(),
  location_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(25),
})

/**
 * Type exports for TypeScript inference
 */
export type CreateLocationInput = z.infer<typeof createLocationSchema>
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>
export type ListLocationsQuery = z.infer<typeof listLocationsQuerySchema>
export type ListWorksQuery = z.infer<typeof listWorksQuerySchema>
