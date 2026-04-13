# Tenant Feature Flags Matrix — Design Specifications

> Redesign: Card grid → Data matrix table for faster flag management across tenants.
> Reference: `docs/PRODUCT_IDENTITY.md` (Core Palette, Typography, Spacing, Animations)

---

## Design Direction

### Problem
Current card-per-tenant layout forces superadmins to scroll horizontally across separate cards to find and toggle the same flag across multiple tenants. Workflow: "Enable `content_pipeline` for Gallery tenants" = N scroll + N find operations.

### Solution
**Matrix table** with rows as flags, columns as tenants. One column scan finds all instances of a flag. Sticky column headers and row labels enable fast cross-tenant toggles without layout jump.

### Aesthetic
- **Template:** Micelio neo-brutalist (monochrome + gold accent)
- **Restraint:** White space > decoration. Every cell earns its place.
- **Precision:** Semantic cell states (enabled, inherited, disabled). Clear visual feedback per toggle action.
- **Desktop-only:** No mobile fallback. Superadmin workstation use.

---

## Visual Specs

### Palette (from PRODUCT_IDENTITY)

| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#0C1A27` (sky-black) | Flag names, tenant names, toggle labels |
| `--text-secondary` | `#5F7382` (sky-blue-gray) | Scope badges, timestamps, metadata |
| `--bg-primary` | `#FFFFFF` | Matrix cells, content area |
| `--bg-secondary` | `#EFEEE9` (sky-off-white) | Row stripes, header background, filters |
| `--border` | `#E5E5E5` | Cell dividers, table grid |
| `--accent` | `#D4AF37` (sky-gold) | Toggle indicator (enabled), focus ring, CTA |
| `--accent-secondary` | `#E8833A` (sky-orange) | Hover state on toggles, template sections |
| `--success` | `#10B981` | Enabled state (filled), status badge |
| `--disabled` | `#9CA3AF` | Disabled toggles, locked cells (inherited) |
| `--warning` | `#F59E0B` | Inherited/template-level flag indicator |

### Typography

| Role | Font | Weight | Size | Line Height |
|---|---|---|---|---|
| Page Title | Plus Jakarta Sans | 700 | 28px | 1.3 |
| Section Header | Plus Jakarta Sans | 600 | 22px | 1.4 |
| Column Header (tenant name) | Geist Sans | 600 | 14px | 1.5 |
| Row Header (flag name) | Geist Sans | 600 | 14px | 1.5 |
| Cell Content (toggle label) | Geist Sans | 500 | 12px | 1.4 |
| Metadata (scope badge) | Geist Sans | 400 | 11px | 1.4 |
| Filter labels | Geist Sans | 500 | 13px | 1.5 |

### Spacing (8px Grid)

| Element | Padding | Margin | Notes |
|---|---|---|---|
| Page container | 32px (horizontal), 24px (vertical) | — | Left/right padding |
| Filter bar | 16px internal | 0 24px 24px | Between title and matrix |
| Matrix outer | — | 0 | Full width within container |
| Row header cell | 16px (left), 12px (top/bottom) | — | Flag name + scope badge |
| Data cell | 12px | 0 | Toggle + indicator |
| Column header cell | 12px | — | Tenant name + quick links |
| Badge (scope) | 4px (horiz), 2px (vert) | 4px 0 0 0 | Inline within row header |

### Border Radius

- Buttons, toggles: 6px
- Filter inputs, select: 6px
- Template segment control: 6px
- Slide-over panel: 12px (modal-like)

### Shadows

- Matrix table: none (flat, neo-brutalist)
- Column header: `0 2px 4px rgba(0,0,0,0.05)` (subtle separation)
- Slide-over panel: `0 4px 12px rgba(0,0,0,0.15)` (elevation)
- Hover state on cells: none (state change via background color only)

### Animations

- **Toggle transition:** 150ms ease-out (shadow + color)
- **Slide-over entrance:** 200ms cubic-bezier(0.4, 0, 0.2, 1)
- **Hover highlight (row):** 150ms ease-out on background
- **Tab/segment switch:** 200ms cubic-bezier(0.4, 0, 0.2, 1)
- **Stagger (bulk operations):** 50ms per item

---

## Component Hierarchy & Structure

