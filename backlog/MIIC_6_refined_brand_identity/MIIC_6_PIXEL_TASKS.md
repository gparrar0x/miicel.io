# MIIC_6: Pixel Implementation Tasks

**Agent:** Pixel (Frontend Specialist)
**Estimated Time:** 40-50 hours
**Priority:** High
**Dependencies:** Aurora design specs (complete)

## Objective

Implement Aurora's refined brand identity design system across miicel.io platform areas (landing, login, dashboard, sidebar).

## Design Documentation Reference

All specs located in: `/backlog/MIIC_6_refined_brand_identity/`

**Primary References:**
- `DESIGN_SYSTEM.md` - Complete design system
- `COMPONENT_SPECS.md` - Component implementations
- `DESIGN_QUICK_REFERENCE.md` - Quick lookup
- `styles.css` - CSS variables ready to use

## Implementation Tasks

### Phase 1: Foundation (8-10 hours)

**1.1 Setup Design Tokens**
- [ ] Update `tailwind.config.ts` with Aurora's color system
  - Noir, Charcoal, Alabaster, Gold, status colors
  - Font families (Cinzel, Inter, Source Code Pro)
  - Shadow values (subtle, not brutal)
  - Spacing scale (8px base)
- [ ] Import `styles.css` into `app/globals.css`
- [ ] Verify all CSS variables are accessible
- [ ] Test dark mode compatibility (if applicable)

**1.2 Typography Setup**
- [ ] Verify Cinzel font is loaded (Google Fonts)
- [ ] Update `font-display` class to use Cinzel
- [ ] Ensure Inter is default body font
- [ ] Test font rendering on multiple browsers

**Acceptance Criteria:**
- Build passes with no CSS warnings
- All design tokens accessible via Tailwind
- Fonts load correctly on all pages

---

### Phase 2: Component Library (12-15 hours)

**2.1 Core UI Components**

Create/update in `/components/ui/`:

- [ ] **Button.tsx**
  - Primary variant (gold bg, hover states)
  - Secondary variant (outline)
  - Ghost variant (text only)
  - Disabled states
  - Loading states with spinner
  - Test IDs: `button-{variant}`

- [ ] **Input.tsx**
  - Standard text input
  - Focus states (gold border glow)
  - Error states with message
  - Helper text support
  - Disabled state
  - Test IDs: `input-{id}`

- [ ] **Card.tsx**
  - Base card with subtle shadow
  - Stat card variant (for dashboard)
  - Hover states (subtle lift)
  - Test IDs: `card-{type}`

- [ ] **Badge.tsx**
  - Status variants (success/warning/error/info)
  - Size variants (sm/md/lg)
  - Test IDs: `badge-{status}`

**2.2 Layout Components**

- [ ] **Container.tsx**
  - Max-width constraints
  - Responsive padding
  - Test ID: `container`

- [ ] **DashboardHeader.tsx**
  - Hero section with gradient
  - Breadcrumbs (if needed)
  - Test ID: `dashboard-header`

**Acceptance Criteria:**
- All components have TypeScript types
- All components have data-testid attributes
- Storybook stories created (optional but recommended)
- Accessibility: keyboard navigation, ARIA labels

---

### Phase 3: Page Implementation (15-20 hours)

**3.1 Landing Page** (`app/[locale]/page.tsx`)

Target: Superadmin tenant list

Updates:
- [ ] Header with refined logo (gold square with M, subtle shadow)
- [ ] Page title with Cinzel font-display
- [ ] Tenant cards with:
  - White bg, subtle shadow (not 6px brutal)
  - Logo/name/slug layout
  - Action buttons (Dashboard/Tienda) with refined styling
  - Hover: subtle lift + shadow expansion
