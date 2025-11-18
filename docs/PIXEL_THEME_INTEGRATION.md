# ThemeProvider Integration Guide for Pixel

**Created:** 2025-11-16
**Migration:** `015_add_tenant_template_theme.sql`
**Issue:** #2 (Tenant Template Configuration Schema)

---

## Overview

Backend schema now supports 3 template types + JSONB theme overrides.
Pixel must build ThemeProvider to consume this data and apply to storefront.

---

## Database Schema

### New Columns (tenants table)

```sql
template         VARCHAR(50)  NOT NULL  DEFAULT 'gallery'
                 CHECK (template IN ('gallery', 'detail', 'minimal'))

theme_overrides  JSONB        NOT NULL  DEFAULT '{}'
```

### Template Types

| Template   | Use Case            | Grid | Aspect | Card      | Spacing  |
|------------|---------------------|------|--------|-----------|----------|
| `gallery`  | Fashion, retail     | 3    | 1:1    | elevated  | normal   |
| `detail`   | Product focus       | 2    | 16:9   | outlined  | relaxed  |
| `minimal`  | Clean, modern       | 4    | 4:3    | flat      | compact  |

---

## JSONB Structure (theme_overrides)

All fields **optional** → partial overrides allowed.

```typescript
{
  gridCols?: number            // 1-6 (default per template)
  imageAspect?: string         // "W:H" (e.g., "1:1", "16:9")
  cardVariant?: string         // "flat" | "elevated" | "outlined"
  spacing?: string             // "compact" | "normal" | "relaxed"
  colors?: {
    primary?: string           // Hex "#RRGGBB"
    accent?: string            // Hex "#RRGGBB"
  }
}
```

### Validation (PL/pgSQL trigger)

- `gridCols`: 1-6 integer
- `imageAspect`: regex `^\d+:\d+$`
- `cardVariant`: enum check
- `spacing`: enum check
- `colors.primary/accent`: regex `^#[0-9A-Fa-f]{6}$`

**Invalid data rejected at DB level** → no need for runtime validation in ThemeProvider (trust the DB).

---

## TypeScript Types (Available Now)

Import from `/types/commerce.ts` or `/types/theme.ts`:

```typescript
import {
  TenantTemplate,
  ThemeOverrides,
  ResolvedTheme,
  resolveTheme,
  TEMPLATE_DEFAULTS,
} from '@/types/commerce'
```

### Key Types

```typescript
type TenantTemplate = 'gallery' | 'detail' | 'minimal'

interface ThemeOverrides {
  gridCols?: number
  imageAspect?: string
  cardVariant?: 'flat' | 'elevated' | 'outlined'
  spacing?: 'compact' | 'normal' | 'relaxed'
  colors?: {
    primary?: string
    accent?: string
  }
}

interface ResolvedTheme {
  template: TenantTemplate
  gridCols: number
  imageAspect: string
  cardVariant: 'flat' | 'elevated' | 'outlined'
  spacing: 'compact' | 'normal' | 'relaxed'
  colors: {
    primary: string
    accent: string
    background?: string
    surface?: string
    textPrimary?: string
    textSecondary?: string
  }
}
```

---

## Helper Function: resolveTheme()

**Purpose:** Merge template defaults + theme_overrides + config.colors → final theme.

**Signature:**

```typescript
function resolveTheme(
  template: TenantTemplate,
  themeOverrides?: ThemeOverrides,
  configColors?: Record<string, string>
): ResolvedTheme
```

**Example Usage:**

```typescript
// In API route or server component fetching tenant data
const tenant = await supabase
  .from('tenants')
  .select('template, theme_overrides, config')
  .eq('slug', slug)
  .single()

const resolvedTheme = resolveTheme(
  tenant.template,
  tenant.theme_overrides,
  tenant.config?.colors
)

// resolvedTheme now has all values resolved (no undefined)
console.log(resolvedTheme.gridCols)       // 3 (from template or override)
console.log(resolvedTheme.colors.primary) // "#3B82F6" (from override or config or default)
```

---

## Integration Tasks for Pixel

### 1. Fetch theme data in tenant config endpoint

Update `/api/tenant/[slug]/config/route.ts`:

