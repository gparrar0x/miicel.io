# Tenant Matrix — Component Implementation Handoff

> For: Pixel (Frontend Specialist)
> Reference: `DESIGN_SPECS_TENANT_MATRIX.md` (master spec)
> Test Contract: `docs/TEST_ID_CONTRACT.md`

---

## Overview

Build a **data matrix table** for superadmins to manage feature flags across tenants. Rows = flags, columns = tenants. Matrix supports:
- Template filtering (Gallery, Gastronomy, All)
- Flag search + scope filtering
- Per-cell toggle with semantic state indicators (enabled, disabled, inherited, global, loading)
- Bulk operations (select rows, toggle all at once)
- Right slide-over sheet for tenant detail view

---

## Component Tree (TSX Structure)

```tsx
// app/[locale]/dashboard/admin/tenants/page.tsx
<TenantMatrixView>
  <PageHeader>
    <h1>Feature Flags Across Tenants</h1>
  </PageHeader>
  
  <ControlBar>
    <TemplateFilterSegment value={template} onChange={setTemplate} />
    <FlagSearchBar
      searchValue={search}
      scopeFilter={scope}
      onSearch={setSearch}
      onScopeChange={setScope}
    />
  </ControlBar>
  
  <MatrixTable
    flags={filteredFlags}
    tenants={filteredTenants}
    selectedRows={selectedRows}
    onRowSelect={toggleRowSelect}
    onToggleFlag={updateFlag}
  >
    <TableHeader>
      <th data-testid="matrix-header-select">
        <Checkbox
          data-testid="select-all-checkbox"
          checked={allSelected}
          onChange={selectAll}
        />
      </th>
      <th data-testid="matrix-header-flag">Feature Flag</th>
      {tenants.map(tenant => (
        <TenantColumnHeader
          key={tenant.id}
          tenant={tenant}
          onClick={() => openSheet(tenant)}
          data-testid={`tenant-column-header--${tenant.id}`}
        />
      ))}
    </TableHeader>
    
    <TableBody>
      {flags.map(flag => (
        <FlagRow
          key={flag.id}
          flag={flag}
          isSelected={selectedRows.includes(flag.id)}
          onSelect={() => toggleRowSelect(flag.id)}
          data-testid={`flag-row--${flag.key}`}
        >
          <td data-testid={`flag-row-select--${flag.key}`}>
            <Checkbox
              checked={isSelected}
              onChange={onSelect}
            />
          </td>
          <td data-testid={`flag-row-header--${flag.key}`}>
            <FlagRowHeader flag={flag} />
          </td>
          {tenants.map(tenant => (
            <FlagToggleCell
              key={`${flag.id}-${tenant.id}`}
              flag={flag}
              tenant={tenant}
              state={getCellState(flag, tenant)}
              onToggle={() => updateFlag(flag.key, tenant.id)}
              data-testid={`flag-toggle-cell--${flag.key}-${tenant.id}--${state}`}
            />
          ))}
        </FlagRow>
      ))}
    </TableBody>
  </MatrixTable>
  
  {selectedRows.length > 0 && (
    <BulkActionsBar
      count={selectedRows.length}
      onEnableAll={bulkEnable}
      onDisableAll={bulkDisable}
      onClear={clearSelection}
      data-testid="bulk-actions-bar"
    />
  )}
  
  <TenantDetailSheet
    isOpen={sheetOpen}
    tenant={selectedTenant}
    onClose={closeSheet}
    data-testid="tenant-detail-sheet"
  />
</TenantMatrixView>
```

---

## Component Specs

### TenantMatrixView
**Purpose:** Root container for matrix view. Manages state: selected rows, sheet visibility, filters.

**Props:**
```tsx
interface TenantMatrixViewProps {
  // data
  flags: FeatureFlag[]
  tenants: Tenant[]
  // callbacks
  onFlagUpdate: (flagKey: string, tenantId: string, enabled: boolean) => Promise<void>
  onBulkUpdate: (flagKey: string, tenantIds: string[], enabled: boolean) => Promise<void>
}
```

**State to manage:**
- `selectedRows: string[]` — selected flag IDs
- `sheetOpen: boolean` — right panel visible
- `selectedTenant: Tenant | null` — tenant in detail sheet
- `searchQuery: string`
- `scopeFilter: 'all' | 'tenant' | 'template' | 'global'`
- `templateFilter: 'all' | string` — template slug or 'all'

**data-testid:** None (container)

---

### PageHeader
**Purpose:** Title + breadcrumb (optional).

**JSX:**
```tsx
<header className="mb-24">
  <h1 className="text-28px font-700" style={{fontFamily: 'Plus Jakarta Sans'}}>
    Feature Flags Across Tenants
  </h1>
</header>
```

---

### ControlBar
**Purpose:** Template filter segment + search + scope filter.