```
TenantMatrixView
  ├─ Header Section
  │   └─ PageTitle ("Feature Flags Across Tenants")
  ├─ ControlBar
  │   ├─ TemplateFilterSegment
  │   │   └─ [Gallery] [Gastronomy] [All Templates] (tabs/segments)
  │   └─ FlagSearchBar
  │       ├─ SearchInput
  │       └─ ScopeFilterSelect
  ├─ MatrixTable (sticky headers)
  │   ├─ TableHeader (sticky top)
  │   │   ├─ RowHeaderCell (sticky left) — "Feature Flag"
  │   │   └─ ColumnHeaderCell[] (sticky top) — Tenant columns
  │   │       └─ TenantColHeader
  │   │           ├─ TenantName
  │   │           ├─ TenantLogo
  │   │           └─ QuickActionLinks (Dashboard, Tienda)
  │   └─ TableBody
  │       └─ FlagRow[]
  │           ├─ RowSelectCheckbox (bulk ops)
  │           ├─ RowHeaderCell (sticky left)
  │           │   ├─ FlagName
  │           │   ├─ ScopeBadge
  │           │   └─ HelpIcon (description tooltip)
  │           └─ DataCell[]
  │               └─ FlagToggleCell
  │                   ├─ Toggle
  │                   ├─ StateIndicator
  │                   └─ LoadingSpinner (on toggle action)
  ├─ BulkActionsBar (floating, if rows selected)
  │   ├─ SelectCountLabel
  │   ├─ BulkEnableBtn
  │   ├─ BulkDisableBtn
  │   └─ ClearSelectionBtn
  └─ TenantDetailSheet (right slide-over, triggered by column header click)
      ├─ SheetHeader
      │   ├─ TenantName + Logo
      │   └─ CloseBtn
      ├─ SheetContent
      │   ├─ TenantMetadata (Domain, Created, Plan)
      │   ├─ QuickLinks (Dashboard, Tienda, Settings)
      │   ├─ FlagListPerTenant
      │   │   └─ FlagListItem[]
      │   │       ├─ FlagName + ScopeBadge
      │   │       ├─ Description
      │   │       └─ InlineToggle
      │   └─ TenantAuditLog (last 5 flag changes)
      └─ SheetFooter
          └─ DoneBtn
```

---

## Cell States & Visual Design

### FlagToggleCell States

All cells in the matrix have one of five states:

#### 1. **Enabled (Tenant-Specific)**
- **Background:** `--bg-primary` (white)
- **Border:** 1px `--border` (light gray)
- **Toggle:** On (filled, `--success` or `--accent`)
- **Indicator:** Small checkmark or filled circle (gold or green)
- **Cursor:** pointer
- **Hover:** Light background shift (`--bg-secondary` at 50% opacity)
- **data-testid:** `flag-toggle-cell--{flagKey}-{tenantId}--enabled`

#### 2. **Disabled (Tenant-Specific)**
- **Background:** `--bg-primary`
- **Border:** 1px `--border`
- **Toggle:** Off (unfilled)
- **Indicator:** None
- **Cursor:** pointer
- **Hover:** Light background shift
- **data-testid:** `flag-toggle-cell--{flagKey}-{tenantId}--disabled`

#### 3. **Inherited (Template-Level)**
- **Background:** `--bg-secondary` (off-white, 60% opacity)
- **Border:** 1px `--border`
- **Toggle:** Disabled (grayed out)
- **Indicator:** Badge "Inherits from {templateName}" (inline, `--warning` color, 11px)
- **Cursor:** not-allowed
- **Hover:** No change (not interactive)
- **Tooltip:** "This flag is enabled at the template level. Disable the template flag to toggle here."
- **data-testid:** `flag-toggle-cell--{flagKey}-{tenantId}--inherited`

#### 4. **Locked (Global-Level)**
- **Background:** `--bg-secondary` (off-white, 60% opacity)
- **Border:** 1px `--border`
- **Toggle:** Disabled (grayed out)
- **Indicator:** Badge "Global" (inline, `--text-secondary`, 11px)
- **Cursor:** not-allowed
- **Hover:** No change
- **Tooltip:** "This flag is enabled globally. Cannot be toggled per tenant."
- **data-testid:** `flag-toggle-cell--{flagKey}-{tenantId}--global`

#### 5. **Loading**
- **Background:** `--bg-primary`
- **Border:** 1px `--border`
- **Toggle:** Disabled during request
- **Indicator:** Spinning loader icon (16px, `--accent`)
- **Cursor:** wait
- **Animation:** Smooth spin 1s linear infinite
- **data-testid:** `flag-toggle-cell--{flagKey}-{tenantId}--loading`

### Row Header Cell (Flag Name + Scope)

**Layout:**
```
[FlagName] [ScopeBadge]
```

- **FlagName:** 14px bold, `--text-primary`
- **ScopeBadge:** Inline, 11px, 4px padding, 6px border-radius
  - **Scope Options:**
    - `Tenant-specific` → `--text-secondary` background, dark text
    - `Template-level` → `--warning` background (light), dark text
    - `Global` → `--accent` background (light gold), dark text
