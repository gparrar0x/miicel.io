/**
 * SKY-53: Consignment Management Types
 * TypeScript interfaces for consignment domain
 *
 * Used by: API routes, components, hooks, database schemas
 * Maintained by: Backend (Kokoro) + Frontend (Pixel)
 */

/* ========== ENUMS ========== */

export enum ConsignmentStatus {
  /** Artwork is currently at a consignment location */
  IN_GALLERY = 'in_gallery',
  /** Artwork is being transported between locations */
  IN_TRANSIT = 'in_transit',
  /** Artwork has been sold */
  SOLD = 'sold',
  /** Artwork has been returned to artist */
  RETURNED = 'returned',
  /** Artwork is awaiting assignment to a location */
  PENDING = 'pending',
}

export enum LocationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

/* ========== LOCATION TYPES ========== */

/** Consignment location (gallery, café, studio, etc.) */
export interface ConsignmentLocation {
  id: string
  tenant_id: string
  name: string
  description?: string
  city: string
  country: string
  address?: string
  latitude?: number
  longitude?: number
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  status: LocationStatus
  created_at: string
  updated_at: string
}

export interface LocationWithMetrics extends ConsignmentLocation {
  worksCount: number
  soldCount: number
  conversionRate: number // percentage
  totalRevenue: number
  averageTimeInGallery: number // days
}

export interface LocationPerformance {
  location_id: string
  location_name: string
  total_works_assigned: number
  total_works_sold: number
  conversion_rate: number
  total_revenue: number
  average_days_in_gallery: number
  recent_sales_count_30d: number // last 30 days
  recent_revenue_30d: number // last 30 days
}

/* ========== ASSIGNMENT TYPES ========== */

/** Links artwork to a location + status */
export interface ConsignmentAssignment {
  id: string
  work_id: string // FK to products.id
  location_id: string // FK to consignment_locations.id
  tenant_id: string
  status: ConsignmentStatus
  assigned_date: string // ISO 8601
  unassigned_date?: string // ISO 8601, null if still assigned
  notes?: string
  created_at: string
  updated_at: string
}

export interface AssignmentWithDetails extends ConsignmentAssignment {
  work: {
    id: string
    title: string
    price: number
    image_url?: string
  }
  location: {
    id: string
    name: string
    city: string
  }
}

/* ========== MOVEMENT TYPES ========== */

/** Audit log for artwork movements */
export interface ConsignmentMovement {
  id: string
  work_id: string
  tenant_id: string
  from_location_id?: string // null if initial assignment
  to_location_id: string
  status_before: ConsignmentStatus
  status_after: ConsignmentStatus
  moved_at: string // ISO 8601
  moved_by: string // user_id or 'system'
  notes?: string
  created_at: string
}

export interface MovementTimeline extends ConsignmentMovement {
  from_location_name?: string
  to_location_name: string
}

/* ========== WORK/ARTWORK TYPES ========== */

