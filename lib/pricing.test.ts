import { describe, expect, it } from 'vitest'
import { computeEffectivePrice, isDiscountActive } from './pricing'

// ---- Helpers ----

const inPast = () => new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1h ago
const inFuture = () => new Date(Date.now() + 1000 * 60 * 60).toISOString() // 1h from now

// ---- isDiscountActive ----

describe('isDiscountActive', () => {
  it('returns false when discount_type is null', () => {
    expect(isDiscountActive({ price: 100, discount_type: null, discount_value: 10 })).toBe(false)
  })

  it('returns false when discount_value is null', () => {
    expect(
      isDiscountActive({ price: 100, discount_type: 'percentage', discount_value: null }),
    ).toBe(false)
  })

  it('returns true when type and value set, no date window', () => {
    expect(isDiscountActive({ price: 100, discount_type: 'percentage', discount_value: 10 })).toBe(
      true,
    )
  })

  it('returns false when starts_at is in the future', () => {
    expect(
      isDiscountActive({
        price: 100,
        discount_type: 'percentage',
        discount_value: 10,
        discount_starts_at: inFuture(),
      }),
    ).toBe(false)
  })

  it('returns true when starts_at is in the past', () => {
    expect(
      isDiscountActive({
        price: 100,
        discount_type: 'fixed',
        discount_value: 5,
        discount_starts_at: inPast(),
      }),
    ).toBe(true)
  })

  it('returns false when ends_at is in the past (expired)', () => {
    expect(
      isDiscountActive({
        price: 100,
        discount_type: 'percentage',
        discount_value: 10,
        discount_ends_at: inPast(),
      }),
    ).toBe(false)
  })

  it('returns true when ends_at is in the future', () => {
    expect(
      isDiscountActive({
        price: 100,
        discount_type: 'percentage',
        discount_value: 10,
        discount_ends_at: inFuture(),
      }),
    ).toBe(true)
  })

  it('returns true when within starts_at/ends_at window', () => {
    expect(
      isDiscountActive({
        price: 100,
        discount_type: 'fixed',
        discount_value: 20,
        discount_starts_at: inPast(),
        discount_ends_at: inFuture(),
      }),
    ).toBe(true)
  })
})

// ---- computeEffectivePrice ----

describe('computeEffectivePrice', () => {
  it('returns original price when no discount_type', () => {
    expect(computeEffectivePrice({ price: 100 })).toBe(100)
  })

  it('returns original price when discount_type is null', () => {
    expect(computeEffectivePrice({ price: 200, discount_type: null, discount_value: 50 })).toBe(200)
  })

  it('applies percentage discount correctly', () => {
    expect(
      computeEffectivePrice({ price: 200, discount_type: 'percentage', discount_value: 25 }),
    ).toBe(150)
  })

  it('applies fixed discount correctly', () => {
    expect(computeEffectivePrice({ price: 200, discount_type: 'fixed', discount_value: 30 })).toBe(
      170,
    )
  })

  it('fixed discount floors at 0 (no negative price)', () => {
    expect(computeEffectivePrice({ price: 10, discount_type: 'fixed', discount_value: 999 })).toBe(
      0,
    )
  })

  it('returns original price when discount is expired', () => {
    expect(
      computeEffectivePrice({
        price: 100,
        discount_type: 'percentage',
        discount_value: 10,
        discount_ends_at: inPast(),
      }),
    ).toBe(100)
  })

  it('returns original price when discount starts in the future', () => {
    expect(
      computeEffectivePrice({
        price: 100,
        discount_type: 'fixed',
        discount_value: 10,
        discount_starts_at: inFuture(),
      }),
    ).toBe(100)
  })

  it('applies discount when within valid date window', () => {
    expect(
      computeEffectivePrice({
        price: 100,
        discount_type: 'percentage',
        discount_value: 10,
        discount_starts_at: inPast(),
        discount_ends_at: inFuture(),
      }),
    ).toBe(90)
  })
})
