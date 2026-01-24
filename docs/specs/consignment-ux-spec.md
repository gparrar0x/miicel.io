# SKY-53: Consignment Management UX/UI Spec

**Version:** 1.0
**Status:** Design Ready for Pixel
**Last Updated:** 2025-01-16
**Designer:** Aurora

---

## Context

Artists manage physical works across multiple galleries/consignment points. Each work has a QR code linking to web storefront. System tracks which artworks are at which locations, status, duration, and performance metrics.

**Target User:** Artist managing 5-50 works across 2-10 consignment locations
**Key Metric:** Reduce time to locate artwork + visibility into performance by location
**Success:** Artist can assign/move/track status of works in <30 sec per action on mobile

---

## Design Tokens (Extend tokens.css)

### Consignment-Specific Colors
```css
/* Consignment Status Colors */
--color-status-gallery: #B8860B;         /* In gallery (gold/primary) */
--color-status-transit: #3B82F6;         /* In transit (blue) */
--color-status-sold: #10B981;            /* Sold (green) */
--color-status-pending: #F59E0B;         /* Awaiting placement (amber) */
--color-status-returned: #EF4444;        /* Returned/archived (red) */

/* Extended badge for consignment states */
--badge-gallery-bg: #FEF3C7;
--badge-gallery-text: #92400E;
--badge-gallery-border: #B8860B;

--badge-transit-bg: #DBEAFE;
--badge-transit-text: #1E3A8A;
--badge-transit-border: #3B82F6;

--badge-sold-bg: #DCFCE7;
--badge-sold-text: #166534;
--badge-sold-border: #10B981;

--badge-returned-bg: #FEE2E2;
--badge-returned-text: #991B1B;
--badge-returned-border: #EF4444;
```

### Component Tokens (Consignment-Specific)
```css
/* Location Card */
--location-card-height-mobile: 140px;
--location-card-height-tablet: 160px;
--location-card-thumbnail-size: 64px;

/* Timeline */
--timeline-dot-size: 12px;
--timeline-line-width: 2px;
--timeline-spacing: 16px;

/* Map Container */
--map-height-mobile: 240px;
--map-height-tablet: 320px;
--map-height-desktop: 400px;
```

---

## Navigation Map

```
Dashboard
├─ Consignments (new section)
│  ├─ Overview (default)
│  │  ├─ All Works Summary
│  │  └─ Performance by Location
│  ├─ Locations
│  │  ├─ List View
│  │  ├─ Map View
│  │  ├─ Add Location (modal)
│  │  ├─ Edit Location (modal)
│  │  └─ Location Detail
│  │     ├─ Works at Location (list)
│  │     ├─ Performance (metrics)
│  │     └─ Assign Work to Location (modal)
│  ├─ Works
│  │  ├─ List View (all works)
│  │  ├─ Work Detail
│  │  │  ├─ Assign Location
│  │  │  ├─ Timeline (movement history)
│  │  │  └─ Performance
│  │  └─ Batch Assign (modal)
│  └─ Reports
│     ├─ Performance by Location (table)
│     ├─ Artwork Timeline (exportable)
│     └─ Inventory Report

Sidebar Link: "Consignaciones" with icon (MapPin or Package)
```

---

## Wireframes & Flow Descriptions

### 1. Overview Tab (Dashboard Home for Consignments)

**Mobile Layout (< 640px):**
- Header: "Mis Consignaciones"
- Quick Stats Card (stacked):
  - Total Works: `24`
  - Locations: `5`
  - In Gallery: `18` (green badge)
  - Sold This Month: `3`
- CTA Buttons (full-width stack):
  - "Asignar Obra" (blue)
  - "Ver Ubicaciones" (secondary)
- Summary Cards (scrollable horizontal):
  - Top Location by Sales
  - Longest in Gallery (alert if >30 days)
  - Recent Movements (timeline preview)
- Empty State: Illustration + "No works assigned yet" + CTA

**Desktop Layout (≥ 1024px):**
- Header + Description
- Stats Grid (4 columns):
  - Total Works
  - Active Locations
  - Works in Gallery
  - Sold This Month
- Two-column section:
  - Left: "Rendimiento por Ubicación" (chart/table)
  - Right: "Movimientos Recientes" (timeline list)
- Full-width CTA bar at bottom

**Key Components:**
- `ConsignmentStatsCard` (extends `StatCard`)
- `LocationPerformanceChart` (bar chart)
- `MovementTimeline` (lightweight)
- `QuickActionPanel`

---

### 2. Locations Tab

#### 2.1 Locations List View

**Mobile:**
- Header: "Ubicaciones" + Add button (FAB or button)
- Search bar (filter by name)
- Card layout (vertical stack):
  ```
  [Thumbnail/Badge] Location Name
  City, Country
  [5 obras] [Ver detalles →]
  [Edit] [Delete] (swipe actions or menu)
  ```