/** Extended product type for consignment context */
export interface ConsignmentWork {
  id: string
  title: string
  artist_id: string
  price: number
  image_url?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface WorkWithConsignmentStatus extends ConsignmentWork {
  currentAssignment?: AssignmentWithDetails
  status: ConsignmentStatus
  currentLocation?: {
    id: string
    name: string
    city: string
  }
  assigned_since?: string
  days_in_current_location?: number
}

/* ========== API REQUEST/RESPONSE TYPES ========== */

export interface CreateLocationRequest {
  name: string
  description?: string
  city: string
  country: string
  address?: string
  latitude?: number
  longitude?: number
  contact_name?: string
  contact_email?: string
  contact_phone?: string
}

export interface UpdateLocationRequest extends Partial<CreateLocationRequest> {
  id: string
}

export interface CreateAssignmentRequest {
  work_id: string
  location_id: string
  status?: ConsignmentStatus
  notes?: string
}

export interface UpdateAssignmentRequest {
  id: string
  location_id?: string
  status?: ConsignmentStatus
  notes?: string
}

export interface AssignWorkToLocationRequest {
  work_id: string
  location_id: string
  status: ConsignmentStatus
  notes?: string
}

export interface MoveWorkRequest {
  from_location_id?: string
  to_location_id: string
  status: ConsignmentStatus
  notes?: string
}

/* ========== DASHBOARD/SUMMARY TYPES ========== */

export interface ConsignmentOverviewStats {
  total_works: number
  active_locations: number
  works_in_gallery: number
  works_sold_this_month: number
  revenue_this_month: number
  revenue_last_month: number
}

export interface ConsignmentOverview extends ConsignmentOverviewStats {
  top_location_by_sales?: {
    location_id: string
    location_name: string
    revenue: number
  }
  longest_in_gallery?: {
    work_id: string
    work_title: string
    days: number
    location_name: string
  }
  recent_movements: MovementTimeline[]
}

/* ========== FILTER & SORT TYPES ========== */

export interface LocationListFilters {
  search?: string
  city?: string
  status?: LocationStatus
  min_works?: number
}

export interface WorkListFilters {
  search?: string
  status?: ConsignmentStatus
  location_id?: string
  created_after?: string
  created_before?: string
}

export enum WorkSortBy {
  NEWEST = 'created_at_desc',
  OLDEST = 'created_at_asc',
  PRICE_HIGH = 'price_desc',
  PRICE_LOW = 'price_asc',
  DURATION = 'duration_desc',
}

/* ========== REPORT TYPES ========== */

export interface LocationPerformanceReport {
  location_id: string
  location_name: string
  city: string
  works_assigned_total: number
  works_sold: number
  works_returned: number
  works_in_gallery: number
  conversion_rate: number
  total_revenue: number
  average_days_to_sell: number
  last_updated: string
}

export interface ArtworkTimelineReport {
  work_id: string
  work_title: string
  artist_id: string
  total_movements: number
  current_status: ConsignmentStatus
  current_location?: string
  first_assigned: string
  last_updated: string
  movements: Array<{
    date: string
    from_location?: string
    to_location: string
    status: ConsignmentStatus
  }>
}

/* ========== ERROR TYPES ========== */

export interface ConsignmentError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export class LocationNotFoundError extends Error {
  constructor(locationId: string) {
    super(`Location not found: ${locationId}`)
    this.name = 'LocationNotFoundError'
  }
}

export class InvalidAssignmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidAssignmentError'
  }
}

export class DuplicateAssignmentError extends Error {
  constructor(workId: string, locationId: string) {
    super(`Work ${workId} is already assigned to location ${locationId}`)
    this.name = 'DuplicateAssignmentError'
  }
}

/* ========== UI COMPONENT PROPS TYPES ========== */

export interface LocationCardProps {
  location: LocationWithMetrics
  onEdit?: (location: ConsignmentLocation) => void
  onDelete?: (locationId: string) => void
  onView?: (locationId: string) => void
}

export interface WorkCardProps {
  work: WorkWithConsignmentStatus
  onAssign?: (workId: string) => void
  onMove?: (workId: string) => void
  onClick?: (workId: string) => void
}

