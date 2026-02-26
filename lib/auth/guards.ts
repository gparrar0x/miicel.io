/**
 * Server-side auth guards — provided by @skywalking/core.
 */

export type {
  RequireOwnerResult,
  TenantOwnershipResult,
  TenantRecord,
} from '@skywalking/core/auth/guards'
export {
  getCurrentUser,
  requireAuth,
  requireAuthWithRedirect,
  requireTenantOwner,
  requireTenantOwnerOrRedirect,
  verifyTenantOwnership,
  verifyTenantOwnershipWithMetrics,
} from '@skywalking/core/auth/guards'
