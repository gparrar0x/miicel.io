# Kokoro Tasks - SKY-44 Dashboard Analytics

## SKY-44: Backend Implementation for Analytics Dashboard

**Scope**: Database schema, materialized views, API endpoints for analytics data

**Status**: PENDING
**Started**: -
**Agent**: Kokoro (Backend Specialist)

---

## Requirements

1. Materialized views for performance (<500ms queries)
2. API endpoint GET /api/analytics/dashboard
3. API endpoint GET /api/analytics/export (CSV)
4. Discount metadata tracking in orders
5. RLS compliance for tenant isolation

## Implementation Tasks

### Phase 1: Database Schema (2 days)
- [ ] Add `discount_metadata` JSONB column to orders table
- [ ] Create index for discount_metadata
- [ ] Create materialized view `mv_top_products`
- [ ] Create materialized view `mv_top_categories`
- [ ] Create materialized view `mv_payment_methods`
- [ ] Create materialized view `mv_discounts`
- [ ] Create `refresh_analytics_views()` function
- [ ] Test materialized views with sample data

### Phase 2: API Routes (3 days)
- [ ] Create `/api/analytics/dashboard` route
- [ ] Implement helper functions in `lib/analytics/queries.ts`:
  - [ ] getSummaryMetrics()
  - [ ] getTopProducts()
  - [ ] getTopCategories()
  - [ ] getPaymentMethods()
  - [ ] getDiscounts()
- [ ] Create `/api/analytics/export` route
- [ ] Implement CSV generation helper
- [ ] Add proper auth/RLS checks

### Phase 3: Query Optimization (2 days)
- [ ] Test query performance with realistic data
- [ ] Add missing indexes if needed
- [ ] Implement caching strategy
- [ ] Setup materialized view refresh (manual or scheduled)

### Phase 4: Testing & Docs (1 day)
- [ ] Unit tests for query helpers
- [ ] Integration tests for API routes
- [ ] Document API contracts in API_SPECS.md

## Acceptance Criteria
- [ ] All API endpoints return correct data
- [ ] Query response time <500ms
- [ ] CSV export works correctly
- [ ] RLS enforces tenant isolation
- [ ] No N+1 queries

## Dependencies
- None (can start immediately)

## Artifacts to Produce
- Migration file for discount_metadata + materialized views
- API routes implementation
- Query helper functions
- API_SPECS.md documentation

## Notes
Materialized views strategy chosen over regular views for performance.
Consider pg_cron for automated refresh if available.
