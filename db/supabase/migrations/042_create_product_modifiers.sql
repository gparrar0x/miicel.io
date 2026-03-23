-- ============================================================
-- 042: Product Modifiers + Order Line Items
-- Adds modifier groups/options for gastronomy products
-- and structured order line items with modifier snapshots.
-- ============================================================

-- Modifier groups (e.g. "Extras", "Salsas")
CREATE TABLE modifier_groups (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     int NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id    int NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name          text NOT NULL,
  min_selections int NOT NULL DEFAULT 0 CHECK (min_selections >= 0),
  max_selections int NOT NULL DEFAULT 1 CHECK (max_selections >= 1),
  display_order int NOT NULL DEFAULT 0,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT min_lte_max CHECK (min_selections <= max_selections)
);

CREATE INDEX idx_modifier_groups_product ON modifier_groups(product_id);
CREATE INDEX idx_modifier_groups_tenant ON modifier_groups(tenant_id);

-- Individual modifier options
CREATE TABLE modifier_options (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       int NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  modifier_group_id uuid NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name            text NOT NULL,
  price_delta     numeric(10,2) NOT NULL DEFAULT 0.00,
  active          boolean NOT NULL DEFAULT true,
  display_order   int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_modifier_options_group ON modifier_options(modifier_group_id);
CREATE INDEX idx_modifier_options_tenant ON modifier_options(tenant_id);

-- Order line items (structured version of orders.items JSONB)
CREATE TABLE order_line_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       int NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id        int NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      int NOT NULL REFERENCES products(id),
  product_name    text NOT NULL,
  unit_price      numeric(10,2) NOT NULL,
  quantity        int NOT NULL CHECK (quantity > 0),
  subtotal        numeric(10,2) NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_line_items_order ON order_line_items(order_id);
CREATE INDEX idx_order_line_items_tenant ON order_line_items(tenant_id);

-- Selected modifiers per line item (snapshot at order time)
CREATE TABLE order_line_item_modifiers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           int NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_line_item_id  uuid NOT NULL REFERENCES order_line_items(id) ON DELETE CASCADE,
  modifier_option_id  uuid NOT NULL REFERENCES modifier_options(id),
  modifier_group_name text NOT NULL,
  modifier_name       text NOT NULL,
  price_delta         numeric(10,2) NOT NULL DEFAULT 0.00
);

CREATE INDEX idx_oli_modifiers_line_item ON order_line_item_modifiers(order_line_item_id);
CREATE INDEX idx_oli_modifiers_tenant ON order_line_item_modifiers(tenant_id);

-- RLS
ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_line_item_modifiers ENABLE ROW LEVEL SECURITY;

-- RLS policies using auth.uid() pattern (consistent with 039_optimize_rls_auth_uid)
CREATE POLICY "modifier_groups_tenant_isolation" ON modifier_groups
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "modifier_groups_public_read" ON modifier_groups
  FOR SELECT USING (active = true);

CREATE POLICY "modifier_options_tenant_isolation" ON modifier_options
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "modifier_options_public_read" ON modifier_options
  FOR SELECT USING (active = true);

CREATE POLICY "order_line_items_tenant_isolation" ON order_line_items
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "order_line_item_modifiers_tenant_isolation" ON order_line_item_modifiers
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = auth.uid()
    )
  );