**Layout:** Flex row, gap 16px, flex-wrap.

**Styling:**
- Padding: 0 (inherits from container)
- Margin-bottom: 24px
- Background: transparent

**data-testid:** None (container)

---

### TemplateFilterSegment
**Purpose:** Segmented control for template filtering.

**Props:**
```tsx
interface TemplateFilterSegmentProps {
  templates: { key: string; label: string }[] // ["gallery", "gastronomy", "all"]
  value: string // current selected
  onChange: (value: string) => void
}
```

**Features:**
- Renders as horizontal segmented control (flex row, no gap, merged borders)
- Active segment: gold background, white text
- Inactive: off-white background, black text
- Smooth 150ms transition on click
- Each segment: 120px width, 36px height

**data-testid:** `template-filter--{templateKey}` on each button

---

### FlagSearchBar
**Purpose:** Search by flag name + filter by scope.

**Props:**
```tsx
interface FlagSearchBarProps {
  searchValue: string
  scopeFilter: 'all' | 'tenant' | 'template' | 'global'
  onSearch: (query: string) => void
  onScopeChange: (scope: string) => void
}
```

**Layout:** Flex row, gap 8px. Search input flex: 1, scope select flex: 0 0 160px.

**Search input:**
- Placeholder: "Search by flag name..."
- Icon: left (magnifier)
- Clearable: right X button when input has text
- **data-testid:** `flag-search-input`

**Scope select:**
- Options: All Scopes, Tenant-Specific, Template-Level, Global
- **data-testid:** `scope-filter-select`

---

### MatrixTable
**Purpose:** Sticky table with rows = flags, columns = tenants.

**Features:**
- Table header sticky top (z-index 10, background off-white)
- First column sticky left (z-index 2)
- First cell (header intersection) sticky left + top (z-index 11)
- No shadows on cells (flat, neo-brutalist)
- Subtle column header shadow: `0 2px 4px rgba(0,0,0,0.05)`

**Column widths (min):**
- First column (flag name): 180px
- Tenant columns: 120px each

**Alternating row stripes:** Every even row's first cell gets off-white background.

---

### TenantColumnHeader
**Purpose:** Header cell for tenant column. Shows logo + name + quick links.

**Props:**
```tsx
interface TenantColumnHeaderProps {
  tenant: Tenant
  onClick?: () => void // open detail sheet
  className?: string
}
```

**Layout:**
```
[Logo]
[Tenant Name]
```

**Styling:**
- Logo: 28px square, background sky-blue-gray, centered
- Tenant name: 14px bold, center-aligned, black text
- Cursor: pointer
- On click: trigger `onClick` callback

**data-testid:** `tenant-column-header--{tenantId}`

---

### FlagRowHeader
**Purpose:** Row header cell showing flag name + scope badge + help icon.

**Props:**
```tsx
interface FlagRowHeaderProps {
  flag: FeatureFlag
  // flag has: id, key, name, description, scope ('tenant' | 'template' | 'global')
}
```

**Layout:**
```
[Checkbox] [FlagName] [ScopeBadge]
```

**Styling:**
- Checkbox left, margin-right 8px
- Flag name: 14px bold, black text
- Scope badge: inline, 11px, 4px padding, 6px border-radius
  - Tenant-specific: secondary color badge
  - Template: warning color badge
  - Global: accent (gold) color badge
- Hover: show tooltip with `flag.description`

**data-testid:**
- Checkbox: `flag-row-select--{flagKey}`
- Header: `flag-row-header--{flagKey}`

---

### FlagToggleCell
**Purpose:** Interactive toggle cell with semantic state indicators.

**Props:**
```tsx
interface FlagToggleCellProps {
  flag: FeatureFlag
  tenant: Tenant
  state: 'enabled' | 'disabled' | 'inherited' | 'global' | 'loading'
  onToggle: () => Promise<void> // async toggle
  isLoading?: boolean
}
```

**States & Styling:**

| State | Background | Toggle | Indicator | Cursor | Disabled |
|-------|-----------|--------|-----------|--------|----------|
| **enabled** | white | ON (success) | ✓ | pointer | false |
| **disabled** | white | OFF (gray) | none | pointer | false |
| **inherited** | off-white (60%) | grayed out | Badge "Inherits" | not-allowed | true |
| **global** | off-white (60%) | grayed out | Badge "Global" | not-allowed | true |
| **loading** | white | disabled | spinner | wait | true |

**Toggle component:**
- Width: 36px, Height: 20px
- Border-radius: 10px (rounded pill)
- Background: gray when off, success/gold when on
- Smooth 150ms transition
- Pseudo-element "dot" slides left/right

**Hover behavior:**
- Enabled/disabled cells: light background shift (off-white at 50% opacity)
- Inherited/global/loading: no change

