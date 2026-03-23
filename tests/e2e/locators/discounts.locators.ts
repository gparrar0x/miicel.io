/**
 * Order Discounts Locators
 *
 * Defines all selectors for discount admin panel, checkout discount display,
 * and KDS discount lines.
 * Uses data-testid attributes following {feature}-{element}-{descriptor} convention.
 *
 * Coverage:
 * - Admin discount panel (type toggle, value input, scope selector, apply/remove)
 * - Cart summary discount display (original total, discount line, final total)
 * - Checkout summary discount display
 * - KDS discount lines (original, discount, final)
 * - Discount badge (reusable component)
 */

export const DiscountsLocators = {
  // ============================================================================
  // ADMIN: DISCOUNT PANEL
  // ============================================================================
  adminPanel: {
    container: '[data-testid="admin-discount-panel"]',
    title: '[data-testid="admin-discount-panel-title"]',
    description: '[data-testid="admin-discount-panel-description"]',

    // Type toggle (Fixed vs Percentage)
    typeSection: '[data-testid="admin-discount-type-section"]',
    typeLabel: '[data-testid="admin-discount-type-label"]',
    typeFixed: '[data-testid="admin-discount-type-fixed"]',
    typePercent: '[data-testid="admin-discount-type-percent"]',

    // Value input
    valueLabel: '[data-testid="admin-discount-value-label"]',
    valueInput: '[data-testid="admin-discount-value"]',
    valueError: '[data-testid="admin-discount-value-error"]',
    valueSuffix: '[data-testid="admin-discount-value-suffix"]', // "$" or "%"

    // Scope selector (Order vs Item)
    scopeSection: '[data-testid="admin-discount-scope-section"]',
    scopeLabel: '[data-testid="admin-discount-scope-label"]',
    scopeOrder: '[data-testid="admin-discount-scope-order"]',
    scopeOrderLabel: '[data-testid="admin-discount-scope-order-label"]',
    scopeItem: '[data-testid="admin-discount-scope-item"]',
    scopeItemLabel: '[data-testid="admin-discount-scope-item-label"]',

    // Target item dropdown (only for scope=item)
    targetSection: '[data-testid="admin-discount-target-section"]',
    targetLabel: '[data-testid="admin-discount-target-label"]',
    targetItem: '[data-testid="admin-discount-target-item"]',
    targetError: '[data-testid="admin-discount-target-error"]',

    // Label/memo input
    labelSection: '[data-testid="admin-discount-label-section"]',
    labelInput: '[data-testid="admin-discount-label"]',
    labelError: '[data-testid="admin-discount-label-error"]',

    // Live preview
    previewSection: '[data-testid="admin-discount-preview-section"]',
    previewLabel: '[data-testid="admin-discount-preview-label"]',
    preview: '[data-testid="admin-discount-preview"]',
    previewOriginal: '[data-testid="admin-discount-preview-original"]',
    previewDiscount: '[data-testid="admin-discount-preview-discount"]',
    previewFinal: '[data-testid="admin-discount-preview-final"]',

    // CTA
    applyBtn: '[data-testid="admin-discount-apply"]',
    applyBtnLoading: '[data-testid="admin-discount-apply-loading"]',
    removeBtn: '[data-testid="admin-discount-remove"]',
    clearBtn: '[data-testid="admin-discount-clear"]',

    // Active indicator
    activeBadge: '[data-testid="admin-discount-active-badge"]',
  },

  // ============================================================================
  // CART SUMMARY: DISCOUNT DISPLAY
  // ============================================================================
  cartSummary: {
    container: '[data-testid="cart-summary-container"]',

    // Original total (before discount)
    originalTotalLabel: '[data-testid="cart-summary-original-total-label"]',
    originalTotal: '[data-testid="cart-summary-original-total"]',

    // Discount line
    discountContainer: '[data-testid="cart-summary-discount"]',
    discountLabel: '[data-testid="cart-summary-discount-label"]',
    discountValue: '[data-testid="cart-summary-discount-value"]',

    // Final total (after discount)
    finalTotalLabel: '[data-testid="cart-summary-final-total-label"]',
    finalTotal: '[data-testid="cart-summary-final-total"]',

    // Alternative: single total when no discount
    totalLabel: '[data-testid="cart-summary-total-label"]',
    total: '[data-testid="cart-summary-total"]',
  },

  // ============================================================================
  // CHECKOUT SUMMARY: DISCOUNT DISPLAY
  // ============================================================================
  checkoutSummary: {
    container: '[data-testid="checkout-summary-container"]',

    // Original total (before discount)
    originalTotalLabel: '[data-testid="checkout-summary-original-total-label"]',
    originalTotal: '[data-testid="checkout-summary-original-total"]',

    // Discount line
    discountContainer: '[data-testid="checkout-summary-discount"]',
    discountLabel: '[data-testid="checkout-summary-discount-label"]',
    discountValue: '[data-testid="checkout-summary-discount-value"]',

    // Final total (after discount)
    finalTotalLabel: '[data-testid="checkout-summary-final-total-label"]',
    finalTotal: '[data-testid="checkout-summary-final-total"]',

    // Alternative: single total when no discount
    totalLabel: '[data-testid="checkout-summary-total-label"]',
    total: '[data-testid="checkout-summary-total"]',
  },

  // ============================================================================
  // KDS: DISCOUNT DISPLAY (for order fulfillment)
  // ============================================================================
  kds: {
    // Pattern: {orderId} is the order UUID
    originalTotalLabel: (orderId: string) =>
      `[data-testid="kds-order-original-total-label-${orderId}"]`,
    originalTotal: (orderId: string) => `[data-testid="kds-order-original-total-${orderId}"]`,

    // Discount line
    discountContainer: (orderId: string) => `[data-testid="kds-order-discount-${orderId}"]`,
    discountLabel: (orderId: string) =>
      `[data-testid="kds-order-discount-${orderId}"] [data-testid="kds-discount-label"]`,
    discountValue: (orderId: string) =>
      `[data-testid="kds-order-discount-${orderId}"] [data-testid="kds-discount-value"]`,

    // Final total
    finalTotalLabel: (orderId: string) => `[data-testid="kds-order-final-total-label-${orderId}"]`,
    finalTotal: (orderId: string) => `[data-testid="kds-order-final-total-${orderId}"]`,

    // Alternative: single total when no discount
    totalLabel: (orderId: string) => `[data-testid="kds-order-total-label-${orderId}"]`,
    total: (orderId: string) => `[data-testid="kds-order-total-${orderId}"]`,
  },

  // ============================================================================
  // REUSABLE: DISCOUNT BADGE
  // ============================================================================
  badge: {
    container: '[data-testid="discount-badge"]',
    label: '[data-testid="discount-badge-label"]',
    value: '[data-testid="discount-badge-value"]',
  },
} as const
