# Tenant List Landing - Design Spec

**Task:** SKY-41
**Owner:** Aurora
**Updated:** 2025-01-16

---

## Context
Root landing (`/`) displays tenant cards w/ logo, name, 2 CTAs.
**User:** Multi-tenant platform visitors choosing store.
**Promise:** Fast selection, clear navigation.
**KPI:** Click-through ↑, bounce ↓.

---

## Visual Direction

**Chosen:** Minimal clean cards, centered grid, consistent spacing.

**Rationale:**
- Users need fast scan → card-based layout wins
- Logo prominence → trust signal
- 2-CTA clarity → reduces decision friction
- Minimal aesthetic → scales across tenant brands

**Target:** CTR ↑25%, avg. decision time <5s.

---

## Design Tokens

### Color Palette
```css
:root {
  /* Base */
  --bg-page: #F8F8F8;
  --bg-card: #FFFFFF;

  /* Text */
  --text-primary: #1A1A1A;
  --text-secondary: #666666;

  /* Borders */
  --border-default: #E5E5E5;
  --border-hover: #CCCCCC;

  /* CTAs */
  --cta-store: #FF6B35;      /* Store link - primary action */
  --cta-store-hover: #E5602F;
  --cta-dashboard: #2C3E50;  /* Dashboard - secondary */
  --cta-dashboard-hover: #1E2B3A;

  /* States */
  --shadow-card: rgba(0,0,0,0.08);
  --shadow-hover: rgba(0,0,0,0.12);
}
```

### Typography Scale
| Token | Mobile | Desktop | Weight | Line-H | Usage |
|-------|--------|---------|--------|--------|-------|
| heading-page | 24px | 28px | 700 | 1.2 | Page title |
| heading-card | 18px | 20px | 600 | 1.3 | Tenant name |
| body-base | 14px | 16px | 400 | 1.5 | Labels, empty states |
| body-sm | 12px | 14px | 400 | 1.4 | Metadata |

### Spacing Grid (8px base)
```
8px  → gap-2  (card internal)
12px → gap-3  (grid gaps mobile)
16px → gap-4  (grid gaps desktop, card padding)
20px → space-5 (page margins)
24px → space-6 (section spacing)
32px → space-8 (page top/bottom)
```

### Breakpoints
```
sm: 375px   /* mobile */
md: 768px   /* tablet */
lg: 1024px  /* desktop */
max: 1200px /* container max-width */
```

---

## Layout Structure

### Page Layout
```
┌─────────────────────────────────────────────┐
│                                             │
│   Tenant Directory          [page header]   │
│                                             │
│   ┌────────┐  ┌────────┐  ┌────────┐       │
│   │  Logo  │  │  Logo  │  │  Logo  │       │
│   │  Name  │  │  Name  │  │  Name  │       │
│   │[Store] │  │[Store] │  │[Store] │       │
│   │[Dash]  │  │[Dash]  │  │[Dash]  │       │
│   └────────┘  └────────┘  └────────┘       │
│                                             │
│   ┌────────┐  ┌────────┐  ┌────────┐       │
│   │  ...   │  │  ...   │  │  ...   │       │
│   └────────┘  └────────┘  └────────┘       │
│                                             │
└─────────────────────────────────────────────┘
```

### Grid Configuration
**Mobile (≤767px):**
- Columns: 2
- Gap: 12px
- Card min-width: 150px

**Tablet (768-1023px):**
- Columns: 3
- Gap: 16px
- Card min-width: 200px

**Desktop (≥1024px):**
- Columns: 4
- Gap: 16px
- Card max-width: 280px
- Container max: 1200px centered

**Tailwind:**
```jsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
```

---

## Card Anatomy

### Component Breakdown
```
┌──────────────────────┐
│                      │
│      ⭕ Logo         │  ← 80px circle, centered
│                      │
│    Tenant Name       │  ← heading-card, centered, truncate
│                      │
│  ┌────────────────┐  │
│  │  Visit Store   │  │  ← Primary CTA
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │   Dashboard    │  │  ← Secondary CTA
│  └────────────────┘  │
│                      │
└──────────────────────┘
```

