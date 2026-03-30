# Template System - Developer Guide

**Audience:** Engineers extending/maintaining template system
**Version:** 1.0
**Updated:** 2025-01-16

---

## Architecture Overview

### Data Flow

```
DB (tenants.template + theme_overrides)
  ↓
API (/api/tenants/[slug]/theme)
  ↓
ThemeProvider (injects CSS vars)
  ↓
ProductGrid (consumes theme via useTheme())
  ↓
Card Variants (GalleryCard | DetailCard | MinimalCard)
```

---

## Core Components

### 1. Database Schema

**Table:** `tenants`

```sql
template VARCHAR(50) DEFAULT 'gallery'  -- 'gallery' | 'detail' | 'minimal'
theme_overrides JSONB DEFAULT '{}'      -- partial overrides
```

**Validation:** PL/pgSQL trigger validates JSONB structure on INSERT/UPDATE

**Migration:** `db/supabase/migrations/015_add_tenant_template_theme.sql`

---

### 2. Type System

**Location:** `/types/theme.ts`

**Key Types:**
```typescript
type TenantTemplate = 'gallery' | 'detail' | 'minimal';

interface ThemeOverrides {
  gridCols?: 1 | 2 | 3 | 4 | 5 | 6;
  imageAspect?: '1:1' | '4:3' | '16:9';
  cardVariant?: 'flat' | 'elevated' | 'outlined';
  spacing?: 'compact' | 'normal' | 'relaxed';
  colors?: {
    primary?: string;   // hex
    accent?: string;    // hex
  };
}

interface ResolvedTheme {
  template: TenantTemplate;
  gridCols: number;
  imageAspect: string;
  cardVariant: string;
  spacing: string;
  colors: {
    primary: string;
    accent: string;
  };
}
```

**Helper:** `resolveTheme(template, overrides, configColors)` - merges template defaults + overrides

---

### 3. ThemeProvider

**Location:** `/components/theme/ThemeProvider.tsx`

**Responsibility:** Inject CSS variables from `ResolvedTheme`

**Usage:**
```tsx
import { ThemeProvider } from '@/components/theme/ThemeProvider';

// In root layout
const theme = resolveTheme(tenant.template, tenant.theme_overrides, config.colors);

<ThemeProvider theme={theme}>
  {children}
</ThemeProvider>
```

**CSS Variables Injected:**
```css
--grid-cols: 3
--image-aspect: 1:1
--color-primary: #000000
--color-accent: #ffffff
--spacing-xs: 0.25rem  /* computed from spacing scale */
--spacing-sm: 0.5rem
--spacing-md: 1rem
/* ... etc */
```

---

### 4. Component Variants

**Location:** `/components/storefront/`

**Files:**
- `GalleryCard.tsx` - Large image, minimal text
- `DetailCard.tsx` - Image + specs grid
- `MinimalCard.tsx` - Compact, small image

**ProductGrid:**
```tsx
<ProductGrid
  template="gallery"  // determines which card variant to render
  products={products}
/>
```

**Grid consumes:**
- `--grid-cols` for responsive columns
- Theme context via `useTheme()`

**Cards consume:**
- `--color-primary`, `--color-accent`
- `--spacing-*`
- `--image-aspect`

---

### 5. Admin UI

**Location:** `/app/[tenant]/dashboard/settings/appearance/page.tsx`

**Components:**
- `TemplateSelector` - Radio cards for template selection
- `ThemeFieldsEditor` - Form inputs for overrides
- `ThemePreview` - Live preview iframe
- `ThemeEditorClient` - Orchestrator with form state

**API Integration:**
- **GET** `/api/tenants/[slug]/theme` - Fetch current theme
- **PATCH** `/api/tenants/[slug]/theme` - Update theme

**Validation:** Zod schema in `/lib/schemas/theme.ts`

---

## API Reference

### GET `/api/tenants/[slug]/theme`

**Auth:** Any authenticated user of tenant

**Response:**
```json
{
  "template": "gallery",
  "overrides": {
    "gridCols": 3,
    "cardVariant": "elevated"
  }
}
```

**Status Codes:**
- 200 - Success
- 401 - Unauthorized
- 404 - Tenant not found

---

### PATCH `/api/tenants/[slug]/theme`

**Auth:** OWNER role only