```typescript
// Current response (already has config object)
// Add template + theme_overrides to response

const { data: tenant } = await supabase
  .from('tenants')
  .select('slug, name, config, template, theme_overrides')
  .eq('slug', slug)
  .single()

return NextResponse.json({
  ...tenant,
  theme: resolveTheme(
    tenant.template,
    tenant.theme_overrides,
    tenant.config?.colors
  ),
})
```

### 2. Create ThemeProvider context

File: `/components/theme/ThemeProvider.tsx`

```typescript
'use client'

import { createContext, useContext, ReactNode } from 'react'
import type { ResolvedTheme } from '@/types/commerce'

const ThemeContext = createContext<ResolvedTheme | null>(null)

export function ThemeProvider({
  theme,
  children,
}: {
  theme: ResolvedTheme
  children: ReactNode
}) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const theme = useContext(ThemeContext)
  if (!theme) throw new Error('useTheme must be used within ThemeProvider')
  return theme
}
```

### 3. Wrap storefront layout with ThemeProvider

File: `/app/[slug]/layout.tsx`

```typescript
import { ThemeProvider } from '@/components/theme/ThemeProvider'

export default async function TenantLayout({ params }) {
  const res = await fetch(`/api/tenant/${params.slug}/config`)
  const { theme } = await res.json()

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}
```

### 4. Consume theme in product grid

File: `/components/ProductGrid.tsx`

```typescript
'use client'

import { useTheme } from '@/components/theme/ThemeProvider'

export function ProductGrid({ products }: { products: Product[] }) {
  const theme = useTheme()

  return (
    <div
      className={`grid gap-${theme.spacing === 'compact' ? '2' : theme.spacing === 'normal' ? '4' : '6'}`}
      style={{
        gridTemplateColumns: `repeat(${theme.gridCols}, minmax(0, 1fr))`,
      }}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={theme.cardVariant}
          aspectRatio={theme.imageAspect}
          colors={theme.colors}
        />
      ))}
    </div>
  )
}
```

### 5. Apply colors via CSS variables

Option 1: Inline styles (quick win):

```typescript
<div
  style={{
    '--color-primary': theme.colors.primary,
    '--color-accent': theme.colors.accent,
  } as React.CSSProperties}
>
  {/* Components can now use var(--color-primary) */}
</div>
```

Option 2: Tailwind plugin (recommended for production):

```typescript
// tailwind.config.ts
import { ResolvedTheme } from '@/types/commerce'

export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
      },
    },
  },
}
```

---

## Seed Data (Available for Testing)

Migration `015` creates 3 demo tenants:

| Slug           | Template  | gridCols | imageAspect | cardVariant | primary   | accent    |
|----------------|-----------|----------|-------------|-------------|-----------|-----------|
| `demo`         | gallery   | 3        | 1:1         | elevated    | #3B82F6   | #F59E0B   |
| `superhotdog`  | detail    | 2        | 16:9        | outlined    | #dc2626   | #fbbf24   |
| `minimal-demo` | minimal   | 4        | 4:3         | flat        | #000000   | #ffffff   |

Test by visiting:
- `http://localhost:3000/demo`
- `http://localhost:3000/superhotdog`
- `http://localhost:3000/minimal-demo`

Each should render with different grid/card styles.

---

## Performance Notes

- `resolveTheme()` runs once per page load (server-side).
- Theme data cached in ThemeProvider context (no re-fetches).
- No client-side validation needed (DB enforces constraints).

---

## Next Steps for Pixel

1. **Run migration:** `npx supabase db push` (or equivalent)
2. **Update API route:** Add `template` + `theme_overrides` to tenant config response
3. **Build ThemeProvider:** Context + hook
4. **Apply to ProductGrid:** Use `gridCols`, `cardVariant`, `spacing`
5. **Test with 3 demo tenants:** Verify visual differences

---

## Questions / Blockers?

Ping Kokoro if:
- Need additional JSONB fields (e.g., `buttonStyle`, `fontFamily`)
- Validation logic too strict (need relaxed constraints)
- Migration fails (rollback plan: drop columns + trigger)

**Schema stable. Ship ThemeProvider now.**
