---
sidebar_position: 1
title: Admin Theme Editor
---

# Admin Theme Editor - Implementation Guide

**Issue:** #6  
**Created:** 2025-11-16  
**Status:** Complete

---

## Overview

Admin UI for tenant owners to customize storefront theme via web interface. Provides template selection, theme overrides, and live preview.

---

## Access Control

**Route:** `/{tenantId}/dashboard/settings/appearance`

**Requirements:**
- User must be authenticated
- User must be member of tenant
- User must have OWNER role

**Redirects:** Non-owners redirected to `/{tenantId}`

---

## Navigation Flow

```
Dashboard → Settings → Appearance
```

---

## Form Workflow

1. **Select Template:** Choose from Gallery/Detail/Minimal/Restaurant
   - Auto-loads template defaults
   - Preserves custom colors

2. **Customize Theme:** Adjust overrides
   - Grid columns (layout density)
   - Image aspect (product card ratio)
   - Card variant (visual style)
   - Spacing (component padding)
   - Colors (brand identity)

3. **Preview Changes:** Live preview updates after 300ms
   - Shows sample products in selected template
   - Applies all theme overrides

4. **Save/Reset:**
   - **Save:** PATCH to API, toast feedback
   - **Reset:** Restore template defaults

---

## API Integration

### Endpoint
`PATCH /api/tenants/[slug]/theme`

### Request Body
```json
{
  "template": "gallery",
  "overrides": {
    "gridCols": 3,
    "imageAspect": "1:1",
    "cardVariant": "elevated",
    "spacing": "normal",
    "colors": {
      "primary": "#3B82F6",
      "accent": "#F59E0B"
    }
  }
}
```

### Response
```json
{
  "template": "gallery",
  "overrides": { ... }
}
```

---

## Components

### ThemeEditorClient
Main orchestrator component with:
- Form state management (react-hook-form + Zod)
- Debounced preview updates (300ms)
- Save/Reset actions
- API integration
- 2-column responsive layout

### TemplateSelector
Radio card selector for templates:
- Gallery (large images, hover zoom)
- Detail (wide layout, rich info)
- Minimal (compact grid, many products)
- Restaurant (mobile-first ordering)

### ThemeFieldsEditor
Form inputs for customization:
- **Grid Columns:** Range slider (1-6)
- **Image Aspect:** Select dropdown (1:1, 4:3, 16:9)
- **Card Variant:** Visual picker (flat, elevated, outlined)
- **Spacing:** Radio buttons (compact, normal, relaxed)
- **Primary Color:** Color picker + hex input
- **Accent Color:** Color picker + hex input

### ThemePreview
Live preview component with:
- Sample products (4 items from Unsplash)
- ThemeProvider wrapper with resolved theme
- ProductGrid rendering current template
- Visual feedback of current settings

---

## Testing

All inputs have `data-testid` attributes for E2E testing.

### Test IDs

- `theme-save-button`
- `theme-reset-button`
- `template-selector-{template}`
- `theme-grid-cols-slider`
- `theme-image-aspect-select`
- `theme-card-variant-{variant}`
- `theme-primary-color-picker`
- `theme-accent-color-picker`
- `theme-preview-container`

---

## Troubleshooting

### Issue: Preview not updating
**Cause:** Debounce delay or ThemeProvider not receiving updates  
**Fix:** Check console for theme resolution logs, verify formData prop

### Issue: Save fails with 403
**Cause:** User not OWNER or auth token expired  
**Fix:** Check role in database, verify session valid

### Issue: Colors not applying
**Cause:** Invalid hex format or CSS var not injected  
**Fix:** Validate hex regex, check browser DevTools for CSS vars

---

## Related Files

- `/types/theme.ts` - Type definitions
- `/lib/schemas/theme.ts` - Zod validation schemas
- `/api/tenants/[slug]/theme/route.ts` - API endpoint
- `/components/theme/ThemeProvider.tsx` - CSS var injection
- `/components/storefront/` - Card components + grid