### Card Specs
- **Container:**
  - Background: `var(--bg-card)`
  - Border: `1px solid var(--border-default)`
  - Border-radius: `12px`
  - Padding: `16px`
  - Shadow default: `0 2px 8px var(--shadow-card)`
  - Shadow hover: `0 4px 16px var(--shadow-hover)`
  - Transition: `all 150ms ease`

- **Logo:**
  - Size: `80px × 80px`
  - Border-radius: `50%` (circle)
  - Object-fit: `cover`
  - Border: `2px solid var(--border-default)`
  - Margin: `0 auto 12px` (center, space below)
  - Fallback: Initials on `--border-default` bg, 24px font

- **Tenant Name:**
  - Font: `heading-card`
  - Color: `var(--text-primary)`
  - Text-align: `center`
  - Max-width: `100%`
  - Truncate: `overflow-hidden text-ellipsis whitespace-nowrap`
  - Margin-bottom: `16px`

- **CTA Buttons:**
  - Width: `100%`
  - Height: `40px`
  - Border-radius: `8px`
  - Font: `body-base`, `font-semibold`
  - Gap between: `8px`
  - Cursor: `pointer`
  - Hover: slight opacity shift (0.9)
  - Active: `scale-[0.98]`

### CTA Variants

**Store Button (Primary):**
```css
background: var(--cta-store);
color: white;
border: none;
```
Hover: `background: var(--cta-store-hover)`

**Dashboard Button (Secondary):**
```css
background: transparent;
color: var(--cta-dashboard);
border: 2px solid var(--cta-dashboard);
```
Hover: `background: var(--cta-dashboard)`, `color: white`

---

## State Variations

### Loading State
**Display:** Card skeletons, shimmer animation.

**Skeleton Card:**
```
┌──────────────────────┐
│                      │
│    [grey circle]     │  ← 80px pulse
│                      │
│  ████████████████    │  ← Name placeholder
│                      │
│  ████████████████    │  ← Button placeholder
│  ████████████████    │
│                      │
└──────────────────────┘
```

**Specs:**
- Same card dimensions
- Backgrounds: `#E5E5E5` → `#F5F5F5` pulse (1.5s loop)
- Show 6-8 skeleton cards
- `data-testid="tenant-list-loading"`

**Animation:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Empty State
**Display:** Centered message, no cards.

**Specs:**
```
┌─────────────────────────────────────┐
│                                     │
│         🏪                          │  ← 64px icon
│                                     │
│    No Tenants Available             │  ← heading-page
│    Check back soon or contact       │  ← body-base, text-secondary
│    support to add your store.       │
│                                     │
└─────────────────────────────────────┘
```

- Icon size: `64px`, color: `var(--text-secondary)`, centered
- Text max-width: `400px`, centered
- Padding: `64px 24px`
- `data-testid="tenant-list-empty"`

### Error State
**Display:** Centered error message, retry button.

**Specs:**
```
┌─────────────────────────────────────┐
│                                     │
│         ⚠️                          │  ← 64px icon
│                                     │
│    Failed to Load Tenants           │  ← heading-page
│    Please try again                 │  ← body-base
│                                     │
│    ┌──────────────┐                 │
│    │    Retry     │                 │  ← Primary CTA style
│    └──────────────┘                 │
│                                     │
└─────────────────────────────────────┘
```

- Layout: Same as empty state
- Retry button: Primary CTA style, max-width `200px`, centered
- `data-testid="tenant-list-error"`

---

## HTML Structure (Pixel Implementation)

### Full Page Component
```jsx
<main className="min-h-screen bg-[var(--bg-page)] px-5 py-8 md:py-12">
  {/* Page Header */}
  <header className="max-w-[1200px] mx-auto mb-8">
    <h1 className="text-[24px] md:text-[28px] font-bold text-[var(--text-primary)] text-center">
      Tenant Directory
    </h1>
  </header>

  {/* Card Grid */}
  <div
    className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
    data-testid="tenant-list-container"
  >
    {tenants.map(tenant => (
      <TenantCard key={tenant.slug} tenant={tenant} />
    ))}
  </div>
</main>
```