- **Hover:** Tooltip with flag description (title attr or Popover)
- **Checkbox:** Left edge, margin 8px right
- **data-testid:** `flag-row-header--{flagKey}`

### Column Header Cell (Tenant)

**Layout:**
```
[Logo] [TenantName]
[Dashboard] [Tienda]
```

- **Logo:** 28px square, border-radius full, background `--bg-secondary`
- **TenantName:** 14px bold, `--text-primary`, center-aligned below logo
- **QuickLinks:** Two small link buttons (12px, `--accent` text, no background)
  - Hover: underline
  - Icons: 14px (Dashboard icon, Shop icon)
- **Cursor:** pointer (sheet opens on click, not link follow)
- **data-testid:** `tenant-column-header--{tenantId}`

---

## Filter & Search Bar

### FlagSearchBar Component

**Layout:**
```
[SearchInput_______] [ScopeFilterSelect_____]
```

- **SearchInput:** Full width, 40px height, 12px left padding
  - Placeholder: "Search by flag name..."
  - Icon: Search (left) + Clear (right, visible when input has text)
  - Border: 1px `--border`
  - Radius: 6px
  - **data-testid:** `flag-search-input`

- **ScopeFilterSelect:** 160px width, 40px height
  - Options: [All Scopes] [Tenant-Specific] [Template-Level] [Global]
  - Default: "All Scopes"
  - Border: 1px `--border`
  - Radius: 6px
  - **data-testid:** `scope-filter-select`

### TemplateFilterSegment

**Layout:** Horizontal segmented control above SearchBar

```
[Gallery] [Gastronomy] [All Templates]
```

- **Each segment:** 120px width, 36px height, center text
- **Active segment:** Background `--accent`, text white
- **Inactive segment:** Background `--bg-secondary`, text `--text-primary`
- **Border:** 1px `--border` around group
- **Radius:** 6px per segment, no gap (merged)
- **Transition:** 150ms ease-out
- **data-testid:** `template-filter--{templateKey}`

---

## Bulk Operations Bar (Floating)

**Trigger:** User selects one or more row checkboxes.

**Layout:**
```
[x rows selected] [Enable All] [Disable All] [Clear]
```

**Position:** Fixed bottom-right, 16px from edges, z-index 40

**Styling:**
- **Background:** `--bg-secondary` with border 1px `--border`
- **Border-radius:** 8px
- **Shadow:** `0 4px 12px rgba(0,0,0,0.15)`
- **Padding:** 16px
- **Height:** 56px

**Elements:**
- **CountLabel:** "2 rows selected" → `--text-secondary`, 12px
- **EnableBtn:** "Enable for selected" → Primary CTA, `--accent` background, white text, 6px radius
- **DisableBtn:** "Disable for selected" → Secondary, `--text-primary` text, `--border` border
- **ClearBtn:** "Clear selection" → Link style, `--text-secondary` text
- **All buttons:** 12px padding, 14px font

**Animations:**
- Entrance: slide up + fade in, 200ms cubic-bezier
- Exit: slide down + fade out, 150ms ease-in
- Button hover: subtle background shift, 150ms ease-out

**data-testid:**
- `bulk-actions-bar`
- `bulk-enable-btn`
- `bulk-disable-btn`
- `bulk-clear-btn`

---

## Tenant Detail Sheet (Right Slide-Over)

**Trigger:** Click on column header (tenant name or logo).

**Position:** Right edge, 384px width (50vw on smaller screens, clamped min 360px)

**Layout:**
```
┌─────────────────────────────┐
│ [Tenant Logo] Tenant Name ✕ │  ← SheetHeader
├─────────────────────────────┤
│ Domain: example.com         │
│ Created: 2024-03-15         │
│ Plan: Premium               │  ← Metadata
├─────────────────────────────┤
│ Quick Links                 │
│ [Dashboard] [Tienda]        │  ← Buttons
├─────────────────────────────┤
│ Feature Flags (This Tenant) │
│                             │
│ ☑ content_pipeline         │
│   Enabled (Tenant-specific) │
│                             │
│ ☑ agents                    │
│   Inherited (Gallery)       │
│                             │
│ ☐ dark_mode                │
│   Disabled                  │
│                             │  ← FlagListPerTenant
├─────────────────────────────┤
│ Recent Changes              │
│ 2026-04-11 · agents: ON     │
│ 2026-04-09 · consignments... │
│                             │  ← AuditLog (last 5)
├─────────────────────────────┤
│                       [Done] │  ← SheetFooter
└─────────────────────────────┘
```