- Empty state: "Agrega tu primera ubicación"

**Desktop:**
- Header + Add button (top right)
- Data table format:
  ```
  | Nombre | Ciudad | Obras | Últimas 30 días | Acciones |
  | Galería Luna | CABA | 5 | 2 vendidas | [...] |
  ```
- Filters: By city, by # works, by performance

**States:**
- Default: Clean list
- Loading: Skeleton cards
- Error: "No se pudieron cargar ubicaciones" + Retry
- Empty: Centered CTA

**Key Components:**
- `LocationCard` (clickable, swipe actions on mobile)
- `LocationList`
- `AddLocationModal`

---

#### 2.2 Map View

**Mobile:**
- Full-screen map
- Custom markers with location name + count of works
- Bottom sheet (collapsible):
  ```
  Selected Location Name
  [Works here: 5]
  [Tap to open detail]
  ```

**Desktop:**
- Sidebar on left (list of locations, searchable)
- Right: Map (responsive, center on selected)
- Click location → highlight on map + open detail

**Marker Design:**
- Standard pin icon + count badge
- Color coded: Gold (>2 works), Gray (1 work)
- Hover: Tooltip with location name + city

**Library:** Use Leaflet or Mapbox (check existing miicel.io setup)

---

#### 2.3 Location Detail Page

**URL:** `/dashboard/consignments/locations/[locationId]`

**Mobile:**
- Header: Back button + location name + menu (•••)
- Hero section:
  - Large map embed (height: 240px)
  - Location info card (name, address, city, contact)
- Edit/Delete buttons
- Tabs: "Obras" | "Desempeño"

**Tabs > Obras:**
- List of artworks at this location
- Column: Image thumbnail | Title | Price | Status | Actions
- Inline actions: Move to Location | Remove
- CTA: "Asignar Obra a esta ubicación"

**Tabs > Desempeño:**
- Time in Gallery (avg)
- Conversion Rate (% sold from this location)
- Revenue generated
- Chart: Sales trend (last 90 days)
- Chart: Avg time to sell

**Desktop:**
- Two-column layout:
  - Left (60%): Map + info
  - Right (40%): Tabs + data

---

### 3. Works Tab

#### 3.1 All Works List View

**Mobile:**
- Header: "Mis Obras"
- Filter/Sort pills: Status, Location, Sort by (newest, price, duration)
- Card layout (grid or list):
  ```
  [Thumbnail (1:1 aspect)]
  Title | Artist
  Price: $USD
  Status: [Badge] Location: [Name]
  [Actions menu]
  ```

**Desktop:**
- Data table format:
  ```
  | Imagen | Título | Precio | Estado | Ubicación | Tiempo | Acciones |
  ```
- Column sort + filter by status + export as CSV

**Card States:**
- `in_gallery`: Gold badge, show location
- `in_transit`: Blue badge, show "En tránsito a [Location]"
- `sold`: Green checkmark + price achieved
- `returned`: Gray, show date returned
- `pending`: Amber, "Sin ubicación asignada"

---

#### 3.2 Work Detail Page

**URL:** `/dashboard/consignments/works/[workId]`

**Mobile Stack (top to bottom):**
1. Large image (full width, 4:3 aspect)
2. Info card:
   - Title, Artist, Price
   - QR code (embeddable, tap to copy)
3. Status section:
   - Current status badge
   - Current location (if assigned)
   - Assigned since: [Date]
4. Timeline (read-only):
   - Vertical scroll: "Moved to [Location]" → "Date" → "By: [auto/user]"
5. Actions card (sticky on mobile):
   - "Cambiar Ubicación" (button)
   - "Marcar como Vendida" (button)
   - "Devolver" (secondary)
   - "Detalles Técnicos" (collapsible)

**Desktop Layout:**
- Two-column:
  - Left: Image + QR code
  - Right: Info + Status + Actions
  - Below: Timeline (horizontal scroll or vertical list)

**Key Components:**
- `WorkDetail`
- `WorkTimeline`
- `AssignLocationModal` (reusable)

---

#### 3.3 Assign/Move Work Modal

**Trigger:** From work detail or location detail

**Mobile Modal (full-screen slide-up):**
```
[Close] Asignar Obra [Done/OK]
═══════════════════════════════
Work: [Thumbnail] "Title"

Seleccionar Ubicación:
[Search field]
├─ Galería Luna (CABA) - 5 obras
├─ Café Frida (CABA) - 2 obras
└─ Estudio Privado - 1 obra

Status: ☐ En galería ☐ En tránsito ☐ Pending

Notas: [Text area - optional]
[Cancelar] [Guardar]
```

**Desktop Modal (centered, max-width 500px):**
- Similar layout
- Location list in dropdown + searchable

