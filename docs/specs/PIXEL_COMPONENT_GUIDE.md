# Pixel Component Implementation Guide: Consignment Management (SKY-53)

**Target:** React/Next.js Components for consignment dashboard
**Design System:** Tailwind + Design Tokens (styles/tokens.css)
**Status Badges:** Use existing `StatusBadge` + new consignment variants
**Test IDs:** All interactive elements must have `data-testid`

---

## Component Hierarchy

```
ConsignmentLayout
├── ConsignmentNav (sidebar or tabs)
│   ├── Overview
│   ├── Locations
│   ├── Works
│   └── Reports
├── ConsignmentOverview (tab: default)
│   ├── StatsGrid (4 cards)
│   ├── PerformanceChart
│   └── MovementTimeline (preview)
├── LocationsPage
│   ├── LocationViewToggle (list/map)
│   ├── LocationList
│   │   └── LocationCard (repeating)
│   └── LocationMap (interactive)
├── WorksPage
│   ├── WorkFilter/Sort
│   └── WorkGrid
│       └── WorkCard (repeating)
└── ReportsPage
    ├── PerformanceReport
    └── TimelineReport
```

---

## Core Components (File-by-File)

### 1. `components/consignments/StatusBadge.tsx`

**Extends existing StatusBadge for consignment statuses**

```tsx
import { ConsignmentStatus } from '@/lib/types/consignment'

type ConsignmentStatusBadgeProps = {
  status: ConsignmentStatus
  location?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

// Maps status to color class, icon, and label
export function ConsignmentStatusBadge({
  status,
  location,
  size = 'md',
  showIcon = true,
}: ConsignmentStatusBadgeProps) {
  const config = {
    in_gallery: { class: 'badge-gallery', icon: 'MapPin', label: 'En galería' },
    in_transit: { class: 'badge-transit', icon: 'Truck', label: 'En tránsito' },
    sold: { class: 'badge-sold', icon: 'CheckCircle', label: 'Vendida' },
    returned: { class: 'badge-returned', icon: 'RotateCcw', label: 'Devuelta' },
    pending: { class: 'badge-pending', icon: 'AlertCircle', label: 'Pendiente' },
  }

  const { class: badgeClass, icon: Icon, label } = config[status]

  return (
    <span className={`badge-base ${badgeClass}`} data-testid={`status-badge-${status}`}>
      {showIcon && <Icon size={16} className="inline mr-1" />}
      {label}
      {location && <span className="ml-2 text-xs">@ {location}</span>}
    </span>
  )
}
```

**Styles (in consignment-design-tokens.css):**
```css
.badge-base {
  display: inline-flex;
  align-items: center;
  height: var(--badge-gallery-height);
  padding: var(--badge-gallery-padding);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--font-weight-medium);
}
```

**Usage:**
```tsx
<ConsignmentStatusBadge status="in_gallery" location="Galería Luna" />
<ConsignmentStatusBadge status="sold" showIcon={true} />
```

**Test Coverage (Sentinela):**
```tsx
// Should render status label
// Should render icon if showIcon=true
// Should show location if provided
// Should apply correct CSS class by status
```

---

### 2. `components/consignments/LocationCard.tsx`

**Reusable card for location in list/grid view**

```tsx
import { Swipe } from '@/components/ui/swipe' // or implement swipe actions
import { ConsignmentLocation, LocationWithMetrics } from '@/lib/types/consignment'
import { MapPin, Pencil, Trash2 } from 'lucide-react'

type LocationCardProps = {
  location: LocationWithMetrics
  onEdit: (location: ConsignmentLocation) => void
  onDelete: (locationId: string) => void
  onView: (locationId: string) => void
}

export function LocationCard({ location, onEdit, onDelete, onView }: LocationCardProps) {
  return (
    <div
      className="
        bg-card border border-border rounded-lg p-3
        hover:shadow-md transition-shadow cursor-pointer
        md:p-4
      "
      onClick={() => onView(location.id)}
      data-testid={`location-card-${location.id}`}
    >
      {/* Header: Name + City */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground line-clamp-1">{location.name}</h3>
          <p className="text-xs text-muted-foreground">{location.city}, {location.country}</p>
        </div>
        {/* Actions Menu (mobile: swipe, desktop: menu) */}
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(location)
            }}
            className="p-2 hover:bg-secondary rounded transition-colors"
            data-testid={`edit-location-${location.id}`}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`¿Eliminar ${location.name}?`)) {
                onDelete(location.id)
              }
            }}
            className="p-2 hover:bg-destructive/10 rounded transition-colors"
            data-testid={`delete-location-${location.id}`}
          >
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-3 text-xs">
        <div className="flex items-center gap-1">
          <MapPin size={14} className="text-muted-foreground" />
          <span>{location.worksCount} obras</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium">{location.conversionRate}% vendidas</span>
        </div>
      </div>

      {/* Footer: Revenue */}
      <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Total ventas</span>
        <span className="font-semibold text-accent-primary">
          ${location.totalRevenue.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
```

