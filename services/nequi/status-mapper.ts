/**
 * Nequi status code mappers — pure functions, fully unit-testable.
 *
 * Numeric codes from Nequi Conecta API:
 *   '33'     → pending  (push notification sent, waiting approval)
 *   '35'     → paid     (approved)
 *   '71'     → failed   (generic failure)
 *   '10-454' → expired  (5-minute window elapsed)
 *   '10-455' → cancelled
 */

import type { NequiPaymentStatus } from './nequi.client'

export function mapNequiStatusCode(code: string): NequiPaymentStatus['status'] {
  switch (code) {
    case '33':
      return 'pending'
    case '35':
      return 'paid'
    case '71':
      return 'failed'
    case '10-454':
      return 'expired'
    case '10-455':
      return 'cancelled'
    default:
      return 'failed'
  }
}

export function mapWebhookPaymentStatus(
  status: 'SUCCESS' | 'CANCELED' | 'DENIED',
): NequiPaymentStatus['status'] {
  switch (status) {
    case 'SUCCESS':
      return 'paid'
    case 'CANCELED':
      return 'cancelled'
    case 'DENIED':
      return 'failed'
    default:
      return 'failed'
  }
}
