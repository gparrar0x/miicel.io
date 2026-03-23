/**
 * Auth constants — single source of truth for superadmin config.
 */

import { ForbiddenError } from '@skywalking/core/errors'

export const SUPERADMIN_EMAIL = 'gparrar@skywalking.dev'

/**
 * Check if an email belongs to a superadmin. Normalises case and whitespace.
 */
export function isSuperadmin(email: string | undefined | null): boolean {
  if (!email) return false
  return email.toLowerCase().trim() === SUPERADMIN_EMAIL
}

/**
 * Assert that user owns the resource or is superadmin. Throws ForbiddenError otherwise.
 */
export function assertOwnership(
  userId: string,
  userEmail: string | undefined,
  ownerId: string,
  resourceLabel = 'resource',
): void {
  if (isSuperadmin(userEmail)) return
  if (ownerId === userId) return
  throw new ForbiddenError(`You do not own this ${resourceLabel}`)
}
