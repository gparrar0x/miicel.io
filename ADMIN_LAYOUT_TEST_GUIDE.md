# Admin Layout - Visual & Functional Test Guide

## Test Checklist for Sentinela

### Desktop Tests (≥1024px)

- [ ] Sidebar visible on load (256px width)
- [ ] Sidebar fixed position (doesn't scroll with content)
- [ ] All nav items visible: Dashboard, Products, Orders, Settings
- [ ] Active route has blue background + blue text
- [ ] Hover states work on nav items (gray background)
- [ ] Logout button at bottom with red hover
- [ ] Main content area starts at 256px from left
- [ ] No mobile header visible

### Mobile Tests (<1024px)

- [ ] Mobile header visible at top
- [ ] Hamburger button visible (top-right)
- [ ] Sidebar hidden by default
- [ ] Clicking hamburger opens sidebar from left
- [ ] Dark overlay appears behind sidebar
- [ ] Sidebar slides in smoothly (300ms)
- [ ] Clicking overlay closes sidebar
- [ ] Clicking nav item closes sidebar
- [ ] Main content has top padding for header (56px)

### Navigation Tests

**Test route:** `http://localhost:3000/{tenant}/dashboard`

- [ ] Click "Products" → URL changes to `/dashboard/products`
- [ ] Click "Orders" → URL changes to `/dashboard/orders`
- [ ] Click "Settings" → URL changes to `/dashboard/settings`
- [ ] Click "Dashboard" → URL changes to `/dashboard`
- [ ] Active state follows current route

### Test ID Verification (Playwright)

```typescript
// Sidebar presence
await expect(page.getByTestId('admin-sidebar')).toBeVisible()

// Navigation links
await expect(page.getByTestId('nav-products')).toBeVisible()
await expect(page.getByTestId('nav-orders')).toBeVisible()
await expect(page.getByTestId('nav-settings')).toBeVisible()

// Logout button
await expect(page.getByTestId('btn-logout')).toBeVisible()

// Mobile toggle (mobile only)
await page.setViewportSize({ width: 375, height: 667 })
await expect(page.getByTestId('btn-toggle-sidebar')).toBeVisible()
```

### Logout Flow Test

1. Click logout button (`btn-logout`)
2. Verify redirect to `/{tenant}/login`
3. Verify Supabase session cleared

### Responsive Breakpoints

| Width | Behavior |
|-------|----------|
| <1024px | Mobile: Hidden sidebar + hamburger menu |
| ≥1024px | Desktop: Fixed visible sidebar |

### Accessibility Tests

- [ ] Tab navigation works through all links
- [ ] Focus visible on all interactive elements
- [ ] Logout button has aria-label
- [ ] Color contrast ≥4.5:1 (WCAG AA)

### Performance Benchmarks

- [ ] Layout shift (CLS) < 0.1
- [ ] Sidebar transition smooth (60fps)
- [ ] No flash of unstyled content
- [ ] First paint includes sidebar (no lazy load)

---

**Test Priority:** High (blocking for all admin features)
**Estimated Test Time:** 15 minutes manual, 5 minutes automated
