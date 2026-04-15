/**
 * Status mapper unit tests — pure functions, exhaustive code coverage.
 */

import { describe, expect, it } from 'vitest'
import { mapNequiStatusCode, mapWebhookPaymentStatus } from '../status-mapper'

describe('mapNequiStatusCode', () => {
  it('maps "33" → pending', () => {
    expect(mapNequiStatusCode('33')).toBe('pending')
  })

  it('maps "35" → paid', () => {
    expect(mapNequiStatusCode('35')).toBe('paid')
  })

  it('maps "71" → failed', () => {
    expect(mapNequiStatusCode('71')).toBe('failed')
  })

  it('maps "10-454" → expired', () => {
    expect(mapNequiStatusCode('10-454')).toBe('expired')
  })

  it('maps "10-455" → cancelled', () => {
    expect(mapNequiStatusCode('10-455')).toBe('cancelled')
  })

  it('falls back to failed on unknown numeric code', () => {
    expect(mapNequiStatusCode('99')).toBe('failed')
  })

  it('falls back to failed on empty string', () => {
    expect(mapNequiStatusCode('')).toBe('failed')
  })

  it('falls back to failed on garbage value', () => {
    expect(mapNequiStatusCode('garbage')).toBe('failed')
  })

  it('falls back to failed on "unknown" (client default)', () => {
    expect(mapNequiStatusCode('unknown')).toBe('failed')
  })
})

describe('mapWebhookPaymentStatus', () => {
  it('maps SUCCESS → paid', () => {
    expect(mapWebhookPaymentStatus('SUCCESS')).toBe('paid')
  })

  it('maps CANCELED → cancelled', () => {
    expect(mapWebhookPaymentStatus('CANCELED')).toBe('cancelled')
  })

  it('maps DENIED → failed', () => {
    expect(mapWebhookPaymentStatus('DENIED')).toBe('failed')
  })
})