- [ ] Sign Out button (secondary style)
- [ ] Background: Alabaster (#FAFAFA) with subtle noise

Test IDs:
- `landing-header`
- `tenant-card-{slug}`
- `tenant-dashboard-link-{slug}`
- `tenant-store-link-{slug}`
- `button-sign-out`

**3.2 Login Page** (`app/[locale]/login/page.tsx`)

Updates:
- [ ] Centered logo (gold square, refined shadow)
- [ ] Login card with:
  - White bg, subtle shadow
  - Cinzel heading "Sign In"
  - Input fields with gold focus states
  - Primary button (gold bg)
  - Error messages (coral bg, refined borders)
- [ ] "Platform Access Only" footer text
- [ ] Background: Alabaster with noise

Test IDs (preserve existing):
- `login-form`
- `login-email-input`
- `login-password-input`
- `login-submit-button`
- `login-error-message`
- `login-loading-state`

**3.3 Dashboard** (`app/[locale]/[tenantId]/dashboard/page.tsx`)

Updates:
- [ ] Hero header:
  - Dark bg (Noir #0F0F0F)
  - Cinzel heading (white text)
  - Subtle gold accent stripe or element
  - Welcoming copy
- [ ] Stats grid (3 cards):
  - White cards with subtle shadows
  - Gold icon backgrounds (not harsh borders)
  - Clear typography hierarchy
  - Hover: subtle lift
- [ ] Quick Actions section:
  - Card container
  - Action buttons with icons
  - Settings button with gold hover
- [ ] Responsive: 1 col mobile, 3 cols desktop

Test IDs:
- `dashboard-header`
- `stat-card-products`
- `stat-card-orders`
- `stat-card-revenue`
- `quick-actions`
- `button-settings`

**3.4 AdminSidebar** (`components/AdminSidebar.tsx`)

Updates:
- [ ] Logo container (gold bg, refined)
- [ ] Navigation items:
  - Active state: gold/10 bg, gold icon
  - Hover: subtle gray bg
  - Text: Charcoal
- [ ] User avatar (gold/20 bg)
- [ ] View Store link (gold hover)
- [ ] Sign Out button (subtle red hover)
- [ ] Refined shadow on sidebar (not brutal)

Test IDs (preserve existing):
- `admin-sidebar`
- `nav-dashboard`
- `nav-products`
- `nav-orders`
- `nav-settings`
- `nav-view-store`
- `btn-logout`

**Acceptance Criteria:**
- All pages visually match Aurora's specs
- No hardcoded colors (use Tailwind classes)
- Responsive on mobile/tablet/desktop
- All existing test IDs preserved
- All new elements have test IDs

---

### Phase 4: Polish & Refinement (5-7 hours)

**4.1 Interactions**
- [ ] Smooth transitions (200ms ease)
- [ ] Hover states subtle (no dramatic lifts)
- [ ] Focus indicators visible (gold outline)
- [ ] Loading states elegant (spinner + text)

**4.2 Responsive Testing**
- [ ] Mobile (375px): Single column, touch targets ≥44px
- [ ] Tablet (768px): Adjusted grids
- [ ] Desktop (1440px+): Full layout

**4.3 Accessibility Audit**
- [ ] Color contrast ≥4.5:1 (body text)
- [ ] Heading contrast ≥3:1
- [ ] Focus indicators always visible
- [ ] Keyboard navigation functional
- [ ] Screen reader labels correct

**4.4 Performance**
- [ ] Lighthouse score ≥90 on all pages
- [ ] LCP < 2.5s
- [ ] No layout shifts (CLS < 0.1)
- [ ] Font loading optimized

---

## Testing Checklist

### Visual QA
- [ ] Landing page matches Aurora mockups
- [ ] Login page matches specs
- [ ] Dashboard matches specs
- [ ] Sidebar matches specs
- [ ] All typography correct (Cinzel/Inter)
- [ ] All colors match palette
- [ ] All shadows subtle (not brutal)

### Functional QA
- [ ] Login flow works
- [ ] Dashboard loads stats correctly
- [ ] Navigation functional
- [ ] Buttons trigger correct actions
- [ ] Forms validate properly
- [ ] Error states display correctly

### Responsive QA
- [ ] Mobile layout works (375px, 390px, 414px)
- [ ] Tablet layout works (768px, 820px)
- [ ] Desktop layout works (1024px, 1440px, 1920px)
- [ ] No horizontal scroll on any breakpoint

### Accessibility QA
- [ ] Tab navigation works in logical order
- [ ] All interactive elements focusable
- [ ] Focus indicators visible
- [ ] Screen reader announces elements correctly
- [ ] Color contrast passes WCAG AA

---

## Handoff to Sentinela

When implementation complete:
- [ ] Update all test IDs in `TEST_ID_CONTRACT.md`
- [ ] Notify Sentinela for E2E test updates
- [ ] Provide list of changed components
- [ ] Document any new interactive patterns

**E2E Test Scenarios:**
- Login flow with new styling
- Dashboard load and navigation
- Tenant card interactions
- Sidebar navigation
- Responsive breakpoints

---

## Notes for Pixel

**DO:**
- Use Tailwind utility classes (no hardcoded colors)
- Follow Aurora's spacing scale (8px base)
- Preserve all existing test IDs
- Add test IDs to new elements
- Keep interactions subtle and smooth
- Test on multiple browsers (Chrome, Safari, Firefox)

**DON'T:**
- Use 4px borders or 8px brutal shadows
- Use font-black everywhere (only for specific headings)
- Create dramatic hover lifts (-translate-y-1)
- Ignore accessibility requirements
- Skip responsive testing

**Color Reference (Quick):**
- Primary accent: `bg-gallery-gold` (#B8860B)
- Text primary: `text-gallery-black` (#1A1A1A)
- Text secondary: `text-gray-600`
- Background: `bg-[#FAFAFA]`
- Cards: `bg-white`
- Borders: `border-gray-200`
- Shadows: `shadow-sm` or `shadow-md` (not brutal)

**When in doubt:** Check `DESIGN_QUICK_REFERENCE.md`

---

## Timeline

- **Phase 1 (Foundation):** 8-10 hours
- **Phase 2 (Components):** 12-15 hours
- **Phase 3 (Pages):** 15-20 hours
- **Phase 4 (Polish):** 5-7 hours

**Total:** 40-50 hours

**Start Date:** TBD
**Target Completion:** TBD (after approval)
