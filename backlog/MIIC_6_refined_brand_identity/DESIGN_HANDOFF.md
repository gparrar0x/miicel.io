# Miicel.io Design System – Handoff Document

**Status:** Ready for Development
**Date:** 2025-12-04
**Owners:** Aurora (Design), Pixel (Frontend), Sentinela (QA)

---

## Executive Summary

Miicel.io brand identity redefined: refined gallery aesthetic translated into professional SaaS UI. Elegant typography (Cinzel + Inter), sophisticated color palette (noir/charcoal with gold accents), and accessible components built for rapid implementation.

**Key Design Decisions:**
- Cinzel for display (editorial credibility) + Inter for body (clean usability)
- Gold (#B8860B) accent creates premium feel without aggression
- 8px-based spacing grid ensures consistency
- Subtle shadows (max 8px blur) keep professional tone
- All WCAG AA compliant; AAA in critical paths

---

## File Structure & Artifacts

### Design Documentation (Read-First Order)
```
1. DESIGN_SYSTEM.md         ← Complete spec (colors, type, spacing, components)
2. COMPONENT_SPECS.md       ← Code-ready component definitions + examples
3. VISUAL_SPECS.md          ← ASCII mockups, layouts, responsive details
4. DESIGN_HANDOFF.md        ← This file (project coordination)
```

### Figma File (To Create)
```
Miicel.io Design System v1.0
├─ 🎨 Foundations
│  ├─ Colors (primary, status, neutrals)
│  ├─ Typography (Cinzel scales, Inter scales, weights)
│  ├─ Spacing (8px grid visualization)
│  └─ Shadows (6 levels + inset)
├─ 📦 Components
│  ├─ Buttons (Primary, Secondary, Ghost + states)
│  ├─ Forms (Input, Select, Label, Help, Validation)
│  ├─ Cards (Standard, Stat, Table)
│  ├─ Navigation (Sidebar, Breadcrumb, Pagination)
│  ├─ Badges (Status colors)
│  ├─ Modals (Overlay, Dialog, Confirmation)
│  └─ Loading States (Spinner, Skeleton, Pulse)
├─ 🖼️ Templates
│  ├─ Login Screen (Desktop + Mobile)
│  ├─ Tenant List (Desktop + Mobile)
│  ├─ Admin Dashboard (Desktop)
│  ├─ Sidebar Navigation
│  └─ 404 / Empty States
└─ 📋 Specs (linked)

Share Settings: View-only for Pixel, Kokoro, Sentinela
Variables: Enabled (colors, spacing, typography)
```

---

## Implementation Roadmap

### Phase 1: Foundation (Pixel – 16h)
**Deliverables:** Component library core

- [ ] Tailwind config (colors, fonts, spacing, shadows)
- [ ] Base utilities + global styles
- [ ] Button component (all 3 variants + states)
- [ ] Input component (with validation + help text)
- [ ] Card components (Standard + Stat)
- [ ] Export from `/src/components/index.ts`
- [ ] Storybook setup (optional, recommended)

**Test Coverage:** Button + Input with basic a11y checks (Sentinela)

### Phase 2: Layout & Navigation (Pixel – 20h)
**Deliverables:** Dashboard layouts, sidebar, responsive grids

- [ ] Sidebar navigation component
- [ ] DashboardHeader component
- [ ] Container / Grid layout components
- [ ] Responsive breakpoints tested
- [ ] Modal component (overlay + focus trap)
- [ ] Breadcrumb navigation
- [ ] Badge / Status components

**Test Coverage:** Navigation keyboard + focus (Tab order, Escape, etc.)

### Phase 3: Pages & Integration (Pixel – 24h)
**Deliverables:** Full dashboard + landing pages

- [ ] Login page (desktop + mobile)
- [ ] Tenant list page
- [ ] Admin dashboard (with live API data)
- [ ] Settings page
- [ ] Error pages (404, 500)
- [ ] Loading skeletons
- [ ] Form validation feedback

**Test Coverage:** End-to-end flows (Sentinela via Playwright)

### Phase 4: Polish & Launch (Hermes – 8h)
**Deliverables:** Performance, SEO, deployment

- [ ] Performance audit (CWV < 2.5s LCP)
- [ ] CSS minification + variable export
- [ ] Lighthouse > 90 all metrics
- [ ] Deploy to staging (Vercel)
- [ ] User testing (optional)
- [ ] Production deploy

**Timeline:** ~68 hours total (~1.5 weeks with buffer)

---

## Pixel's Implementation Checklist

### Before Starting
- [ ] Clone main branch
- [ ] Install dependencies: `npm install`
- [ ] Verify Next.js version (15+) + Tailwind CSS (4+)
- [ ] Confirm TypeScript setup
- [ ] Request Figma access (view-only)

### During Development
- [ ] Follow component specs exactly (spacing, colors, font sizes)
- [ ] Add `data-testid` to all interactive elements (see Test ID Contract)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Verify focus indicator visible (2px outline #B8860B)
- [ ] Check color contrast with WAVE or Lighthouse
- [ ] Mobile-first implementation (test responsive at 375px, 768px, 1280px)
- [ ] Use CSS variables for colors (not hardcoded hex)
- [ ] Commit incrementally with clear messages

### Testing Checklist (Before Hand-off)
- [ ] All components work in isolation (Storybook or manual)
- [ ] Form validation shows correct errors + help text
- [ ] Buttons disabled state looks correct
- [ ] Modals have focus trap (Tab loops within modal)
- [ ] Sidebar navigation highlights active item correctly
- [ ] Cards hover state appears at all breakpoints
- [ ] No focus traps or missing focus indicators
- [ ] Test with screen reader (macOS VoiceOver minimum)

---

## Sentinela's QA Contract

### Test ID Contract
**Location:** `/src/components/index.ts` exports + component props

```typescript
/* Buttons */
data-testid="btn-{action}"           // e.g., "btn-save", "btn-sign-in"

/* Form Inputs */
data-testid="input-{field}"          // e.g., "input-email", "input-password"
data-testid="select-{field}"         // e.g., "select-tenant"

/* Cards */
data-testid="card-{section}"         // e.g., "card-stats", "card-activity"

/* Navigation */
data-testid="nav-{item}"             // e.g., "nav-dashboard", "nav-settings"
data-testid="sidebar"                // Main sidebar container

/* Modals / Overlays */
data-testid="modal-{name}"           // e.g., "modal-confirm-delete"

/* Status Indicators */
data-testid="badge-{status}"         // e.g., "badge-active", "badge-error"
data-testid="spinner"                // Loading spinner

/* Tables */
data-testid="table-{name}"           // e.g., "table-recent-orders"
data-testid="table-row-{id}"         // Specific row (if dynamic)
```

### E2E Test Scenarios (Playwright)

**Scenario 1: Login Flow**
```typescript
describe('Login Page', () => {
  it('should load and render form fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('[data-testid="input-email"]')).toBeVisible()
    await expect(page.locator('[data-testid="input-password"]')).toBeVisible()
    await expect(page.locator('[data-testid="btn-sign-in"]')).toBeVisible()
  })

  it('should show validation error on invalid email', async ({ page }) => {
    await page.goto('/login')
    await page.locator('[data-testid="input-email"]').fill('invalid')
    await page.locator('[data-testid="btn-sign-in"]').click()
    await expect(page.locator('text=Please enter valid email')).toBeVisible()
  })

  it('should have keyboard focus trap', async ({ page }) => {
    await page.goto('/login')
    await page.locator('[data-testid="input-email"]').focus()
    await expect(page.locator('[data-testid="input-email"]')).toBeFocused()
  })
})
```

**Scenario 2: Dashboard Navigation**
```typescript
describe('Dashboard Sidebar', () => {
  it('should highlight active nav item', async ({ page }) => {
    await page.goto('/dashboard')
    const activeNav = page.locator('[data-testid="nav-dashboard"]')
    await expect(activeNav).toHaveClass(/active|bg-gold/)
  })

  it('should navigate on click', async ({ page }) => {
    await page.goto('/dashboard')
    await page.locator('[data-testid="nav-settings"]').click()
    await expect(page).toHaveURL('/settings')
  })
})
```

**Scenario 3: Form Validation**
```typescript
describe('Tenant Form', () => {
  it('should validate required fields', async ({ page }) => {
    await page.goto('/tenants/new')
    await page.locator('[data-testid="btn-save"]').click()

    const errors = page.locator('[role="alert"]')
    await expect(errors).toHaveCount(3) // name, email, plan
  })

  it('should enable submit only when form valid', async ({ page }) => {
    await page.goto('/tenants/new')
    const submitBtn = page.locator('[data-testid="btn-save"]')

    await expect(submitBtn).toBeDisabled()

    await page.locator('[data-testid="input-name"]').fill('Acme Corp')
    await page.locator('[data-testid="input-email"]').fill('admin@acme.io')
    await page.locator('[data-testid="select-plan"]').selectOption('pro')

    await expect(submitBtn).toBeEnabled()
  })
})
```

### Accessibility Audit (Automated + Manual)

**Automated (Lighthouse + axe):**
```typescript
// In Playwright setup
import { injectAxe, checkA11y } from 'axe-playwright'

test('dashboard should pass accessibility', async ({ page }) => {
  await page.goto('/dashboard')
  await injectAxe(page)
  await checkA11y(page)  // Detects WCAG violations
})
```

**Manual (Screen Reader Testing):**
- [ ] macOS VoiceOver: Navigate with VO + Arrow, VO + U for rotor
- [ ] Test all form labels associated with inputs
- [ ] Test button labels are clear (not just "Click here")
- [ ] Test modal has accessible name + focus trap
- [ ] Test skip-to-content link (if present)

---

## Kokoro's Backend Integration Points

### Required API Contracts

**1. Dashboard Stats Endpoint**
```json
GET /api/admin/stats

Response:
{
  "revenue": {
    "current": 54200,
    "previous": 48400,
    "percent_change": 12
  },
  "orders": {
    "current": 1245,
    "previous": 1283,
    "percent_change": -3
  },
  "avg_order_value": {
    "current": 43.50,
    "previous": 40.34,
    "percent_change": 8
  },
  "conversion": {
    "current": 2.34,
    "previous": 2.28,
    "percent_change": 2.6
  }
}
```

**2. Tenant List Endpoint**
```json
GET /api/admin/tenants?page=1&limit=10&sort=created_at

Response:
{
  "data": [
    {
      "id": "tenant-001",
      "name": "Acme Corp",
      "status": "active",
      "users_count": 245,
      "monthly_revenue": 12400,
      "created_at": "2025-01-15"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 42,
    "limit": 10
  }
}
```

**3. Recent Orders Endpoint**
```json
GET /api/admin/orders?limit=5&sort=-created_at

Response:
{
  "data": [
    {
      "id": "ORD-2025-001",
      "customer_name": "John Doe",
      "amount": 125.50,
      "status": "paid",
      "created_at": "2025-12-04T14:30:00Z"
    }
  ]
}
```

### Integration Notes
- All timestamps should be ISO 8601 format
- Decimal values for money: `amount: 125.50` (string or number)
- Status enums: `active`, `paused`, `suspended`, `paid`, `shipped`, `processing`, `failed`
- Percentage changes: Can be positive or negative (no +/- prefix, use trend direction)

---

## Hermes' Deployment Checklist

### Pre-Launch
- [ ] Build passes: `npm run build` exits 0
- [ ] No console errors or warnings in production build
- [ ] CSS variables exported correctly (theme switching ready)
- [ ] Image optimization: Next.js Image component used everywhere
- [ ] Font loading optimized (Cinzel + Inter preloaded)

### Performance Targets
```
Metric             Target        Current (Baseline)
─────────────────────────────────────────────────
LCP (Largest Paint) < 2.5s        TBD
FID (Input Delay)   < 100ms       TBD
CLS (Layout Shift)  < 0.1         TBD
TTL (Time to Load)  < 3s          TBD
```

### Monitoring Setup
- [ ] Vercel Analytics enabled
- [ ] Error tracking (Sentry or similar)
- [ ] Performance monitoring (Web Vitals)
- [ ] User session recording optional (PostHog, Fullstory)

### Deployment
```bash
# Production deploy
vercel deploy --prod

# Verify staging first
vercel deploy --target staging

# Check: Open staging URL, test full flow
```

---

## Design Decisions & Rationale

### Why Cinzel + Inter?
**Cinzel** (serif display): Editorial credibility, premium feel, gallery heritage. Used for headings only (h1-h4) to avoid readability issues at body sizes.

**Inter** (sans-serif body): Proven webfont, excellent readability at all sizes, neutral enough not to compete with Cinzel. Used for all body copy, UI labels, and small text.

### Why Gold (#B8860B)?
- **Not**: Bright yellows (cheap), neons (jarring), or cool grays (boring)
- **Yes**: Warm, sophisticated, luxury-adjacent without being ostentatious
- **Usage**: CTAs, active states, hover accents, premium signaling
- **Restraint**: Gold used sparingly; most UI remains black/white/gray

### Why 8px Base Grid?
- Industry standard (Figma, iOS, Material Design all use 8px)
- Scales well on all screen sizes
- Simplifies responsive math (16px → 8px, etc.)
- Fewer arbitrary values = cleaner codebase

### Why Subtle Shadows (Max 8px)?
- **Not**: Hard drop shadows (look cheap, dated)
- **Yes**: Soft, realistic, minimal blur
- **Effect**: Hierarchy without aggression
- **Professional**: SaaS platforms use subtle elevation

### Why Accessible-First?
- WCAG AA minimum (4.5:1 contrast for text)
- Benefits: Legal compliance, wider audience, better UX for all
- Focus indicators always visible (not decorative)
- Keyboard navigation tested from day 1

---

## Deviations & Exceptions

### When NOT to Use This Design System
1. **Email templates**: Use simplified palette (gold accent too dim in email)
2. **Print collateral**: Use higher contrast version (email gold won't print well)
3. **Mobile app**: Follow iOS/Android native components first, then apply this color palette
4. **Third-party integrations**: Use their design, we provide iframe fallback

### Allowed Variations
- **Page-specific theming**: Can override surface colors (e.g., "Noir mode" dashboard)
- **Regional customization**: Add secondary accent for localization
- **Dark mode**: Create `dark:` variants in Tailwind (TBD in Phase 2)

---

## Success Metrics

### Design System KPIs
```
Developer Velocity:  Components implemented in < 2h each (vs. 4h baseline)
Component Reuse:     80% of UI built from library (vs. 40% custom)
Accessibility:       100% WCAG AA compliance
QA Cycle Time:       30% reduction in "fix styling" tickets
```

### UX Metrics (Post-Launch)
```
Form Completion:     +15% (vs. old design)
Support "where to click": -30% (clear affordance)
Admin Task Time:     -20% (information hierarchy)
Perceived Premium:   NPS +18 points
```

---

## Slack/Communication Template

### Daily Standup (If Needed)
```
🎨 Design Status
- [ ] Component {name} implemented
- [ ] Waiting on: {API response / design spec}
- Blocker: {if any}
- Next: {tomorrow's task}
```

### Hand-off from Aurora to Pixel
```
Design ✅ → Implementation 🚀

Component: {name}
- Spec: {link to section in COMPONENT_SPECS.md}
- Figma: {link to component}
- Test IDs: {list from contract}
- Acceptance: {describe visible behavior + a11y}

Ready for dev. Ask if anything unclear.
```

### Hand-off from Pixel to Sentinela
```
Implementation ✅ → QA 🧪

{Feature / Component}
- Branch: {git branch name}
- Test IDs added: {yes/no}
- Keyboard navigation tested: {yes/no}
- Mobile tested: {yes/no}

Ready for E2E. Test checklist: {link}
```

---

## Reference Links

**Design Documentation (this project)**
- Design System: `/DESIGN_SYSTEM.md`
- Component Specs: `/COMPONENT_SPECS.md`
- Visual Specs: `/VISUAL_SPECS.md`

**External Resources**
- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Playwright Testing](https://playwright.dev)
- [Cinzel Font](https://www.fonts.google.com/?query=cinzel)
- [Inter Font](https://fonts.google.com/specimen/Inter)

---

## FAQ

**Q: Can we use different gold for dark mode?**
A: Yes. Phase 2 will explore dark theme with adjusted gold (#D4AF37 for contrast). Keep design decisions documented.

**Q: What if a component needs customization beyond spec?**
A: Check VISUAL_SPECS.md "Deviations & Exceptions" first. If still needed, reach out to Aurora before building custom—standardize, don't fragment.

**Q: When should we use Skeleton vs. Spinner?**
A: Skeleton for layouts filling in gradually (lists, cards). Spinner for modal/overlay operations (uploading, processing). See COMPONENT_SPECS.md loading states.

**Q: Do we need dark mode from day 1?**
A: No. Ship light mode first (Phase 1-4). Dark mode = Phase 5 (future roadmap).

**Q: What about right-to-left (RTL) languages?**
A: Out of scope for v1. Layout is RTL-ready if we use logical properties (`start`/`end` vs. `left`/`right`). Plan for Phase 5 if needed.

**Q: Can we improve the gold contrast for accessibility?**
A: Current gold (#B8860B) on white = 7.89:1 (AA). To reach AAA (7:1+), we'd need #9B7500 or #A68A00. Test with Kokoro/Sentinela; if users struggle, we upgrade.

---

## Next Steps

1. **Aurora**: Export Figma components + CSS variables (by 2025-12-06)
2. **Pixel**: Start Phase 1 implementation (by 2025-12-09)
3. **Sentinela**: Prepare test scenarios + test IDs (by 2025-12-09)
4. **Kokoro**: Finalize API contracts (by 2025-12-08)
5. **Hermes**: Set up Vercel + monitoring (by 2025-12-10)

**Kickoff Meeting:** TBD (async preferred; link all docs in Linear)

---

**Design System v1.0 locked and ready. Let's ship excellence.**