**Mobile Layout:**
- Full width
- Thumbnail on left (if available)
- Swipe right → delete, left → edit

**Desktop Layout:**
- Fixed width in grid (3-4 cols)
- Hover effect → slight lift + shadow

---

### 3. `components/consignments/LocationList.tsx`

**List wrapper with search, filter, pagination**

```tsx
'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import { LocationCard } from './LocationCard'
import { useConsignmentLocations } from '@/lib/hooks/useConsignmentLocations'
import { LocationWithMetrics } from '@/lib/types/consignment'

type LocationListProps = {
  tenantId: string
  onLocationSelect: (locationId: string) => void
  onEdit: (location) => void
  onDelete: (locationId: string) => void
}

export function LocationList({
  tenantId,
  onLocationSelect,
  onEdit,
  onDelete,
}: LocationListProps) {
  const t = useTranslations('Consignments')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState<string | null>(null)

  const { locations, loading, error } = useConsignmentLocations(tenantId)

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCity = !filterCity || loc.city === filterCity
      return matchSearch && matchCity
    })
  }, [locations, searchTerm, filterCity])

  const cities = useMemo(() => {
    return [...new Set(locations.map((l) => l.city))]
  }, [locations])

  if (loading) {
    return <LocationListSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{t('error_loading_locations')}</p>
        <button className="mt-4 text-accent-primary hover:underline">
          {t('retry')}
        </button>
      </div>
    )
  }

  if (!locations.length) {
    return <LocationListEmpty />
  }

  return (
    <div className="space-y-4" data-testid="location-list">
      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder={t('search_location')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary"
            data-testid="location-search"
          />
        </div>

        {/* City Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setFilterCity(filterCity === city ? null : city)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterCity === city
                  ? 'bg-accent-primary text-white'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
              data-testid={`city-filter-${city}`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="location-grid">
        {filteredLocations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onView={onLocationSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {!filteredLocations.length && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('no_locations_found')}</p>
        </div>
      )}
    </div>
  )
}

function LocationListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="bg-skeleton rounded-lg h-40 animate-pulse"
            data-testid={`location-skeleton-${i}`}
          />
        ))}
    </div>
  )
}

function LocationListEmpty() {
  return (
    <div className="text-center py-12">
      {/* Illustration SVG */}
      <h3 className="mt-4 font-semibold text-foreground">
        Aún no tienes ubicaciones registradas
      </h3>
      <p className="text-muted-foreground text-sm">
        Crea tu primera ubicación para empezar a gestionar tus consignaciones
      </p>
    </div>
  )
}
```

---

### 4. `components/consignments/WorkStatusBadge.tsx`

**Compact badge for work status on card/list**

```tsx
import { ConsignmentStatus } from '@/lib/types/consignment'
import {
  Package,
  MapPin,
  CheckCircle,
  AlertCircle,
  Truck,
} from 'lucide-react'

type WorkStatusBadgeProps = {
  status: ConsignmentStatus
  size?: 'sm' | 'md'
}

export function WorkStatusBadge({ status, size = 'md' }: WorkStatusBadgeProps) {
  const iconSize = size === 'sm' ? 12 : 14
  const config = {
    in_gallery: {
      bgColor: 'bg-badge-gallery-bg',
      textColor: 'text-badge-gallery-text',
      borderColor: 'border-badge-gallery-border',
      icon: MapPin,
      label: 'En galería',
    },
    in_transit: {
      bgColor: 'bg-badge-transit-bg',
      textColor: 'text-badge-transit-text',
      borderColor: 'border-badge-transit-border',
      icon: Truck,
      label: 'En tránsito',
    },
    sold: {
      bgColor: 'bg-badge-sold-bg',
      textColor: 'text-badge-sold-text',
      borderColor: 'border-badge-sold-border',
      icon: CheckCircle,
      label: 'Vendida',
    },
    returned: {
      bgColor: 'bg-badge-returned-bg',
      textColor: 'text-badge-returned-text',
      borderColor: 'border-badge-returned-border',
      icon: Package,
      label: 'Devuelta',
    },
    pending: {
      bgColor: 'bg-badge-pending-bg',
      textColor: 'text-badge-pending-text',
      borderColor: 'border-badge-pending-border',
      icon: AlertCircle,
      label: 'Pendiente',
    },
  }

  const {
    bgColor,
    textColor,
    borderColor,
    icon: Icon,
    label,
  } = config[status]

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
        border ${bgColor} ${textColor} ${borderColor}
      `}
      data-testid={`work-status-${status}`}
    >
      <Icon size={iconSize} />
      {label}
    </span>
  )
}
```

---

### 5. `components/consignments/ConsignmentTimeline.tsx`

**Vertical timeline of work movements**

```tsx
import { MovementTimeline } from '@/lib/types/consignment'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type ConsignmentTimelineProps = {
  movements: MovementTimeline[]
  compact?: boolean
}