### Tenant Card Component
```jsx
<article
  className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 shadow-[0_2px_8px_var(--shadow-card)] hover:shadow-[0_4px_16px_var(--shadow-hover)] transition-all duration-150"
  data-testid={`tenant-card-${tenant.slug}`}
>
  {/* Logo */}
  <div className="flex justify-center mb-3">
    {tenant.logo_url ? (
      <img
        src={tenant.logo_url}
        alt={`${tenant.business_name} logo`}
        className="w-20 h-20 rounded-full object-cover border-2 border-[var(--border-default)]"
        data-testid={`tenant-logo-${tenant.slug}`}
      />
    ) : (
      <div
        className="w-20 h-20 rounded-full bg-[var(--border-default)] flex items-center justify-center text-[24px] font-bold text-[var(--text-secondary)]"
        data-testid={`tenant-logo-${tenant.slug}`}
      >
        {getInitials(tenant.business_name)}
      </div>
    )}
  </div>

  {/* Tenant Name */}
  <h2
    className="text-[18px] md:text-[20px] font-semibold text-[var(--text-primary)] text-center mb-4 overflow-hidden text-ellipsis whitespace-nowrap"
    data-testid={`tenant-name-${tenant.slug}`}
  >
    {tenant.business_name}
  </h2>

  {/* CTAs */}
  <div className="space-y-2">
    {/* Store Link */}
    <Link
      href={`/${tenant.slug}/`}
      className="block w-full h-10 bg-[var(--cta-store)] text-white text-[14px] md:text-[16px] font-semibold rounded-lg flex items-center justify-center hover:bg-[var(--cta-store-hover)] active:scale-[0.98] transition-all duration-150"
      data-testid={`tenant-store-link-${tenant.slug}`}
    >
      Visit Store
    </Link>

    {/* Dashboard Link */}
    <Link
      href={`/${tenant.slug}/dashboard`}
      className="block w-full h-10 bg-transparent text-[var(--cta-dashboard)] text-[14px] md:text-[16px] font-semibold border-2 border-[var(--cta-dashboard)] rounded-lg flex items-center justify-center hover:bg-[var(--cta-dashboard)] hover:text-white active:scale-[0.98] transition-all duration-150"
      data-testid={`tenant-dashboard-link-${tenant.slug}`}
    >
      Dashboard
    </Link>
  </div>
</article>
```

### Loading State Component
```jsx
<div
  className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
  data-testid="tenant-list-loading"
>
  {Array.from({ length: 8 }).map((_, i) => (
    <div
      key={i}
      className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 animate-pulse"
    >
      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3"></div>
      <div className="h-5 bg-gray-200 rounded mb-4"></div>
      <div className="h-10 bg-gray-200 rounded mb-2"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  ))}
</div>
```

### Empty State Component
```jsx
<div
  className="max-w-[400px] mx-auto text-center py-16"
  data-testid="tenant-list-empty"
>
  <div className="text-[64px] mb-4">🏪</div>
  <h2 className="text-[24px] md:text-[28px] font-bold text-[var(--text-primary)] mb-2">
    No Tenants Available
  </h2>
  <p className="text-[14px] md:text-[16px] text-[var(--text-secondary)]">
    Check back soon or contact support to add your store.
  </p>
</div>
```

### Error State Component
```jsx
<div
  className="max-w-[400px] mx-auto text-center py-16"
  data-testid="tenant-list-error"
>
  <div className="text-[64px] mb-4">⚠️</div>
  <h2 className="text-[24px] md:text-[28px] font-bold text-[var(--text-primary)] mb-2">
    Failed to Load Tenants
  </h2>
  <p className="text-[14px] md:text-[16px] text-[var(--text-secondary)] mb-6">
    Please try again
  </p>
  <button
    onClick={handleRetry}
    className="w-[200px] h-12 bg-[var(--cta-store)] text-white text-[14px] md:text-[16px] font-semibold rounded-lg hover:bg-[var(--cta-store-hover)] active:scale-[0.98] transition-all duration-150"
  >
    Retry
  </button>
</div>
```

