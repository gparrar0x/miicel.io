/**
 * Pricing helpers — product-level discount computation.
 * Pure functions: no side-effects, no DB calls.
 */

export interface ProductDiscountFields {
  price: number
  discount_type?: string | null
  discount_value?: number | null
  discount_starts_at?: string | null
  discount_ends_at?: string | null
}

/**
 * Returns true when the product has a discount that is currently active
 * (type set, value set, within the optional date window).
 */
export function isDiscountActive(product: ProductDiscountFields): boolean {
  if (!product.discount_type || product.discount_value == null) return false

  const now = Date.now()

  if (product.discount_starts_at != null) {
    const startsAt = new Date(product.discount_starts_at).getTime()
    if (now < startsAt) return false
  }

  if (product.discount_ends_at != null) {
    const endsAt = new Date(product.discount_ends_at).getTime()
    if (now >= endsAt) return false
  }

  return true
}

/**
 * Returns the effective (post-discount) price for a product.
 * Falls back to the original price when no active discount applies.
 */
export function computeEffectivePrice(product: ProductDiscountFields): number {
  if (!isDiscountActive(product)) return product.price

  const value = product.discount_value as number

  if (product.discount_type === 'percentage') {
    return product.price * (1 - value / 100)
  }

  if (product.discount_type === 'fixed') {
    return Math.max(0, product.price - value)
  }

  // Unknown type — fallback to original
  return product.price
}

// Currency formatting — cached per currency to avoid re-creating on every render
const formatters = new Map<string, Intl.NumberFormat>()

export function formatCurrency(price: number, currency: string): string {
  let fmt = formatters.get(currency)
  if (!fmt) {
    fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency })
    formatters.set(currency, fmt)
  }
  return fmt.format(price)
}
