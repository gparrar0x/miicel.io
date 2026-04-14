/**
 * Nequi Zod schemas — credentials (settings) + buyer phone (checkout).
 *
 * Used by:
 * - components/dashboard/settings/NequiSettingsForm.tsx
 * - components/checkout/NequiPhoneInput.tsx
 * - app/api/checkout/create-preference/route.ts (server-side validation)
 *
 * Phone format: Colombia mobile, 10 digits starting with 3.
 */

import { z } from 'zod'

export const nequiPhoneRegex = /^3\d{9}$/

export const nequiCredentialsSchema = z.object({
  client_id: z.string().min(1, 'Requerido'),
  api_key: z.string().min(1, 'Requerido'),
  app_secret: z.string().min(1, 'Requerido'),
  phone_number: z.string().regex(nequiPhoneRegex, 'Debe iniciar en 3 y tener 10 dígitos'),
  commerce_code: z.string().min(1, 'Requerido'),
})

export const nequiPhoneSchema = z
  .string()
  .regex(nequiPhoneRegex, 'Debe iniciar en 3 y tener 10 dígitos')

export type NequiCredentialsInput = z.infer<typeof nequiCredentialsSchema>

/**
 * Format a stripped Colombian mobile number to display mask.
 * Example: "3001234567" → "300 123 4567"
 */
export function formatNequiPhoneMask(stripped: string): string {
  const digits = stripped.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

/**
 * Strip the display mask back to a raw 10-digit number.
 */
export function stripNequiPhoneMask(masked: string): string {
  return masked.replace(/\D/g, '').slice(0, 10)
}
