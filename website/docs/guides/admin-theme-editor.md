---
sidebar_position: 1
title: Document
---

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

## Files Created

### 1. Settings Page
**Path:** `/app/[tenantId]/dashboard/settings/appearance/page.tsx`

Server component that:
- Authenticates user
- Verifies OWNER role
- Fetches current theme from database
- Passes initial data to client component

### 2. Theme Editor Client
**Path:** `/components/admin/ThemeEditorClient.tsx`

Main orchestrator component with:
- Form state management (react-hook-form + Zod)
- Debounced preview updates (300ms)
- Save/Reset actions
- API integration
- 2-column responsive layout

### 3. Template Selector
**Path:** `/components/admin/TemplateSelector.tsx`

Radio card selector for 3 templates:
- Gallery (large images, hover zoom)
- Detail (wide layout, rich info)
- Minimal (compact grid, many products)

Visual indicators + template defaults info.

### 4. Theme Fields Editor
**Path:** `/components/admin/ThemeFieldsEditor.tsx`

Form inputs for customization:
- **Grid Columns:** Range slider (1-6)
- **Image Aspect:** Select dropdown (1:1, 4:3, 16:9)
- **Card Variant:** Visual picker (flat, elevated, outlined)
- **Spacing:** Radio buttons (compact, normal, relaxed)
- **Primary Color:** Color picker + hex input
- **Accent Color:** Color picker + hex input

All inputs have `data-testid` attributes for E2E testing.

### 5. Theme Preview
**Path:** `/components/admin/ThemePreview.tsx`

Live preview component with:
- Sample products (4 items from Unsplash)
- ThemeProvider wrapper with resolved theme
- ProductGrid rendering current template
- Visual feedback of current settings

### 6. Barrel Export
**Path:** `/components/admin/index.ts`

Exports all admin components for clean imports.

---

## Usage

### Access Control

**Route:** `/{tenantId}/dashboard/settings/appearance`

**Requirements:**
- User must be authenticated
- User must be member of tenant
- User must have OWNER role

**Redirects:** Non-owners redirected to `/{tenantId}`

### Navigation Flow

```
Dashboard → Settings → Appearance
```

(Note: Dashboard navigation may need to be added separately)

### Form Workflow

1. **Select Template:** Choose from Gallery/Detail/Minimal
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

### Error Handling
- Validation errors: Toast with error message
- Network errors: Toast with retry suggestion
- Auth errors: Handled by server-side redirect

---

## Testing

### Test IDs

**Page:**
- N/A (server component)

**ThemeEditorClient:**
- `theme-save-button`
- `theme-reset-button`

**TemplateSelector:**
- `template-selector-{template}` (gallery, detail, minimal)
- `template-radio-{template}`

**ThemeFieldsEditor:**
- `theme-grid-cols-slider`
- `theme-grid-cols-value`
- `theme-image-aspect-select`
- `theme-card-variant-{variant}` (flat, elevated, outlined)
- `theme-spacing-{mode}` (compact, normal, relaxed)
- `theme-primary-color-picker`
- `theme-primary-color-input`
- `theme-accent-color-picker`
- `theme-accent-color-input`

**ThemePreview:**
- `theme-preview-container`

### E2E Test Scenarios

1. **Auth Guard:**
   - Non-OWNER users cannot access page
   - Unauthenticated users redirected

2. **Template Selection:**
   - Click template radio → form updates
   - Preview updates with new template
   - Overrides reset to template defaults

3. **Field Validation:**
   - Invalid hex color → error message
   - Grid cols out of range → validation error
   - Invalid aspect ratio format → error

4. **Save/Reset:**
   - Click Save → API called, toast shown
   - Click Reset → form reverted to defaults
   - Dirty state tracking

5. **Preview Updates:**
   - Change field → preview updates after 300ms
   - Multiple rapid changes → debounced correctly

---

## Dependencies

- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation
- `sonner` - Toast notifications
- Existing components: ThemeProvider, ProductGrid, Card variants

---

## Future Enhancements

1. **Color Contrast Validation:** Warn if WCAG AA fails
2. **Custom Aspect Ratios:** Free-form input for ratios
3. **Template Previews:** Screenshot thumbnails in selector
4. **Undo/Redo:** History management for changes
5. **Export/Import:** JSON config download/upload
6. **Live Storefront Preview:** Iframe of actual tenant store

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

---

**End of Document**