**Styling:**
- **Background:** `--bg-primary`
- **Border-left:** 1px `--border`
- **Shadow:** `0 4px 12px rgba(0,0,0,0.15)`
- **Animation:** Slide in from right, 200ms cubic-bezier(0.4, 0, 0.2, 1)

**Sections:**

#### SheetHeader
- **Logo:** 32px square, center within 56px header area
- **TenantName:** 18px bold, center-aligned
- **CloseBtn:** ✕ icon, 24px, top-right corner, hover `--accent`
- **Background:** `--bg-secondary`
- **Padding:** 16px
- **Border-bottom:** 1px `--border`
- **data-testid:** `tenant-sheet-header`

#### Metadata Block
- **List format:** "Label: Value"
- **Padding:** 16px
- **Border-bottom:** 1px `--border`
- **Fields:** Domain, Created (ISO date), Plan
- **Font:** 13px, `--text-secondary`
- **data-testid:** `tenant-sheet-metadata`

#### Quick Links
- Two buttons: "Dashboard" + "Tienda"
- **Size:** Full width each, 40px height
- **Style:** Primary CTA style
- **Icon + text:** 14px center-aligned
- **Padding:** 16px (container)
- **Border-bottom:** 1px `--border`
- **data-testid:** `tenant-sheet-quick-links`

#### Flag List (Per Tenant)
- **Header:** "Feature Flags (This Tenant)" → 14px bold
- **Items:** List of flags scoped to this tenant
- **FlagListItem Layout:**
  ```
  [Toggle] FlagName
          Description
          Scope: tenant-specific | inherited | global
  ```
- **Padding:** 16px (container), 12px (item)
- **Separator:** 1px `--border` between items
- **Toggle:** Full width, 36px height
- **data-testid:** `tenant-sheet-flags`, `flag-list-item--{flagKey}`

#### Audit Log
- **Header:** "Recent Changes" → 14px bold
- **Items:** Last 5 flag toggles for this tenant
- **AuditItem Layout:**
  ```
  2026-04-11 · agents: ON    [Enabled by: admin@example.com]
  ```
- **Font:** 12px, `--text-secondary`
- **Padding:** 16px (container), 12px (item)
- **Border-bottom:** 1px `--border`
- **data-testid:** `tenant-sheet-audit-log`

#### SheetFooter
- **Button:** "Done" (closes sheet)
- **Padding:** 16px
- **Border-top:** 1px `--border`
- **data-testid:** `tenant-sheet-close-btn`

---

## Interaction & Micro-States

### Toggle Interaction Flow

**User action:** Click toggle in cell

1. **Immediate:** Cell enters `loading` state (spinner appears)
2. **Request:** POST `/api/admin/tenants/{tenantId}/flags/{flagKey}` with `enabled: boolean`
3. **Success (200):**
   - Cell state updates to new state (enabled/disabled)
   - Spinner disappears
   - Brief success indicator (optional: green flash, 300ms)
   - Row re-renders with updated state
4. **Error (4xx/5xx):**
   - Cell reverts to previous state
   - Toast error: "Failed to update {flagName}. Try again."
   - Spinner disappears
5. **Timeout (>5s):**
   - Cell reverts to previous state
   - Toast error: "Request timed out. Check your connection."

**Data-testid for states:**
- `flag-toggle-cell--{flagKey}-{tenantId}--{state}` (enabled, disabled, inherited, global, loading)
- `flag-toggle-switch--{flagKey}-{tenantId}` (the toggle input itself)
- `flag-toggle-loading--{flagKey}-{tenantId}` (spinner within cell)

### Bulk Toggle Flow

**User action:** Select rows, click "Enable for selected"

1. **Batch request:** POST `/api/admin/flags/{flagKey}/bulk` with `tenantIds: []`, `enabled: boolean`
2. **Stagger response:** As each tenant completes, its row stagger-animates success state (50ms per)
3. **Final state:** All selected cells show new state, bulk bar closes, toast: "Updated 3 tenants."

**data-testid:**
- `bulk-actions-bar`
- `bulk-enable-btn`, `bulk-disable-btn`
- `bulk-operation-status-toast` (success/error)

### Sheet Navigation

**Open:** Click tenant column header → Sheet slides in from right, overlay darkens background
**Close:** Click ✕ or "Done" → Sheet slides out, focus returns to matrix

**data-testid:**
- `tenant-detail-overlay` (background overlay)
- `tenant-detail-sheet` (panel itself)
- `tenant-sheet-close-btn` (✕ icon button)

---

## Responsive Behavior

**Desktop-only** (≥1024px assumed). No mobile layout.

