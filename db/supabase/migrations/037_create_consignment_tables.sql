-- Migration 037: Create consignment management tables
-- Purpose: Enable artists to track artworks in multiple gallery/café locations
-- Date: 2025-01-16
-- Priority: P1 (SKY-54 - Consignment Management)
--
-- DESIGN NOTES:
-- ============================================================
-- Q: Why separate consignment_locations from products?
-- A: Locations are physical points (galleries, cafés, studios) where works are placed.
--    Products table holds artwork metadata. This links them.
--
-- Q: Why artwork_consignments instead of just a location_id on products?
-- A: Enables full audit trail (assigned_at, removed_at, status history).
--    Single product can have multiple consignment records over time.
--
-- Q: Why status in artwork_consignments not products?
-- A: Consignment status is ephemeral (active, sold, returned).
--    Product status is inventory state (published, draft, etc).
-- ============================================================

-- ============================================================
-- PART 1: Create consignment_locations table
-- ============================================================

CREATE TABLE consignment_locations (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Foreign key to tenants
  CONSTRAINT consignment_locations_tenant_id_fkey
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE,

  -- Valid status values
  CONSTRAINT consignment_locations_status_check
    CHECK (status IN ('active', 'inactive', 'archived')),

  -- Validate coordinates if provided
  CONSTRAINT consignment_locations_latitude_check
    CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),

  CONSTRAINT consignment_locations_longitude_check
    CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180))
);

-- ============================================================
-- PART 2: Create artwork_consignments table
-- ============================================================

CREATE TABLE artwork_consignments (
  id BIGSERIAL PRIMARY KEY,
  work_id BIGINT NOT NULL,          -- FK to products (artworks)
  location_id BIGINT NOT NULL,      -- FK to consignment_locations
  tenant_id BIGINT NOT NULL,        -- Denormalized for RLS performance
  status TEXT NOT NULL DEFAULT 'in_gallery',
  assigned_date TIMESTAMPTZ DEFAULT now(),
  unassigned_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Foreign keys
  CONSTRAINT artwork_consignments_work_id_fkey
    FOREIGN KEY (work_id)
    REFERENCES products(id)
    ON DELETE CASCADE,

  CONSTRAINT artwork_consignments_location_id_fkey
    FOREIGN KEY (location_id)
    REFERENCES consignment_locations(id)
    ON DELETE CASCADE,

  CONSTRAINT artwork_consignments_tenant_id_fkey
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE,

  -- Valid status values
  CONSTRAINT artwork_consignments_status_check
    CHECK (status IN ('in_gallery', 'in_transit', 'sold', 'returned', 'pending')),

  -- Logic: unassigned_date must be after assigned_date
  CONSTRAINT artwork_consignments_dates_check
    CHECK (unassigned_date IS NULL OR unassigned_date >= assigned_date),

  -- Prevent duplicate active assignments (same work can't be in 2 places)
  CONSTRAINT artwork_consignments_unique_active
    UNIQUE (work_id, location_id)
    WHERE (unassigned_date IS NULL AND status NOT IN ('sold', 'returned'))
);

-- ============================================================
-- PART 3: Create indexes
-- ============================================================

-- Locations indexes
CREATE INDEX idx_consignment_locations_tenant_id ON consignment_locations(tenant_id);
CREATE INDEX idx_consignment_locations_status ON consignment_locations(tenant_id, status)
WHERE status = 'active';
CREATE INDEX idx_consignment_locations_city ON consignment_locations(city);

-- Assignments indexes
CREATE INDEX idx_artwork_consignments_work_id ON artwork_consignments(work_id);
CREATE INDEX idx_artwork_consignments_location_id ON artwork_consignments(location_id);
CREATE INDEX idx_artwork_consignments_tenant_id ON artwork_consignments(tenant_id);
CREATE INDEX idx_artwork_consignments_active ON artwork_consignments(location_id, status)
WHERE status = 'in_gallery' AND unassigned_date IS NULL;
CREATE INDEX idx_artwork_consignments_dates ON artwork_consignments(assigned_date DESC);

-- ============================================================
-- PART 4: Create updated_at triggers
-- ============================================================

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_consignment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for consignment_locations
CREATE TRIGGER consignment_locations_updated_at
  BEFORE UPDATE ON consignment_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_consignment_updated_at();

-- Trigger for artwork_consignments
CREATE TRIGGER artwork_consignments_updated_at
  BEFORE UPDATE ON artwork_consignments
  FOR EACH ROW
  EXECUTE FUNCTION update_consignment_updated_at();

-- ============================================================
-- PART 5: Row-Level Security (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE consignment_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_consignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consignment_locations
CREATE POLICY "Users can view their tenant's locations"
  ON consignment_locations FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert locations for their tenants"
  ON consignment_locations FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their tenant's locations"
  ON consignment_locations FOR UPDATE
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their tenant's locations"
  ON consignment_locations FOR DELETE
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for artwork_consignments
CREATE POLICY "Users can view their tenant's consignments"
  ON artwork_consignments FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert consignments for their tenants"
  ON artwork_consignments FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their tenant's consignments"
  ON artwork_consignments FOR UPDATE
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their tenant's consignments"
  ON artwork_consignments FOR DELETE
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

-- ============================================================
-- PART 6: Documentation
-- ============================================================

COMMENT ON TABLE consignment_locations IS 'Physical locations (galleries, cafés) where artworks are placed';
COMMENT ON TABLE artwork_consignments IS 'Assignments of artworks to locations with status tracking';

COMMENT ON COLUMN consignment_locations.status IS 'active | inactive | archived';
COMMENT ON COLUMN artwork_consignments.status IS 'in_gallery | in_transit | sold | returned | pending';
COMMENT ON COLUMN artwork_consignments.unassigned_date IS 'NULL if still assigned, set when work is removed/sold/returned';

-- ============================================================
-- VERIFICATION QUERIES (RUN MANUALLY AFTER MIGRATION)
-- ============================================================

/*
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('consignment_locations', 'artwork_consignments');

-- Check indexes
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('consignment_locations', 'artwork_consignments');

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('consignment_locations', 'artwork_consignments');

-- Check constraints
SELECT conname, contype
FROM pg_constraint
WHERE conrelid IN (
  'consignment_locations'::regclass,
  'artwork_consignments'::regclass
);

-- Test insert location (replace tenant_id with real value)
INSERT INTO consignment_locations (tenant_id, name, city, country)
VALUES (1, 'Test Gallery', 'Buenos Aires', 'Argentina')
RETURNING *;

-- Test insert assignment (replace IDs with real values)
INSERT INTO artwork_consignments (work_id, location_id, tenant_id, status)
VALUES (1, 1, 1, 'in_gallery')
RETURNING *;

-- Clean up test data
DELETE FROM artwork_consignments WHERE notes = 'test';
DELETE FROM consignment_locations WHERE name = 'Test Gallery';
*/