export interface WorkStatusBadgeProps {
  status: ConsignmentStatus
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export interface TimelineEventProps {
  movement: MovementTimeline
  isActive?: boolean
  isLast?: boolean
}

export interface AssignWorkModalProps {
  workId: string
  currentLocationId?: string
  onSave: (data: AssignWorkToLocationRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface LocationDetailProps {
  locationId: string
  tenantId: string
}

/* ========== HOOK RETURN TYPES ========== */

export interface UseConsignmentLocationsReturn {
  locations: ConsignmentLocation[]
  loading: boolean
  error: ConsignmentError | null
  refetch: () => Promise<void>
  createLocation: (data: CreateLocationRequest) => Promise<ConsignmentLocation>
  updateLocation: (data: UpdateLocationRequest) => Promise<ConsignmentLocation>
  deleteLocation: (locationId: string) => Promise<void>
}

export interface UseConsignmentAssignmentsReturn {
  assignments: AssignmentWithDetails[]
  loading: boolean
  error: ConsignmentError | null
  refetch: () => Promise<void>
  assignWork: (data: CreateAssignmentRequest) => Promise<ConsignmentAssignment>
  moveWork: (workId: string, data: MoveWorkRequest) => Promise<ConsignmentMovement>
  unassignWork: (assignmentId: string) => Promise<void>
}

export interface UseWorkConsignmentStatusReturn {
  work: WorkWithConsignmentStatus | null
  loading: boolean
  error: ConsignmentError | null
  refetch: () => Promise<void>
  updateStatus: (status: ConsignmentStatus, locationId?: string) => Promise<void>
}

/* ========== PAGINATION & LIST RESPONSE TYPES ========== */

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  has_next: boolean
}

export interface LocationListResponse extends PaginatedResponse<ConsignmentLocation> {}

export interface WorkListResponse extends PaginatedResponse<WorkWithConsignmentStatus> {}

export interface MovementListResponse extends PaginatedResponse<MovementTimeline> {}

/* ========== EXPORT TYPES ========== */

export enum ExportFormat {
  CSV = 'csv',
  PDF = 'pdf',
  JSON = 'json',
}

export interface ExportRequest {
  type: 'locations' | 'works' | 'movements'
  format: ExportFormat
  filters?: Record<string, unknown>
}

export interface ExportResponse {
  download_url: string
  filename: string
  format: ExportFormat
}

/**
 * IMPLEMENTATION GUIDE FOR KOKORO:
 *
 * 1. Database Schema Alignment:
 *    - Map these types to Supabase tables
 *    - Use strict row-level security (RLS) policies
 *    - Indexes on: tenant_id, work_id, location_id, status
 *
 * 2. API Route Mapping:
 *    POST   /api/consignments/locations           → createLocation
 *    GET    /api/consignments/locations           → listLocations (paginated)
 *    GET    /api/consignments/locations/[id]      → getLocation
 *    PUT    /api/consignments/locations/[id]      → updateLocation
 *    DELETE /api/consignments/locations/[id]      → deleteLocation
 *
 *    POST   /api/consignments/assignments         → assignWork
 *    GET    /api/consignments/assignments         → listAssignments
 *    GET    /api/consignments/assignments/[id]    → getAssignment
 *    PUT    /api/consignments/assignments/[id]    → updateAssignment
 *    DELETE /api/consignments/assignments/[id]    → unassignWork
 *    POST   /api/consignments/assignments/move    → moveWork
 *
 *    GET    /api/consignments/works              → listWorks (with status)
 *    GET    /api/consignments/works/[id]         → getWorkWithStatus
 *
 *    GET    /api/consignments/overview           → getOverviewStats
 *    GET    /api/consignments/reports/locations  → getLocationPerformance
 *    GET    /api/consignments/reports/timeline   → getArtworkTimeline
 *
 * 3. Validation Rules:
 *    - Location name: required, min 3 chars, max 100 chars
 *    - Location city/country: required
 *    - Coordinates: optional, but if provided must be valid lat/lng
 *    - Status transitions: Only specific transitions allowed (see state machine)
 *    - Can't assign same work to multiple locations simultaneously
 *
 * 4. State Machine for ConsignmentStatus:
 *    PENDING → IN_GALLERY → [SOLD | RETURNED]
 *    PENDING → IN_GALLERY → IN_TRANSIT → IN_GALLERY (can revisit)
 *    IN_GALLERY → SOLD (final)
 *    Any → RETURNED (archive)
 *
 * 5. Audit Trail:
 *    - All movements logged in consignment_movements
 *    - Track moved_by user + timestamp
 *    - Enable artist to see full history
 */

/**
 * IMPLEMENTATION GUIDE FOR PIXEL:
 *
 * 1. Component File Structure:
 *    components/consignments/
 *    ├── LocationCard.tsx
 *    ├── LocationList.tsx
 *    ├── LocationForm.tsx (create/edit modal)
 *    ├── WorkCard.tsx
 *    ├── WorkList.tsx
 *    ├── WorkStatusBadge.tsx
 *    ├── AssignWorkModal.tsx
 *    ├── ConsignmentTimeline.tsx
 *    ├── LocationMap.tsx
 *    └── ...
 *
 * 2. Hooks (lib/hooks/):
 *    - useConsignmentLocations()
 *    - useConsignmentAssignments()
 *    - useWorkConsignmentStatus()
 *    - useLocationPerformance()
 *
 * 3. Add data-testid to all interactive elements
 *    See: consignment-ux-spec.md "Test IDs" section
 *
 * 4. Error Boundaries:
 *    - Wrap major sections with ErrorBoundary
 *    - Display user-friendly error messages
 *    - Retry buttons for network errors
 */
