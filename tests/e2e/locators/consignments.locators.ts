/**
 * Consignments Test Locators
 *
 * Single source of truth for all data-testid selectors in the consignments UI
 * Updated against docs/specs/consignment-ux-spec.md and Aurora designs
 *
 * Pattern: page.getByTestId(CONSIGNMENTS.OVERVIEW.STATS.TOTAL_WORKS)
 */

export const CONSIGNMENTS = {
  // Overview Page
  OVERVIEW: {
    CONTAINER: 'consignment-overview',
    STATS: {
      TOTAL_WORKS: 'consignment-stat-total_works',
      ACTIVE_LOCATIONS: 'consignment-stat-active_locations',
      WORKS_IN_GALLERY: 'consignment-stat-works_in_gallery',
      SOLD_THIS_MONTH: 'consignment-stat-works_sold_this_month',
    },
    ALERTS: {
      LONGEST_IN_GALLERY: (workId: string) => `alert-item-${workId}`,
    },
    MOVEMENTS: {
      TIMELINE: 'recent-movements-timeline',
    },
  },

  // Locations List & Management
  LOCATIONS: {
    CONTAINER: 'location-list',
    GRID: 'location-grid',
    EMPTY_STATE: 'locations-empty-state',
    SEARCH_INPUT: 'location-search',
    ADD_BUTTON: 'add-location-button',
    ADD_FIRST_BUTTON: 'add-first-location-button',
    CARD: (locationId: string) => `location-card-${locationId}`,
    CARD_EDIT_BTN: (locationId: string) => `edit-location-${locationId}`,
    CARD_DELETE_BTN: (locationId: string) => `delete-location-${locationId}`,
    CITY_FILTER: (city: string) => `city-filter-${city}`,
  },

  // Location Form (Create/Edit Modal)
  FORM: {
    MODAL: 'location-form-modal',
    CONTAINER: 'location-form',
    NAME_INPUT: 'location-name-input',
    CITY_INPUT: 'location-city-input',
    COUNTRY_INPUT: 'location-country-input',
    ADDRESS_INPUT: 'location-address-input',
    CONTACT_NAME_INPUT: 'location-contact-name-input',
    CONTACT_EMAIL_INPUT: 'location-contact-email-input',
    CONTACT_PHONE_INPUT: 'location-contact-phone-input',
    SAVE_BTN: 'location-save-btn',
    CANCEL_BTN: 'cancel-button',
    CLOSE_MODAL_BTN: 'close-modal',
  },

  // Artwork Assignment Modal
  ASSIGN_ARTWORK: {
    MODAL: 'assign-artwork-modal',
    ARTWORK_SELECT: 'artwork-select',
    STATUS_SELECT: 'status-select',
    PRODUCT_OPTION: (productId: string) => `product-option-${productId}`,
    CONFIRM_BTN: 'confirm-assign-btn',
    CANCEL_BTN: 'cancel-button',
    CLOSE_MODAL_BTN: 'close-modal',
  },

  // Select Product Modal
  SELECT_PRODUCT: {
    MODAL: 'select-product-modal',
    SEARCH_INPUT: 'product-search',
    PRODUCT_OPTION: (productId: string) => `product-option-${productId}`,
    STATUS_SELECT: 'status-select',
    CONFIRM_BTN: 'confirm-assign-btn',
    CANCEL_BTN: 'cancel-button',
    CLOSE_MODAL_BTN: 'close-modal',
  },

  // Consignment History
  HISTORY: {
    CONTAINER: 'consignment-history',
    TIMELINE_EVENT: (movementId: string) => `timeline-event-${movementId}`,
    TIMELINE_DOT: (index: number) => `timeline-dot-${index}`,
  },

  // Location Skeleton (loading state)
  SKELETON: (index: number) => `location-skeleton-${index}`,
} as const
