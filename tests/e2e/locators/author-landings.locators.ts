/**
 * Author Landings Locators
 *
 * Defines all selectors for author landing dashboard editor and public landing pages.
 * Uses data-testid attributes following {feature}-{element}-{type} convention.
 *
 * Coverage:
 * - Dashboard editor (author select, image upload, prompt input, generate/publish buttons)
 * - Preview container (live preview of generated content)
 * - Public landing page (hero, image, bio, CTA button)
 */

export const AuthorLandingsLocators = {
  // ============================================================================
  // DASHBOARD EDITOR
  // ============================================================================
  dashboard: {
    // Author selection dropdown
    authorSelectDropdown: '[data-testid="author-select-dropdown"]',
    authorSelectTrigger: '[data-testid="author-select-dropdown"] [data-testid="select-trigger"]',
    authorSelectContent: '[data-testid="author-select-dropdown"] [data-testid="select-content"]',
    authorSelectItem: (authorName: string) =>
      `[data-testid="author-select-dropdown"] [data-testid="select-item"][data-value*="${authorName}"]`,

    // Image upload
    authorImageUpload: '[data-testid="author-image-upload"]',
    authorImageInput: '[data-testid="author-image-upload"] input[type="file"]',
    authorImagePreview: '[data-testid="author-image-preview"]',

    // Prompt textarea
    authorPromptTextarea: '[data-testid="author-prompt-textarea"]',

    // Action buttons
    authorGenerateBtn: '[data-testid="author-generate-btn"]',
    authorRegenerateBtn: '[data-testid="author-regenerate-btn"]',
    authorPublishBtn: '[data-testid="author-publish-btn"]',

    // Status badge
    authorStatusBadge: '[data-testid="author-status-badge"]',

    // Loading states
    authorGeneratingSpinner: '[data-testid="author-generating-spinner"]',
    authorPublishingSpinner: '[data-testid="author-publishing-spinner"]',
  },

  // ============================================================================
  // PREVIEW CONTAINER
  // ============================================================================
  preview: {
    container: '[data-testid="author-preview-container"]',
    heading: '[data-testid="author-preview-heading"]',
    noPreviewState: '[data-testid="author-preview-empty-state"]',
  },

  // ============================================================================
  // PUBLIC LANDING PAGE
  // ============================================================================
  public: {
    // Hero section
    heroSection: '[data-testid="author-landing-hero"]',
    heroHeadline: '[data-testid="author-landing-hero"] h1',
    heroSubheadline: '[data-testid="author-landing-hero"] p',

    // Author image
    authorImage: '[data-testid="author-landing-image"]',

    // Bio section
    bioSection: '[data-testid="author-landing-bio"]',
    bioTitle: '[data-testid="author-landing-bio"] h2',
    bioText: '[data-testid="author-landing-bio"] p',

    // CTA section
    ctaSection: '[data-testid="author-landing-cta"]',
    ctaHeading: '[data-testid="author-landing-cta"] p',
    ctaButton: '[data-testid="author-landing-cta"] a',

    // Error state (404)
    notFoundHeading: 'text=404',
  },

  // ============================================================================
  // COMMON UI
  // ============================================================================
  common: {
    toastSuccess: '[role="alert"] text=/éxito|creado|publicado|actualizado/i',
    toastError: '[role="alert"] text=/error|falló/i',
    loadingSpinner: '[data-testid*="spinner"]',
    modal: '[role="dialog"]',
  },
}
