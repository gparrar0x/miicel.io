/**
 * Content Generation / Pipeline Locators
 *
 * Defines all selectors for the content generation feature:
 * - Generation trigger & config panel
 * - Prompt, quality, ratio, counts, toggles
 * - Progress tracking (steps, status, cancel)
 * - Asset gallery & download
 * - Generation history
 * - Usage quota & rate limits
 *
 * Uses data-testid attributes from Pixel implementation.
 */

export const ContentGenerationLocators = {
  // ============================================================================
  // TRIGGER & CONFIG PANEL
  // ============================================================================
  trigger: {
    generateButton: '[data-testid="generate-content-btn"]',
  },

  config: {
    panel: '[data-testid="generation-config-panel"]',
    promptInput: '[data-testid="generation-prompt-input"]',
    qualitySelect: '[data-testid="generation-quality-select"]',
    ratioSelect: '[data-testid="generation-ratio-select"]',
    imageCount: '[data-testid="generation-image-count"]',
    videoToggle: '[data-testid="generation-video-toggle"]',
    reelsToggle: '[data-testid="generation-reels-toggle"]',
    confirmButton: '[data-testid="generation-confirm-btn"]',
  },

  // ============================================================================
  // USAGE QUOTA
  // ============================================================================
  usage: {
    quota: '[data-testid="generation-usage-quota"]',
  },

  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================
  progress: {
    container: '[data-testid="generation-progress"]',
    statusBadge: '[data-testid="progress-status-badge"]',
    stepImages: '[data-testid="progress-step-images"]',
    stepVideo: '[data-testid="progress-step-video"]',
    stepReels: '[data-testid="progress-step-reels"]',
    cancelButton: '[data-testid="progress-cancel-btn"]',
    error: '[data-testid="progress-error"]',
  },

  // ============================================================================
  // ASSET GALLERY & DOWNLOAD
  // ============================================================================
  gallery: {
    container: '[data-testid="asset-gallery"]',
    /** Dynamic: asset-card-image-0, asset-card-video-0, asset-card-reel-0 */
    imageCard: (index: number) => `[data-testid="asset-card-image-${index}"]`,
    videoCard: (index: number) => `[data-testid="asset-card-video-${index}"]`,
    reelCard: (index: number) => `[data-testid="asset-card-reel-${index}"]`,
    downloadAssetButton: '[data-testid="download-asset-btn"]',
    downloadAllButton: '[data-testid="download-all-btn"]',
  },

  // ============================================================================
  // GENERATION HISTORY
  // ============================================================================
  history: {
    container: '[data-testid="generation-history"]',
    /** Dynamic: history-item-0, history-item-1 */
    item: (index: number) => `[data-testid="history-item-${index}"]`,
    itemToggle: (index: number) => `[data-testid="history-item-${index}-toggle"]`,
  },

  // ============================================================================
  // API MOCK HELPERS (for Playwright route interception)
  // ============================================================================
  api: {
    generate: '**/api/content/generate',
    jobStatus: '**/api/content/jobs/*',
    history: '**/api/content/history',
    usage: '**/api/content/usage',
    cancelJob: '**/api/content/jobs/*',
  },
} as const
