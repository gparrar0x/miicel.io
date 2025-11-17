# Pixel Tasks - Tenant List Page

## SKY-41: Root Page Implementation

**Scope**: Build tenant list landing at `app/page.tsx`

### Requirements
- Replace current root page with tenant list
- Fetch from `/api/tenants/list`
- Implement Aurora's design spec
- Links: `/{slug}/` (store), `/{slug}/dashboard`
- States: loading, empty, error
- All elements need `data-testid`
- Mobile responsive

### Implementation
Edit `app/page.tsx`:
- Client component with `use client`
- `useState` + `useEffect` for API fetch
- Map tenants to cards
- Logo rendering (fallback if missing)
- Link components for navigation
- Loading skeleton
- Empty state message
- Error boundary

### Test IDs
- `tenant-list-container`
- `tenant-card-{slug}`
- `tenant-logo-{slug}`
- `tenant-name-{slug}`
- `tenant-store-link-{slug}`
- `tenant-dashboard-link-{slug}`
- `tenant-list-loading`
- `tenant-list-empty`
- `tenant-list-error`

### Dependencies
- Aurora design spec → `/docs/designs/tenant-list.md`
- Kokoro API → `/api/tenants/list` working

### Estimate
3h

### Testing
Verify links work, states render correctly, responsive on mobile.
