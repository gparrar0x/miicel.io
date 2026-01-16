# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **QR Product Generation** (COM-5): Admins can generate, print, and download QR codes for products
  - QRProductModal component with print/download functionality
  - QR button in ProductsTable row actions
  - Print stylesheet for 6x6cm QR output (exceeds 2cm minimum)
  - E2E tests for QR modal (8 scenarios)
  - i18n support (en/es)

- **WhatsApp Integration**: Storefront WhatsApp button for direct customer contact
  - WhatsAppButton component in storefront layouts
  - Tenant settings for WhatsApp number configuration
  - Database migration for whatsapp_number field
  - E2E tests for WhatsApp button functionality

### Changed

- Updated Playwright config for improved test stability
- Enhanced auth fixtures for E2E tests