**Loading state:**
- Spinner icon (16px, rotating, 1s linear infinite)
- Color: gold accent
- Positioned center in cell

**Tooltip (inherited/global):**
- Title attr: "This flag is enabled at the template level. Disable the template flag to toggle here."

**data-testid:**
- Cell: `flag-toggle-cell--{flagKey}-{tenantId}--{state}`
- Toggle input: `flag-toggle-switch--{flagKey}-{tenantId}`
- Loading spinner: `flag-toggle-loading--{flagKey}-{tenantId}`

---

### BulkActionsBar
**Purpose:** Floating action bar for bulk operations (visible when rows selected).

**Props:**
```tsx
interface BulkActionsBarProps {
  count: number // selected rows
  onEnableAll: () => Promise<void>
  onDisableAll: () => Promise<void>
  onClear: () => void
  isLoading?: boolean
}
```

**Position:** Fixed bottom-right, 16px from edges, z-index 40.

**Layout:**
```
[2 rows selected] [Enable All] [Disable All] [Clear]
```

**Styling:**
- Background: `--color-paper` (#f4f4f0)
- Border: 1px `--color-border` (#e5e5e5)
- Border-radius: 8px
- Padding: 16px
- Height: 56px
- Box-shadow: `0 4px 12px rgba(0,0,0,0.15)`

**Animation:**
- Entrance: slide up + fade in, 300ms ease-in-out-circ
- Exit: slide down + fade out, 150ms ease-out

**Buttons:**
- Enable: Primary CTA (`--color-primary` #1a1a1a background, white text)
- Disable: Secondary (transparent, `--color-border` border)
- Clear: Link style (text `--color-text-secondary` #666666)

**data-testid:**
- Container: `bulk-actions-bar`
- Enable button: `bulk-enable-btn`
- Disable button: `bulk-disable-btn`
- Clear button: `bulk-clear-btn`

---

### TenantDetailSheet
**Purpose:** Right slide-over panel showing tenant metadata, flags, and audit log.

**Props:**
```tsx
interface TenantDetailSheetProps {
  isOpen: boolean
  tenant: Tenant | null
  onClose: () => void
  // tenant has: id, name, logo, domain, created_at, plan, flags[]
}
```

**Position:** Right edge, 384px width, fixed, z-index 41 (behind overlay at 40).

**Overlay:** Semi-transparent dark background, click to close, z-index 40.

**Animation:** Slide in from right + fade overlay, 200ms cubic-bezier(0.4, 0, 0.2, 1).

**Sections (top to bottom):**

#### SheetHeader
- Background: off-white
- Border-bottom: 1px light gray
- Logo: 32px, centered
- Title: 18px bold, centered
- Close button: ✕, top-right corner, 24px, hover gold
- **data-testid:** `tenant-sheet-header`

#### Metadata Block
- Fields: Domain, Created (ISO date), Plan
- Font: 13px, secondary text color
- Layout: "Label: Value"
- **data-testid:** `tenant-sheet-metadata`

#### Quick Links
- Two buttons: Dashboard + Tienda (full width each, 40px height)
- Style: Primary CTA
- Icons + text, center-aligned
- **data-testid:** `tenant-sheet-quick-links`

#### Flags Section
- Title: "Feature Flags (This Tenant)"
- List of flags for this tenant
- Per-item: flag name, scope badge, description, toggle
- Toggles here are same as matrix (enabled, disabled, inherited, global)
- **data-testid:**
  - Container: `tenant-sheet-flags`
  - Item: `flag-list-item--{flagKey}`

#### Audit Log Section
- Title: "Recent Changes"
- Last 5 flag toggles for this tenant
- Format: "2026-04-11 · agents: ON by admin@skyw.app"
- Font: 12px, secondary text
- **data-testid:** `tenant-sheet-audit-log`

#### SheetFooter
- Border-top: 1px light gray
- Button: "Done" (closes sheet)
- **data-testid:** `tenant-sheet-close-btn`

---

## State Management & Data Flow

### Initial Load
```
1. Fetch flags + tenants (parallel queries)
2. Filter by selected template
3. Apply search + scope filter
4. Render matrix
```

### Toggle a Cell
```
1. Set cell to loading state
2. POST /api/admin/tenants/{tenantId}/flags/{flagKey}
   Body: { enabled: boolean }
3. On success: update cell state, show optional success flash
4. On error: revert cell state, show toast error
5. On timeout (>5s): revert cell state, show toast error
```

### Bulk Toggle
```
1. Collect selected flag IDs → selected tenants
2. POST /api/admin/flags/{flagKey}/bulk
   Body: { tenantIds: [...], enabled: boolean }
3. Per-tenant completion: stagger animation (50ms per)
4. Final: all cells updated, bulk bar closed, toast success
```

### Open Sheet
```
1. Click tenant column header
2. Set selectedTenant state
3. Slide panel in from right
4. Fetch tenant metadata + audit log (if not cached)
```

### Close Sheet
```
1. Click ✕ or "Done"
2. Slide panel out to right
3. Clear selectedTenant state
4. Optional: use Router search params for state persistence
```

---

## API Endpoints (Expected)

```
POST /api/admin/tenants/{tenantId}/flags/{flagKey}
  Body: { enabled: boolean }
  Response: { success: true, state: 'enabled' | 'disabled' | ... }
  Errors: 400 (invalid), 403 (unauthorized), 500 (server)

POST /api/admin/flags/{flagKey}/bulk
  Body: { tenantIds: string[], enabled: boolean }
  Response: { success: true, updated: number, failed: number }

GET /api/admin/flags?scope=all|tenant|template|global
  Response: { flags: FeatureFlag[] }

GET /api/admin/tenants?template=gallery|gastronomy|all
  Response: { tenants: Tenant[] }

GET /api/admin/tenants/{tenantId}/audit-log?limit=5
  Response: { logs: AuditLogEntry[] }
```

---

## Design Tokens (from Micelio PRODUCT_IDENTITY)

```css
/* Colors */
--background: #ffffff;
--foreground: #000000;
--color-paper: #f4f4f0;
--color-ink: #111111;
--color-text-secondary: #666666;
--color-text-muted: #999999;
--color-border: #e5e5e5;
--color-border-strong: #000000;
--color-bg-subtle: #f5f5f5;
--color-primary: #1a1a1a;
--color-accent: rgba(26, 26, 26, 0.08);
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;
--color-disabled: #9CA3AF;

/* Typography */
Cinzel (serif, headers): font-weight 600-700, size 22-28px
Inter (sans-serif, body): font-weight 400-600, size 11-16px
JetBrains Mono (monospace, code): font-weight 400, size 12px

/* Spacing */
4px, 8px, 16px, 24px, 32px, 48px (8px grid)

/* Border Radius */
Buttons/toggles: 6px
Cards/panels: 8px
Modals: 12px
Avatars: 50%

/* Shadows */
Subtle: 0 1px 4px rgba(0,0,0,0.1)
Medium: 0 2px 8px rgba(0,0,0,0.2)
Elevation: 0 4px 12px rgba(0,0,0,0.15)

/* Animations */
Timing Fast: 100ms
Timing Normal: 300ms
Ease Out Expo: cubic-bezier(0.19, 1, 0.22, 1)
Ease In Out Circ: cubic-bezier(0.785, 0.135, 0.15, 0.86)
Stagger: 50ms per item
```

---

## Testing (for Centinela)

Refer to `docs/TEST_ID_CONTRACT.md` for all data-testid expectations.

**Key test scenarios:**
1. Toggle a single flag (enabled → disabled, vice versa)
2. Toggle inherited/global flags (should be disabled)
3. Bulk select rows, enable/disable all
4. Search + filter by scope
5. Switch templates and see matrix re-render
6. Click tenant column header to open/close sheet
7. Error handling: toggle fails, cell reverts + toast shown
8. Loading state: cell shows spinner during request

---

## Notes for Pixel

- **No decorative shadows** — Matrix is flat, neo-brutalist. Only subtle separation shadows on headers.
- **Sticky positioning over JavaScript** — Use CSS `position: sticky`. Test horizontal/vertical scroll overlap.
- **Optimistic state updates** — Update cell immediately on toggle. Revert on error.
- **Batch requests** — Limit concurrent requests to ~10 per bulk operation.
- **Empty states** — Handle "no flags" and "no tenants" gracefully with placeholder text.
- **Keyboard nav** — All interactive elements tabable. Enter/Space toggles cells/buttons.
- **Focus ring** — 2px gold (#D4AF37) with 2px offset, visible on all interactive elements.
- **Dark mode** — Not required per spec (desktop-only admin feature), but use OKLCH color space if adding later.

---

## Handoff Checklist

- [ ] All components built per spec with correct data-testid
- [ ] Matrix renders correctly (sticky headers, no overflow issues)
- [ ] Toggle interaction works (click → loading → success/error)
- [ ] Bulk operations work (select rows → enable/disable all)
- [ ] Sheet opens/closes smoothly (animation 200ms)
- [ ] Search + filter updates matrix immediately
- [ ] Template filter re-renders matrix without page jump
- [ ] Error handling: failed toggles revert + toast shown
- [ ] Test data fully functional (real API endpoints called)
- [ ] Centinela can run E2E tests using provided data-testid

---

**Status:** Ready for Pixel implementation.  
**Reference:** `DESIGN_SPECS_TENANT_MATRIX.md`, `MATRIX_MOCKUP.html`, `TEST_ID_CONTRACT.md`
