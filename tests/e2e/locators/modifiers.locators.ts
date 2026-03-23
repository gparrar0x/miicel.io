/**
 * Product Modifiers Locators
 *
 * Defines all selectors for modifier groups, options, and related UI elements.
 * Uses data-testid attributes following {feature}-{element}-{descriptor} convention.
 *
 * Coverage:
 * - Modifier sheet (modal, header, qty controls, subtotal, confirm button)
 * - Modifier groups & options (radio/checkbox inputs, price deltas, validation)
 * - Cart display (modifier summary per item)
 * - Admin CRUD (modifier group list, form, save/delete)
 * - KDS display (modifier lines per order item)
 */

export const ModifiersLocators = {
  // ============================================================================
  // CUSTOMER: MODIFIER SHEET (modal for selecting modifiers before add to cart)
  // ============================================================================
  sheet: {
    root: '[data-testid="product-modifier-sheet"]',
    header: '[data-testid="product-modifier-sheet-header"]',
    title: '[data-testid="product-modifier-sheet-title"]',
    subtitle: '[data-testid="product-modifier-sheet-subtitle"]',
    close: '[data-testid="product-modifier-sheet-close"]',

    // Quantity controls
    qtyContainer: '[data-testid="product-modifier-sheet-qty-container"]',
    qtyDec: '[data-testid="product-modifier-sheet-qty-dec"]',
    qtyInc: '[data-testid="product-modifier-sheet-qty-inc"]',
    qtyValue: '[data-testid="product-modifier-sheet-qty-value"]',

    // Modifier groups & options
    groupList: '[data-testid="modifier-group-list"]',

    // Live subtotal (before confirm)
    subtotal: '[data-testid="product-modifier-sheet-subtotal"]',
    subtotalLabel: '[data-testid="product-modifier-sheet-subtotal-label"]',
    subtotalValue: '[data-testid="product-modifier-sheet-subtotal-value"]',

    // CTA
    confirm: '[data-testid="product-modifier-sheet-confirm"]',
    confirmLoading: '[data-testid="product-modifier-sheet-confirm-loading"]',
  },

  // ============================================================================
  // CUSTOMER: MODIFIER GROUP (within sheet)
  // ============================================================================
  group: {
    // Pattern: {groupId} is the modifier group UUID or numeric ID
    container: (groupId: string) => `[data-testid="modifier-group-${groupId}"]`,
    name: (groupId: string) =>
      `[data-testid="modifier-group-${groupId}"] [data-testid="modifier-group-name"]`,
    description: (groupId: string) =>
      `[data-testid="modifier-group-${groupId}"] [data-testid="modifier-group-description"]`,
    required: (groupId: string) =>
      `[data-testid="modifier-group-${groupId}"] [data-testid="modifier-group-required-badge"]`,
    error: (groupId: string) => `[data-testid="modifier-group-${groupId}-error"]`,
    errorMessage: (groupId: string) =>
      `[data-testid="modifier-group-${groupId}-error"] [data-testid="modifier-group-error-message"]`,
  },

  // ============================================================================
  // CUSTOMER: MODIFIER OPTION (radio/checkbox within group)
  // ============================================================================
  option: {
    // Pattern: {optionId} is the modifier option UUID or numeric ID
    input: (optionId: string) => `[data-testid="modifier-option-${optionId}"]`,
    label: (optionId: string) => `[data-testid="modifier-option-${optionId}"] ~ label`,
    price: (optionId: string) => `[data-testid="modifier-option-${optionId}-price"]`,
    priceSymbol: (optionId: string) =>
      `[data-testid="modifier-option-${optionId}-price"] [data-testid="modifier-option-price-symbol"]`,
    priceValue: (optionId: string) =>
      `[data-testid="modifier-option-${optionId}-price"] [data-testid="modifier-option-price-value"]`,
    unavailable: (optionId: string) => `[data-testid="modifier-option-${optionId}-unavailable"]`,
  },

  // ============================================================================
  // CUSTOMER: CART DISPLAY (modifier summary shown in cart row)
  // ============================================================================
  cartItem: {
    // Pattern: {productId} is the product UUID or numeric ID
    modifierSummary: (productId: string) => `[data-testid="cart-item-modifiers-${productId}"]`,
    modifierTag: (productId: string) =>
      `[data-testid="cart-item-modifiers-${productId}"] [data-testid="modifier-tag"]`,
    modifierTagOption: (productId: string, optionId: string) =>
      `[data-testid="cart-item-modifiers-${productId}"] [data-testid="modifier-tag-option-${optionId}"]`,
  },

  // ============================================================================
  // ADMIN: MODIFIER GROUP LIST (CRUD dashboard)
  // ============================================================================
  adminGroupList: {
    container: '[data-testid="admin-modifier-group-list"]',
    emptyState: '[data-testid="admin-modifier-group-list-empty"]',
    addBtn: '[data-testid="admin-modifier-group-add-btn"]',
    searchInput: '[data-testid="admin-modifier-group-search"]',
  },

  // ============================================================================
  // ADMIN: MODIFIER GROUP ROW (in list)
  // ============================================================================
  adminGroupRow: {
    // Pattern: {groupId} is the modifier group UUID or numeric ID
    container: (groupId: string) => `[data-testid="admin-modifier-group-item-${groupId}"]`,
    name: (groupId: string) =>
      `[data-testid="admin-modifier-group-item-${groupId}"] [data-testid="admin-modifier-group-name-display"]`,
    minMax: (groupId: string) =>
      `[data-testid="admin-modifier-group-item-${groupId}"] [data-testid="admin-modifier-group-minmax-display"]`,
    editBtn: (groupId: string) =>
      `[data-testid="admin-modifier-group-item-${groupId}"] [data-testid="admin-modifier-group-edit-btn"]`,
    deleteBtn: (groupId: string) =>
      `[data-testid="admin-modifier-group-item-${groupId}"] [data-testid="admin-modifier-group-delete-btn"]`,
    optionCount: (groupId: string) =>
      `[data-testid="admin-modifier-group-item-${groupId}"] [data-testid="admin-modifier-group-option-count"]`,
  },

  // ============================================================================
  // ADMIN: MODIFIER GROUP FORM (create/edit modal)
  // ============================================================================
  adminForm: {
    modal: '[data-testid="admin-modifier-group-form"]',
    modalHeader: '[data-testid="admin-modifier-group-form-header"]',
    modalTitle: '[data-testid="admin-modifier-group-form-title"]',
    modalClose: '[data-testid="admin-modifier-group-form-close"]',

    // Basic info
    nameInput: '[data-testid="admin-modifier-group-name"]',
    nameError: '[data-testid="admin-modifier-group-name-error"]',
    descriptionInput: '[data-testid="admin-modifier-group-description"]',
    descriptionError: '[data-testid="admin-modifier-group-description-error"]',

    // Constraints
    minInput: '[data-testid="admin-modifier-group-min"]',
    minError: '[data-testid="admin-modifier-group-min-error"]',
    maxInput: '[data-testid="admin-modifier-group-max"]',
    maxError: '[data-testid="admin-modifier-group-max-error"]',

    // Required toggle
    requiredToggle: '[data-testid="admin-modifier-group-required"]',

    // Options section
    optionsSection: '[data-testid="admin-modifier-group-options-section"]',
    optionsLabel: '[data-testid="admin-modifier-group-options-label"]',

    // CTA
    saveBtn: '[data-testid="admin-modifier-group-save"]',
    saveBtnLoading: '[data-testid="admin-modifier-group-save-loading"]',
    deleteBtn: '[data-testid="admin-modifier-group-delete"]',
    cancelBtn: '[data-testid="admin-modifier-group-form-cancel"]',
  },

  // ============================================================================
  // ADMIN: MODIFIER OPTION ROW (within form)
  // ============================================================================
  adminOption: {
    // Pattern: {idx} is the 0-based row index
    row: (idx: number) => `[data-testid="admin-modifier-option-row-${idx}"]`,
    labelInput: (idx: number) => `[data-testid="admin-modifier-option-label-${idx}"]`,
    labelError: (idx: number) => `[data-testid="admin-modifier-option-label-${idx}-error"]`,
    priceInput: (idx: number) => `[data-testid="admin-modifier-option-price-${idx}"]`,
    priceError: (idx: number) => `[data-testid="admin-modifier-option-price-${idx}-error"]`,
    availableToggle: (idx: number) => `[data-testid="admin-modifier-option-available-${idx}"]`,
    removeBtn: (idx: number) => `[data-testid="admin-modifier-option-remove-${idx}"]`,
  },

  // ============================================================================
  // ADMIN: ADD OPTION BUTTON (in form)
  // ============================================================================
  adminAddOption: '[data-testid="admin-modifier-option-add"]',

  // ============================================================================
  // KDS: MODIFIER DISPLAY (for order fulfillment)
  // ============================================================================
  kds: {
    // Pattern: {orderId} is the order UUID, {itemIdx} is the item index
    itemModifiers: (orderId: string, itemIdx: number) =>
      `[data-testid="kds-item-modifiers-${orderId}-${itemIdx}"]`,
    modifierLine: (orderId: string, itemIdx: number, lineIdx: number) =>
      `[data-testid="kds-item-modifiers-${orderId}-${itemIdx}"] [data-testid="kds-modifier-line-${lineIdx}"]`,
    modifierGroupName: (orderId: string, itemIdx: number, lineIdx: number) =>
      `[data-testid="kds-item-modifiers-${orderId}-${itemIdx}"] [data-testid="kds-modifier-line-${lineIdx}"] [data-testid="kds-modifier-group-name"]`,
    modifierOptionValue: (orderId: string, itemIdx: number, lineIdx: number) =>
      `[data-testid="kds-item-modifiers-${orderId}-${itemIdx}"] [data-testid="kds-modifier-line-${lineIdx}"] [data-testid="kds-modifier-option-value"]`,
  },
} as const