**Validation:**
- Location required
- Status required
- Warn if moving from sold → another (confirm)

**Success State:**
- Toast: "Obra asignada a [Location]"
- Timeline updated
- Redirect to work or stay on modal (user choice)

---

### 4. Reports Tab

#### 4.1 Performance by Location

**Report: Location Metrics**
```
Table (sortable, filterable):
┌─────────────────────────────────────────────────┐
│ Ubicación │ Obras │ Vendidas │ Tasa │ Ingresos │
├─────────────────────────────────────────────────┤
│ Galería Luna │ 12 │ 4 │ 33% │ $4,500 │
│ Café Frida │ 8 │ 2 │ 25% │ $1,200 │
└─────────────────────────────────────────────────┘
```

**Export Button:** CSV, PDF (with QR codes for works)

**Chart:** Bar chart (Conversion Rate by Location)

---

#### 4.2 Artwork Timeline Report

**View:** Filterable table of all artwork movements
```
Obra │ Ubicación Anterior │ Ubicación Nueva │ Fecha │ Duración
Title │ Galería Luna │ Café Frida │ 2025-01-15 │ 45 días
```

**Filter by:**
- Date range
- Work (searchable)
- From/To location

---

### 5. Component Library (for Pixel)

#### Core New Components

| Component | Props | Mobile | Desktop | States |
|-----------|-------|--------|---------|--------|
| `LocationCard` | name, city, workCount, thumbnail, onEdit, onDelete, onView | `140px` height, swipe actions | Card in table row | Default, Hover, Loading, Error |
| `WorkStatusBadge` | status (`in_gallery`, `in_transit`, `sold`, `returned`, `pending`), long | Color-coded, text | Inline badge | All statuses |
| `ConsignmentStatsCard` | title, value, icon, location | Full-width, stacked | 1/4 grid | Default, Hover |
| `LocationPerformanceChart` | data: `{ location, rate, revenue }[]` | Vertical scroll | Side-by-side bars | Loading state |
| `WorkTimeline` | events: `{ date, action, location, user }[]` | Vertical line | Horizontal or vertical | Compact/expanded |
| `AssignWorkModal` | workId, currentLocation, onSave, onCancel | Full-screen slide | Centered modal | Submitting state |
| `LocationMap` | locations: `{ id, name, lat, lng, workCount }[]`, onSelect | Interactive, pinch zoom | Pan & zoom | Loading, Error |
| `WorkCard` (grid) | image, title, price, status, location, onAction | 1 column, image 1:1 | 2-3 columns | Hover, Selected |
| `MovementTimeline` (preview) | events: `{ date, action }[]`, limit: 3 | Scrollable | Fixed height | Default |

---

## Information Architecture

### Data Model (Supabase Tables Reference)

**Existing tables to extend:**
- `products` (artwork = product)
- `tenants` (artist = tenant) — *Note: miicel.io uses multi-tenant model*

**New tables:**
```sql
-- consignment_locations
id, tenant_id, name, city, country, latitude, longitude,
created_at, updated_at

-- consignment_assignments
id, work_id, location_id, status (in_gallery/in_transit/returned),
assigned_date, unassigned_date, notes, created_at, updated_at

-- consignment_movements (audit log)
id, work_id, from_location_id, to_location_id, status_before,
status_after, moved_at, moved_by, notes
```

---

## Responsive Behavior

### Mobile-First Approach (< 640px)

- **Vertical stacking** of all sections
- **Card-based layout** (list not table)
- **Swipe actions** (right: edit/delete)
- **Bottom sheet modals** for forms
- **Sticky header** on scroll
- **FAB or top CTA** for add actions
- **Thumbs-up tap targets:** 48px minimum

### Tablet (640px - 1024px)

- **Grid layout:** 2 columns for works
- **Sidebar** for location filter (if space)
- **Modals** slightly larger
- **Data tables** start appearing

### Desktop (≥ 1024px)

- **Sidebar navigation** integrated
- **Full data tables**
- **Side-by-side charts**
- **Wider modals** (max-width: 600px)
- **Map widget** prominent

---

## Empty States

### No Works
```
[Illustration: Empty gallery]
Aún no tienes obras asignadas

Empieza creando una ubicación y luego
asigna tus obras para comenzar a gestionar
tu consignación.

[Crear Ubicación] [Ver Guía]
```

### No Locations
```
[Illustration: Map marker]
Crea tu primera ubicación

Vincula galerías, cafés o espacios
donde se exhiben tus obras.

[Añadir Ubicación]
```

### No Movements
```
Aún no hay movimientos registrados.
Las asignaciones aparecerán aquí.
```

---

## Error States & Validation

### Form Validation (Assign Work Modal)

