/**
 * Zod Validation Schemas for Tenant Configuration
 * Used in PATCH /api/settings endpoint
 */

import { z } from 'zod'

/**
 * Validates WhatsApp number in E.164 international format
 * Format: + followed by country code and number (1-14 digits total)
 * Examples: +1234567890, +5491123456789
 */
export const whatsappNumberSchema = z
  .string()
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    'WhatsApp number must be in international format (e.g., +1234567890)'
  )
  .max(20, 'WhatsApp number cannot exceed 20 characters')
  .nullable()
  .optional()

/**
 * Validates tenant update request body
 * All fields optional (partial updates allowed)
 */
export const updateTenantSchema = z.object({
  whatsapp_number: whatsappNumberSchema,
})
