# Multi-Tenant Template System: Design Spec

**Updated:** 2025-01-18
**Owner:** Aurora + Mentat

---

## Context

Multi-tenant ecommerce needs visual customization. 3 template variants cover 80% retail use cases.
**KPI:** Tenant onboarding ↑, customization support ↓.

---

## Template Directions

### 1. Gallery (visual-first)
- **Use Case:** Fashion, art, lifestyle
- **Grid:** 3-4 col masonry, asymmetric
- **Image:** 3:4 portrait or 1:1 square, large hero
- **Card:** Minimal overlay, image-dominant
- **Typography:** Display serif hero + sans body, 24-48px heads
- **Target:** Time-on-page ↑30%, CTR ↑15%

### 2. Detail (specs-heavy)
- **Use Case:** Tech, appliances, tools
- **Grid:** 2 col strict, sidebar filters
- **Image:** 16:9 or 4:3, multi-angle thumbs, zoom
- **Card:** Expanded info (price, specs, badges)
- **Typography:** Sans system, tabular nums
- **Target:** Add-to-cart ↑20%, returns ↓10%

### 3. Minimal (luxury/simple)
- **Use Case:** Luxury, simple catalogs
- **Grid:** 2 col max, 24-48px gaps
- **Image:** 1:1 square, consistent crop, soft shadows
- **Card:** Single CTA, name + price only
- **Typography:** Geometric sans or refined serif, generous tracking
- **Target:** Perceived quality ↑, distraction ↓

---

## Design Tokens

```json
{
  "spacing": [4, 8, 12, 16, 24, 32, 48, 64],
  "breakpoints": {"sm": 640, "md": 768, "lg": 1024, "xl": 1280},
  "color": {
    "gallery": {"primary": "#1a1a1a", "accent": "#e63946", "bg": "#fafafa"},
    "detail": {"primary": "#0d1b2a", "accent": "#118ab2", "bg": "#ffffff"},
    "minimal": {"primary": "#2b2d42", "accent": "#8d99ae", "bg": "#edf2f4"}
  },
  "typography": {
    "gallery": {"heading": "Playfair Display", "body": "Inter"},
    "detail": {"heading": "IBM Plex Sans", "body": "IBM Plex Sans"},
    "minimal": {"heading": "Montserrat", "body": "Lato"}
  },
  "grid": {
    "gallery": {"cols": [2, 3, 4], "gap": [16, 24, 32]},
    "detail": {"cols": [1, 2], "gap": [12, 16, 20]},
    "minimal": {"cols": [1, 2], "gap": [24, 32, 48]}
  },
  "imageAspect": {
    "gallery": ["3:4", "1:1"],
    "detail": ["16:9", "4:3"],
    "minimal": ["1:1"]
  }
}
```

**Accessibility:** Contrast ≥4.5:1, focus 2px outline, AA compliant scales.

---

## Component Breakdown

| Component | Variants | States | Responsive |
|-----------|----------|--------|-----------|
| ProductCard | gallery / detail / minimal | default, hover, loading | Stack <md, grid ≥md |
| ProductGrid | masonry / strict / spacious | empty, loading, error | 4→2→1 cols |
| ImageGallery | carousel / thumbs / single | zoom, fullscreen | Touch mobile, click desktop |
| FilterSidebar | expanded / collapsed | sticky / static | Drawer <lg, sidebar ≥lg |
| ThemeProvider | — | — | CSS vars per template |

**Data attributes:** `data-testid="{component}-{variant}-{action}"` for E2E.

---

## Handoff

**Pixel:**
- `/components/storefront/{Gallery,Detail,Minimal}Card.tsx`
- `/lib/themes.ts` token exports
- Storybook: 3 templates × 3 states

**Kokoro:**
- DB: `tenant_template` enum, `tenant_overrides` JSONB
- API: `GET/PATCH /api/tenants/:id/theme`
- Admin endpoint validates overrides

**Sentinela:**
- E2E: template switch, theme persist, card interactions
- Visual regression: 3 templates × mobile/desktop

---

## Next

1. Initialize repo → run `gh` issue commands
2. Pixel: components + theme provider (Issues #2, #3)
3. Kokoro: schema + API (Issues #1, #5)
4. Sentinela: E2E after data-testid coverage (Issue #6)
5. Mentat: docs draft (Issue #7)

**Metrics check (2 weeks):**
Template switch <30s? Support tickets ↓50%? Activation rate same or ↑?