| Field | Rule | Error Message |
|-------|------|---|
| Location | Required | "Selecciona una ubicación" |
| Status | Required | "Selecciona un estado" |
| Notes | Optional | Max 500 chars |

### Network Errors

```
⚠️ Error al cargar ubicaciones

Verifica tu conexión e intenta de nuevo.
[Reintentar] [Ir al inicio]
```

### Permission Errors

```
🔒 No tienes permisos para editar esta ubicación

Contacta al administrador de la plataforma.
```

---

## Loading States

- **Skeleton cards** for location lists (4 cards on desktop, 1 on mobile)
- **Pulse animation** on stat cards
- **Map placeholder** (gray box, then map loads)
- **Timeline dots fade in** progressively

**CSS Pattern:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.skeleton { animation: pulse 2s infinite; }
```

---

## Accessibility

### WCAG AA Compliance

- **Color:** Status badges have text + icon (not color-only)
- **Contrast:** All text ≥ 4.5:1 on buttons, 3:1 on secondary
- **Keyboard Navigation:** Tab through list, Enter to select, Escape to close modal
- **Labels:** All form fields have `<label>` or `aria-label`
- **Icons + Text:** Primary CTAs have both icon + text
- **Focus Visible:** All interactive elements ≥ 3px focus ring

### Test IDs (for Sentinela)

```tsx
data-testid="consignments-overview"
data-testid="location-card-{locationId}"
data-testid="work-card-{workId}"
data-testid="assign-work-modal"
data-testid="location-detail-{locationId}"
data-testid="work-timeline"
data-testid="status-badge-{status}"
data-testid="add-location-button"
data-testid="move-work-button"
```

---

## Motion & Transitions

### Micro-interactions

| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| Open modal | Slide up + fade in | 300ms | `ease-out` |
| Close modal | Slide down + fade out | 200ms | `ease-in` |
| Assign work | Pulse on success toast | 500ms | `ease-out` |
| Location marker (map) | Scale + fade in | 400ms | `ease-out` |
| Timeline entry appear | Fade in + slide left | 200ms | `ease-out` |

### CSS Animations
```css
/* Modal entrance */
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.modal { animation: slide-up 300ms var(--ease-out); }

/* Success pulse */
@keyframes pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

---

## Success Metrics

### Usability KPIs

- **Task Completion Rate:** Assign work in <1 min (mobile: ≤2 min)
- **Error Rate:** <5% form validation failures
- **Location Lookup Time:** Search + select in <20 sec
- **Performance:** Page load <2s (mobile 3G), LCP <1.5s

### Business Metrics

- **Adoption:** 70%+ of artists use location tracking within 30 days
- **Engagement:** >3 location assignments per artist per month
- **Feature Usage:** 60%+ view reports monthly
- **Satisfaction:** >4.2/5 on feature survey

---

## Pixel Handoff Checklist

- [ ] Design file in Figma (link TBA)
- [ ] Color tokens added to `styles/tokens.css`
- [ ] Component library created (`components/consignments/`)
- [ ] Routes added to `app/[locale]/[tenantId]/dashboard/consignments/`
- [ ] TypeScript interfaces defined (`lib/types/consignment.ts`)
- [ ] Test IDs mapped (`tests/e2e/locators/consignments.locators.ts`)
- [ ] API route skeletons added (`app/api/consignments/`)
- [ ] I18n keys added to `messages/es.json` and `messages/en.json`

---

## Sentinela Handoff Checklist

- [ ] E2E test suite: Consignment CRUD flows
- [ ] Test data generators for locations + works
- [ ] Mock data for empty/error states
- [ ] Accessibility audit (WCAG AA)
- [ ] Mobile responsiveness tests (< 640px, 640-1024px, >1024px)
- [ ] Performance benchmarks (LCP, CLS)

---

## Open Questions for Clarification

1. **Map Provider:** Leaflet, Mapbox, or Google Maps? (Check existing miicel.io dependencies)
2. **Bulk Operations:** Support batch move/assign? (v1 or v2)
3. **QR Code Generation:** Who owns? (Artist or platform)?
4. **Reporting Export:** PDF with images or CSV data-only?
5. **Notifications:** Alert artist when work assigned/moved? (Push, Email, In-app)
6. **Photo Upload:** Can artist upload location photos (exterior/interior)?

---

## Next Steps (Mentat)

1. **Pixel:** Build components per `Component Library` table
2. **Kokoro:** Design DB schema + API routes (`/consignments`, `/locations`, `/assignments`)
3. **Sentinela:** Create test suite + test data generators
4. **Hermes:** Setup staging environment variables (map provider, etc.)
5. **Lumen:** Plan SEO for public artist gallery (share artwork + location metadata)

---

**Delivered by:** Aurora (Design)
**Review & Approval:** [Pending]
**Implementation Owner:** Pixel
**QA Owner:** Sentinela
