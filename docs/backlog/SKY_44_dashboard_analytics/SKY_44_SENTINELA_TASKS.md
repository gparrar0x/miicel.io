# Sentinela Tasks - SKY-44 Dashboard Analytics

## SKY-44: E2E Testing for Analytics Dashboard

**Scope**: E2E test suite for analytics dashboard functionality

**Status**: PENDING
**Started**: -
**Agent**: Sentinela (Test Automation Expert)

---

## Requirements

1. Test all dashboard components
2. Test date filtering
3. Test CSV export
4. Test data accuracy
5. Mobile viewport tests

## Implementation Tasks

### Phase 1: Test Setup (0.5 days)
- [ ] Create test file `tests/e2e/specs/analytics-dashboard.spec.ts`
- [ ] Setup test fixtures with realistic sales data
- [ ] Create helper for seeding test data

### Phase 2: Dashboard Tests (1.5 days)
- [ ] Test summary cards display
- [ ] Test top 10 products table
- [ ] Test top categories display
- [ ] Test payment methods breakdown
- [ ] Test discounts breakdown
- [ ] Test empty state when no data

### Phase 3: Filter Tests (0.5 days)
- [ ] Test date preset: Hoy
- [ ] Test date preset: Ayer
- [ ] Test date preset: Esta semana
- [ ] Test date preset: Este mes
- [ ] Test custom date range

### Phase 4: Export Tests (0.5 days)
- [ ] Test CSV export products
- [ ] Test CSV export categories
- [ ] Test CSV export payments
- [ ] Test CSV export discounts
- [ ] Validate CSV content

## Test Cases

```typescript
// Analytics Dashboard Tests
test('should display summary cards with correct values')
test('should display top 10 products ranked by revenue')
test('should display categories with percentages')
test('should display payment methods breakdown')
test('should display discounts by source')
test('should filter by date preset')
test('should filter by custom date range')
test('should export products to CSV')
test('should show empty state when no orders')
test('should be responsive on mobile')
```

## Acceptance Criteria
- [ ] All tests pass consistently
- [ ] No flaky tests
- [ ] Test data cleanup after each run
- [ ] Tests run in <2 minutes total

## Dependencies
- Pixel: Dashboard must be deployed to staging
- TEST_ID_CONTRACT.md must be available

## Artifacts to Produce
- E2E test suite
- Test data fixtures
- Test report documentation
