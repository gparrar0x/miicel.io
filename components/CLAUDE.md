# components/CLAUDE.md

> UI component conventions
> Updated: 2026-04-01

---

## Organization

Domain-based with shared `ui/` layer:

```
components/
├── ui/              # shadcn/ui base (Button, Card, Dialog, Sheet...)
├── admin/           # Tenant management, theme editor
├── analytics/       # Analytics dashboard
├── auth/            # Auth flows
├── commerce/        # Product catalog, cart (flat)
├── dashboard/       # Admin dashboard (subfolders by feature)
├── gallery-v2/      # Gallery template
├── gastronomy/      # Restaurant template (ATOMIC DESIGN)
│   ├── atoms/       # DiscountBadge, QuickAddButton, FoodBadge
│   ├── molecules/   # ProductCardGastronomy, CartSummary
│   ├── organisms/   # ProductGridGastronomy, CartSheet
│   └── layouts/     # GastronomyLayout
├── storefront/      # Multi-template card variants (flat)
├── theme/           # ThemeProvider + hooks
└── [root files]     # CheckoutModal, ProductForm, etc.
```

Only `gastronomy/` uses atomic design. Other domains are flat.

## data-testid Convention

Pattern: `{context}-{descriptor}` or `{context}-{id}-{action}`

```
product-card
product-${productId}-add-to-cart
quick-add-${productId}
category-tab-${slug}
product-card-original-price
product-card-discounted-price
```

**Mandatory** on all interactive elements. Tests rely on these — see `docs/TEST_ID_CONTRACT.md`.

## Theme Tokens

**Never hardcode colors.** Use CSS variables from `styles/tokens.css`:

| Wrong | Right |
|-------|-------|
| `bg-white` | `bg-[var(--color-bg-primary)]` |
| `text-black` | `text-[var(--color-text-primary)]` |
| `text-gray-500` | `text-[var(--color-text-secondary)]` |
| `border-gray-200` | `border-[var(--color-border-subtle)]` |
| `bg-blue-600` | `bg-[var(--btn-primary-bg)]` |

**Always include fallbacks**: `var(--color-primary, #3B82F6)`

Tenant-specific vars (`--color-primary`, `--color-accent`) injected via ThemeProvider.

## Component Patterns

- **Naming**: PascalCase, domain prefix to avoid collisions (`ProductCardGastronomy` not `ProductCard`)
- **Props**: Interface defined above component, destructured in signature
- **Conditional classes**: Use `cn()` from `@/lib/utils`
- **Hydration safety**: Use `mounted` state for Zustand stores in SSR
  ```tsx
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const totalItems = mounted ? getTotalItems() : 0
  ```
- **Loading**: Early return with `animate-pulse` skeleton
- **Barrel exports**: Domain folders use `index.ts` for clean imports
- **JSDoc headers**: Include test ID, states, issue reference

## Composition

Domain components import from `@/components/ui/` and add business logic:
```tsx
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

## Price Formatting

Centralized via `formatCurrency()` from `@/lib/pricing`:
```tsx
import { formatCurrency } from '@/lib/pricing'
formatCurrency(price, currency) // cached Intl.NumberFormat, es-AR locale
```

## CSS Techniques

- `color-mix()` for computed dark variants: `color-mix(in srgb, var(--color-primary) 85%, black)`
- `var(--image-aspect)` for tenant-customizable aspect ratios
- `var(--grid-cols)` for responsive grid layout