**Request:**
```json
{
  "template": "detail",
  "overrides": {
    "gridCols": 2,
    "spacing": "relaxed",
    "colors": {
      "primary": "#dc2626"
    }
  }
}
```

**Validation:**
- Template must be valid enum
- Overrides validated by Zod schema
- DB trigger performs final JSONB validation

**Response:** Updated theme (same as GET)

**Status Codes:**
- 200 - Success
- 400 - Validation error
- 401 - Unauthorized
- 403 - Forbidden (non-owner)
- 404 - Tenant not found

---

## Adding a New Template

### 1. Update Type Enum
```typescript
// types/theme.ts
type TenantTemplate = 'gallery' | 'detail' | 'minimal' | 'YOUR_NEW_TEMPLATE';
```

### 2. Add Default Config
```typescript
// types/theme.ts
export const TEMPLATE_DEFAULTS: Record<TenantTemplate, Omit<ResolvedTheme, 'template'>> = {
  // ... existing
  YOUR_NEW_TEMPLATE: {
    gridCols: 4,
    imageAspect: '16:9',
    cardVariant: 'flat',
    spacing: 'compact',
    colors: DEFAULT_COLORS,
  },
};
```

### 3. Create Card Component
```tsx
// components/storefront/YourNewCard.tsx
import { useTheme } from '@/components/theme/use-theme';

export function YourNewCard({ product }: { product: Product }) {
  const theme = useTheme();

  return (
    <div data-testid="product-card-yournew">
      {/* Use theme.colors.primary, etc. */}
    </div>
  );
}
```

### 4. Update ProductGrid
```tsx
// components/storefront/ProductGrid.tsx
const CardComponent = {
  gallery: GalleryCard,
  detail: DetailCard,
  minimal: MinimalCard,
  YOUR_NEW_TEMPLATE: YourNewCard,  // add mapping
}[template];
```

### 5. Update Admin UI
```tsx
// components/admin/TemplateSelector.tsx
const templates = [
  { id: 'gallery', ... },
  { id: 'detail', ... },
  { id: 'minimal', ... },
  {
    id: 'YOUR_NEW_TEMPLATE',
    name: 'Your New Template',
    description: '...',
    icon: '🎨',
  },
];
```

### 6. Migration (Optional)
If changing DB enum constraint:
```sql
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_template_check;
ALTER TABLE tenants ADD CONSTRAINT tenants_template_check
  CHECK (template IN ('gallery', 'detail', 'minimal', 'YOUR_NEW_TEMPLATE'));
```

### 7. Add Tests
```typescript
// tests/e2e/specs/template-your-new.spec.ts
test('YOUR_NEW_TEMPLATE renders correctly', async ({ page }) => {
  // ...
});
```

---

## Customizing Theme Tokens

### Adding a New Override Field

**Example:** Add `buttonRadius` field

#### 1. Update Type
```typescript
// types/theme.ts
interface ThemeOverrides {
  // ... existing fields
  buttonRadius?: 'sharp' | 'rounded' | 'pill';
}

interface ResolvedTheme {
  // ... existing fields
  buttonRadius: 'sharp' | 'rounded' | 'pill';
}
```

#### 2. Update Defaults
```typescript
export const TEMPLATE_DEFAULTS = {
  gallery: { buttonRadius: 'rounded', ... },
  detail: { buttonRadius: 'sharp', ... },
  minimal: { buttonRadius: 'pill', ... },
};
```

#### 3. Update Resolver
```typescript
// types/theme.ts - resolveTheme()
return {
  // ... existing
  buttonRadius: overrides.buttonRadius ?? defaults.buttonRadius,
};
```

#### 4. Update Zod Schema
```typescript
// lib/schemas/theme.ts
const themeOverridesSchema = z.object({
  // ... existing
  buttonRadius: z.enum(['sharp', 'rounded', 'pill']).optional(),
});
```

#### 5. Update ThemeProvider
```tsx
// components/theme/ThemeProvider.tsx
const cssVars = `
  --button-radius: ${radiusMap[theme.buttonRadius]};
`;
```

#### 6. Update Admin UI
```tsx
// components/admin/ThemeFieldsEditor.tsx
<Select {...form.register('buttonRadius')}>
  <option value="sharp">Sharp (0px)</option>
  <option value="rounded">Rounded (8px)</option>
  <option value="pill">Pill (999px)</option>
</Select>
```