**Sticky behavior:**
- Row header column: sticky left with z-index 2
- Column header row: sticky top with z-index 1
- Row header + column header intersection: z-index 3, `--bg-secondary` background

**Horizontal scroll:** If more tenants than viewport width, table scrolls right (row headers stay fixed)

**Max width:** Container 1600px, centered (or full width with padding)

---

## Component Test ID Contract

**Pattern:** `{component}-{context}--{state}` or `{component}--{identifier}--{property}`

| Component | Test ID Format | Identifier | Notes |
|---|---|---|---|
| FlagToggleCell | `flag-toggle-cell--{flagKey}-{tenantId}--{state}` | e.g., `content_pipeline-ty1-enabled` | state: enabled, disabled, inherited, global, loading |
| Toggle input | `flag-toggle-switch--{flagKey}-{tenantId}` | Same as above | The input itself (for Playwright interaction) |
| Flag row | `flag-row--{flagKey}` | Flag key (snake_case) | Row container |
| Row select checkbox | `flag-row-select--{flagKey}` | Flag key | Bulk selection trigger |
| Tenant column header | `tenant-column-header--{tenantId}` | Tenant UUID or slug | Click opens sheet |
| Template filter | `template-filter--{templateKey}` | e.g., `gallery`, `gastronomy` | Segment button |
| Search input | `flag-search-input` | — | Text input |
| Scope filter | `scope-filter-select` | — | Dropdown |
| Bulk actions bar | `bulk-actions-bar` | — | Container |
| Bulk enable button | `bulk-enable-btn` | — | Action button |
| Bulk disable button | `bulk-disable-btn` | — | Action button |
| Tenant sheet (overlay) | `tenant-detail-overlay` | — | Background overlay, click to close |
| Tenant sheet (panel) | `tenant-detail-sheet` | — | The right panel |
| Sheet close button | `tenant-sheet-close-btn` | — | ✕ icon |
| Sheet metadata | `tenant-sheet-metadata` | — | Tenant info section |
| Sheet flags list | `tenant-sheet-flags` | — | List container |
| Flag list item | `flag-list-item--{flagKey}` | Flag key | Individual flag in sheet |
| Sheet audit log | `tenant-sheet-audit-log` | — | Recent changes section |

---

## Accessibility

- **Keyboard nav:** Tab through all interactive elements (toggles, buttons, links)
- **Focus ring:** 2px `--sky-gold` with 2px offset, visible on all interactive elements
- **ARIA labels:** All toggles, buttons, and sheet have descriptive aria-label
- **Color contrast:** All text meets WCAG AA minimum (4.5:1 for body, 3:1 for large)
- **Screen reader:** Sheet announced as dialog. Flag name + scope read aloud on focus.
- **Disabled state:** Inherited/global cells marked aria-disabled="true", not interactive

---

## Success Metrics

**KPI:** Task completion time for "Toggle flag X across N tenants"

- **Before (card grid):** ~N × 3 seconds (scroll + locate + click per tenant)
- **After (matrix):** ~5 seconds + N × 0.5 second (one scan + parallel clicks)
- **Target:** 70% faster for N ≥ 3 tenants

**Secondary:**
- Error rate on flag changes (should stay ≤ 0.1%)
- Time to discover inherited/global flags (should drop with visual badges)
- Bulk operation adoption rate (track `bulk-*` button clicks)

---

## Implementation Notes for Pixel

1. **Data model:** Fetch flags + tenants on page load. POST updates immediately (optimistic state).
2. **Template grouping:** Filter rows and columns by template selection before rendering. Don't hide columns, regenerate table view.
3. **Sheet state management:** Use React Router search params (`?tenant={tenantId}`) so sheet state persists on refresh.
4. **Sticky positioning:** Use CSS `position: sticky` (not JavaScript scroll handlers). Test horizontal scroll overlap.
5. **Bulk operations:** Batch up to 10 concurrent requests per bulk action. Show per-tenant progress in toast.
6. **Error handling:** Toast + cell state revert. No inline error messages in cells.
7. **Empty states:** If no flags or no tenants, show placeholder messaging ("No flags to display" / "No tenants configured").

---

## References

- **Brand:** `/docs/PRODUCT_IDENTITY.md`
- **Test ID Contract:** `/docs/TEST_ID_CONTRACT.md`
- **Stitch** (UI generation): Generated from this spec for key flows
- **Pixel** (implementation): Build components from spec + Stitch output

---

**Status:** Spec complete. Ready for Stitch design gen + Pixel implementation.

**Next:** Stitch generates matrix table layout + sheet panel → Pixel builds components → Centinela tests per TEST_ID_CONTRACT.md
