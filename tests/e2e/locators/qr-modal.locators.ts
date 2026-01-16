/**
 * QR Product Modal Locators
 *
 * Defines all selectors for the QR code generation modal.
 * Uses data-testid attributes following {feature}-{element}-{type} convention.
 *
 * Coverage:
 * - ProductsTable QR button by product ID
 * - QR modal container and elements
 * - Product name display
 * - QR code canvas
 * - URL preview
 * - Print and download buttons
 * - Close button
 */

export const QRModalLocators = {
  // ============================================================================
  // PRODUCTS TABLE QR BUTTON
  // ============================================================================
  table: {
    qrButton: (productId: string) => `[data-testid="product-row-qr-button-${productId}"]`,
  },

  // ============================================================================
  // MODAL CONTAINER & HEADER
  // ============================================================================
  modal: {
    container: '[data-testid="qr-modal-container"]',
  },

  // ============================================================================
  // MODAL CONTENT
  // ============================================================================
  content: {
    productName: '[data-testid="qr-modal-product-name"]',
    qrCode: (productId: string) => `[data-testid="qr-code-${productId}"]`,
    urlPreview: '[data-testid="qr-modal-url-preview"]',
  },

  // ============================================================================
  // MODAL ACTIONS
  // ============================================================================
  actions: {
    printButton: '[data-testid="qr-modal-print-button"]',
    downloadButton: '[data-testid="qr-modal-download-button"]',
    closeButton: '[data-testid="qr-modal-close-button"]',
  },
} as const

/**
 * Wait times for QR modal interactions
 */
export const QRModalWaits = {
  modalOpen: 2000,
  contentVisible: 2000,
  download: 3000,
} as const