#### 7. DB Migration (add to validation trigger)
```sql
-- db/supabase/migrations/XXX_add_button_radius.sql
CREATE OR REPLACE FUNCTION validate_theme_overrides()
  -- Update validation to check buttonRadius enum
```

---

## Testing

### Unit Tests
```bash
# Component tests (if using Vitest/Jest)
npm run test:unit
```

### E2E Tests
```bash
# Template switching happy path
npx playwright test template-switching-happy-path

# Visual regression (screenshots)
npx playwright test --update-snapshots
```

**Test IDs:** All components use `data-testid` convention
- `product-card-{variant}`
- `product-grid-{template}`
- `theme-{field}-{action}`

**Page Objects:** `/tests/e2e/pages/theme-editor.page.ts`, `storefront.page.ts`

---

## Performance Considerations

### CSS Variable Injection
- Injected once at root level (no re-renders)
- Changes require page reload (admin saves → user visits storefront)

### Image Optimization
- Use Next.js `<Image>` component (lazy load, blur placeholder)
- Responsive srcsets generated automatically
- Aspect ratio prevents CLS (Cumulative Layout Shift)

### Grid Virtualization
- Consider `react-window` or `react-virtualization` for grids >100 products
- Current implementation handles ~50 products efficiently

---

## Troubleshooting

### CSS vars not applying
- Check ThemeProvider wraps component tree
- Verify `useTheme()` called inside provider
- Inspect `<style>` tag in DOM (dev tools)

### Type errors after schema change
- Regenerate Supabase types: `npm run db:types`
- Restart TypeScript server in IDE

### Validation errors on save
- Check Zod schema matches DB trigger validation
- Log validation errors in API route for debugging

### Preview not updating
- Verify debounce (300ms) completed
- Check browser console for errors
- Ensure ThemeProvider receives new theme prop

---

## File Structure Reference

```
/Users/gpublica/workspace/skywalking/projects/micelio.skyw.app/
├── types/
│   └── theme.ts                          # Core types + resolveTheme()
├── lib/
│   └── schemas/theme.ts                  # Zod validation schemas
├── components/
│   ├── theme/
│   │   ├── ThemeProvider.tsx             # CSS var injection
│   │   └── use-theme.ts                  # Hook for consuming theme
│   ├── storefront/
│   │   ├── GalleryCard.tsx               # Gallery variant
│   │   ├── DetailCard.tsx                # Detail variant
│   │   ├── MinimalCard.tsx               # Minimal variant
│   │   └── ProductGrid.tsx               # Grid with variant selection
│   └── admin/
│       ├── ThemeEditorClient.tsx         # Admin orchestrator
│       ├── TemplateSelector.tsx          # Template picker
│       ├── ThemeFieldsEditor.tsx         # Override fields
│       └── ThemePreview.tsx              # Live preview
├── app/
│   ├── [tenant]/
│   │   ├── layout.tsx                    # ThemeProvider integration
│   │   └── dashboard/settings/appearance/
│   │       └── page.tsx                  # Admin settings page
│   └── api/tenants/[slug]/theme/
│       └── route.ts                      # GET/PATCH endpoints
├── db/
│   ├── supabase/migrations/
│   └── 015_add_tenant_template_theme.sql # Schema + validation
├── tests/e2e/
│   ├── specs/template-switching-happy-path.spec.ts
│   ├── pages/
│   │   ├── theme-editor.page.ts          # Admin page object
│   │   └── storefront.page.ts            # Storefront page object
│   └── locators/theme.locators.ts        # Centralized testids
└── docs/
    ├── templates/
    │   ├── DESIGN_SPEC.md                # Aurora design rationale
    │   ├── USER_GUIDE.md                 # End-user documentation
    │   └── DEV_GUIDE.md                  # This file
    ├── PIXEL_THEME_INTEGRATION.md        # Pixel implementation notes
    └── KOKORO_TEMPLATES.md               # Backend task breakdown
```

---

## Resources

- **Toon Format Spec:** https://github.com/toon-format/toon
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Image:** https://nextjs.org/docs/api-reference/next/image
- **Playwright:** https://playwright.dev

---

**Questions?** Check implementation docs in `/docs/` or contact the Mentat architect.