export function ConsignmentTimeline({
  movements,
  compact = false,
}: ConsignmentTimelineProps) {
  return (
    <div className="space-y-4" data-testid="consignment-timeline">
      {movements.map((movement, idx) => (
        <div
          key={movement.id}
          className="flex gap-3"
          data-testid={`timeline-event-${movement.id}`}
        >
          {/* Dot */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-3 h-3 rounded-full border-2
                ${
                  idx === 0
                    ? 'bg-accent-primary border-accent-primary'
                    : 'bg-white border-border'
                }
              `}
              data-testid={`timeline-dot-${idx}`}
            />
            {idx < movements.length - 1 && (
              <div className="w-0.5 h-12 bg-timeline-line-color mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="pb-4">
            <p className="font-medium text-foreground">
              {movement.status_after === 'sold'
                ? `Vendida en ${movement.to_location_name}`
                : `Enviada a ${movement.to_location_name}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(movement.moved_at), 'PPP', { locale: es })}
            </p>
            {movement.notes && (
              <p className="text-xs text-foreground/70 mt-2">{movement.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Form Components

### 6. `components/consignments/AssignWorkModal.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ConsignmentStatus } from '@/lib/types/consignment'
import { Loader2, X } from 'lucide-react'

type AssignWorkModalProps = {
  workId: string
  workTitle: string
  currentLocation?: { id: string; name: string }
  locations: Array<{ id: string; name: string; city: string }>
  onSave: (locationId: string, status: ConsignmentStatus, notes?: string) => Promise<void>
  onClose: () => void
}

export function AssignWorkModal({
  workId,
  workTitle,
  currentLocation,
  locations,
  onSave,
  onClose,
}: AssignWorkModalProps) {
  const t = useTranslations('Consignments')
  const [selectedLocationId, setSelectedLocationId] = useState(
    currentLocation?.id || ''
  )
  const [status, setStatus] = useState<ConsignmentStatus>('in_gallery')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!selectedLocationId) {
      setError(t('location_required'))
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(selectedLocationId, status, notes)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_saving'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
      data-testid="assign-work-modal"
    >
      <div className="
        bg-background w-full md:max-w-md rounded-t-lg md:rounded-lg
        shadow-lg overflow-hidden max-h-[90vh] md:max-h-auto
        md:p-6 p-4 space-y-4
      ">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t('assign_work')}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded"
            data-testid="close-modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Work Info */}
        <div className="p-3 bg-secondary rounded text-sm">
          <p className="text-muted-foreground">{t('work')}</p>
          <p className="font-medium">{workTitle}</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Location Select */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('select_location')} *
            </label>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="
                w-full px-3 py-2 border border-border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-accent-primary
              "
              data-testid="location-select"
            >
              <option value="">{t('choose_location')}</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.city})
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('status')} *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ConsignmentStatus)}
              className="
                w-full px-3 py-2 border border-border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-accent-primary
              "
              data-testid="status-select"
            >
              <option value="in_gallery">En galería</option>
              <option value="in_transit">En tránsito</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('notes')} ({t('optional')})
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('add_note')}
              maxLength={500}
              className="
                w-full px-3 py-2 border border-border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-accent-primary
                resize-none h-20 text-sm
              "
              data-testid="notes-textarea"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {notes.length}/500
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80"
            data-testid="cancel-button"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="
              flex-1 px-4 py-2 bg-accent-primary text-white rounded-lg
              hover:bg-accent-hover disabled:opacity-50
              flex items-center justify-center gap-2
            "
            data-testid="save-button"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## Hooks (lib/hooks/)