---

## Responsive Behavior

### Mobile (375-767px)
- 2 columns, 12px gap
- Card padding: 16px
- Logo: 80px
- Font sizes: mobile tokens
- Screen padding: 20px

### Tablet (768-1023px)
- 3 columns, 16px gap
- Card padding: 16px
- Logo: 80px
- Font sizes: desktop tokens
- Screen padding: 24px

### Desktop (≥1024px)
- 4 columns, 16px gap
- Card padding: 16px
- Logo: 80px
- Font sizes: desktop tokens
- Max container: 1200px, centered

### Touch Targets
- All buttons ≥40px height
- Card clickable area ≥48px zones
- Spacing prevents mis-taps

---

## Accessibility Notes

### Contrast
- Text-primary on bg-card: ≥7:1
- Text-secondary on bg-card: ≥4.5:1
- CTA text on colored bg: ≥4.5:1
- Border vs bg: ≥3:1

### Keyboard Navigation
- Tab order: logo → name → store link → dashboard link → next card
- Focus visible: 2px solid ring, primary color
- Enter/Space activates links

### Screen Readers
- Logo alt text: "{business_name} logo" or decorative if no meaning
- Card: `<article>` semantic
- Headings: H1 page title, H2 tenant names
- Links: Clear labels ("Visit Store", not "Click here")
- Loading state: `aria-live="polite"` region
- Error state: `role="alert"`

### Focus Ring Pattern
```css
.focus-visible:focus {
  outline: none;
  ring: 2px solid var(--cta-store);
  ring-offset: 2px;
}
```

### Motion
Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Test ID Contract (Sentinela)

All interactive + key elements:

| Element | Test ID Format | Usage |
|---------|----------------|-------|
| Container | `tenant-list-container` | Grid wrapper |
| Card | `tenant-card-{slug}` | Individual card |
| Logo | `tenant-logo-{slug}` | Logo/fallback |
| Name | `tenant-name-{slug}` | Business name |
| Store Link | `tenant-store-link-{slug}` | Store CTA |
| Dashboard Link | `tenant-dashboard-link-{slug}` | Dashboard CTA |
| Loading | `tenant-list-loading` | Loading state |
| Empty | `tenant-list-empty` | Empty state |
| Error | `tenant-list-error` | Error state |

**E2E selectors:** Use `data-testid` exclusively. No CSS class or tag selectors.

---

## Handoff

### Pixel Implementation
- **File:** `/app/page.tsx` (client component)
- **Components:** Create `<TenantCard />`, `<LoadingState />`, `<EmptyState />`, `<ErrorState />`
- **State:** `useState` for loading/error/data, `useEffect` for fetch
- **API:** `GET /api/tenants/list` returns `{ tenants: [{ slug, business_name, logo_url }] }`
- **Routing:** Use Next.js `Link` component
- **Images:** Use `<img>` or `next/image` with fallback handling
- **CSS:** Inline CSS vars or Tailwind with custom colors config
- **Test IDs:** All as specified above

### Sentinela Testing
- E2E: Click links, verify navigation
- States: Mock API for loading/empty/error
- Responsive: Test 375px, 768px, 1024px viewports
- A11y: Keyboard nav, screen reader labels

### Kokoro Dependencies
- API endpoint `/api/tenants/list` must return:
  ```json
  {
    "tenants": [
      {
        "slug": "store-alpha",
        "business_name": "Store Alpha",
        "logo_url": "https://example.com/logo.png" // nullable
      }
    ]
  }
  ```

---

## Next Steps

1. **Pixel:** Implement page + states → mark SKY-41 Pixel tasks done
2. **Sentinela:** Write E2E tests after implementation
3. **Aurora (me):** Visual QA review after deploy

---

## Questions for Mentat

- Logo max file size? (suggest <100KB)
- Fallback initials logic? (first 2 chars uppercase?)
- Max tenants per page? (pagination needed if >50?)
- Analytics tracking? (GTM tags on CTA clicks?)

---

**Status:** Ready for Pixel implementation.