### 7. `useConsignmentLocations.ts`

```tsx
import { useCallback, useEffect, useState } from 'react'
import { ConsignmentLocation, UseConsignmentLocationsReturn } from '@/lib/types/consignment'

export function useConsignmentLocations(tenantId: string): UseConsignmentLocationsReturn {
  const [locations, setLocations] = useState<ConsignmentLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLocations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/consignments/locations?tenantId=${tenantId}`
      )
      if (!res.ok) throw new Error('Failed to fetch locations')
      const data = await res.json()
      setLocations(data.items || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
    createLocation: async (data) => { /* ... */ },
    updateLocation: async (data) => { /* ... */ },
    deleteLocation: async (id) => { /* ... */ },
  }
}
```

---

## Test ID Contract (Sentinela)

```typescript
// consignments/overview
data-testid="consignments-overview"
data-testid="stats-card-total-works"
data-testid="stats-card-active-locations"
data-testid="stats-card-sold-month"

// locations
data-testid="location-card-{locationId}"
data-testid="location-search"
data-testid="city-filter-{city}"
data-testid="edit-location-{locationId}"
data-testid="delete-location-{locationId}"

// works
data-testid="work-card-{workId}"
data-testid="work-status-{status}"
data-testid="assign-work-button-{workId}"
data-testid="move-work-button-{workId}"

// modals
data-testid="assign-work-modal"
data-testid="location-select"
data-testid="status-select"
data-testid="save-button"
data-testid="cancel-button"

// timeline
data-testid="consignment-timeline"
data-testid="timeline-event-{movementId}"
data-testid="timeline-dot-{index}"
```

---

## CSS Class Strategy

**Utility Classes (add to globals.css or consignment-design-tokens.css):**

```css
/* Status badge base */
.badge-gallery { @apply bg-[var(--badge-gallery-bg)] text-[var(--badge-gallery-text)] border border-[var(--badge-gallery-border)]; }
.badge-transit { @apply bg-[var(--badge-transit-bg)] text-[var(--badge-transit-text)] border border-[var(--badge-transit-border)]; }
.badge-sold { @apply bg-[var(--badge-sold-bg)] text-[var(--badge-sold-text)] border border-[var(--badge-sold-border)]; }
.badge-returned { @apply bg-[var(--badge-returned-bg)] text-[var(--badge-returned-text)] border border-[var(--badge-returned-border)]; }
.badge-pending { @apply bg-[var(--badge-pending-bg)] text-[var(--badge-pending-text)] border border-[var(--badge-pending-border)]; }

/* Timeline */
.timeline-line { @apply w-[var(--timeline-line-width)] bg-[var(--timeline-line-color)]; }
.timeline-dot { @apply w-[var(--timeline-dot-size)] h-[var(--timeline-dot-size)] rounded-full; }

/* Maps */
.map-container { @apply rounded-[var(--map-border-radius)] shadow-[var(--map-box-shadow)] overflow-hidden; }
```

---

## State Management Pattern

**Use React hooks + Supabase client (not Redux/Zustand for MVP)**

```tsx
// In component:
const [locations, setLocations] = useState<ConsignmentLocation[]>([])
const supabase = createClient()

useEffect(() => {
  const fetch = async () => {
    const { data } = await supabase
      .from('consignment_locations')
      .select('*')
      .eq('tenant_id', tenantId)
    setLocations(data || [])
  }
  fetch()
}, [tenantId])
```

---

## Error Handling & Loading

**For all async operations:**

```tsx
const [state, setState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
const [error, setError] = useState<string | null>(null)

// Loading state → show skeleton
// Error state → show error message + retry button
// Success state → show toast + redirect
```

---

## Responsive Strategy (Mobile-First)

**Default (< 640px):**
- Full-width cards
- Single column grid
- Bottom sheet modals
- Swipe actions for delete

**Tablet (640px - 1024px):**
- 2 column grid
- Sidebar appears
- Modals centered

**Desktop (≥ 1024px):**
- 3 column grid for works
- Modals max-width: 600px
- Full sidebar navigation

---

## Performance Checklist

- [ ] Images lazy-loaded (use Next.js Image component)
- [ ] Lists virtualized if >100 items (use react-window)
- [ ] API responses paginated
- [ ] Use SWR or React Query for caching (optional for MVP)
- [ ] Debounce search input (300ms)
- [ ] Memoize expensive computations (useMemo)

---

**Ready for implementation. Ask Kokoro for API routes + DB schema.**
