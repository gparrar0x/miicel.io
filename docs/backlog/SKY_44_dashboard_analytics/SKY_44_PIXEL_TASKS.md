# Pixel Tasks - SKY-44 Dashboard Analytics

## SKY-44: Frontend Implementation for Analytics Dashboard

**Scope**: Dashboard UI components, data visualization, date filtering, CSV export

**Status**: PENDING
**Started**: -
**Agent**: Pixel (Frontend Specialist)

---

## Requirements

1. Dashboard layout responsive (mobile-first)
2. Summary cards with KPIs
3. Top 10 products table
4. Top categories breakdown
5. Payment methods breakdown
6. Discounts breakdown
7. Date range picker with presets
8. CSV export buttons
9. All components with data-testid

## Implementation Tasks

### Phase 1: Dashboard Layout (1 day)
- [ ] Create route `app/[locale]/[tenantId]/dashboard/analytics/page.tsx`
- [ ] Create `AnalyticsDashboard` client component
- [ ] Add sidebar link to analytics
- [ ] Setup loading states

### Phase 2: Summary Cards (1 day)
- [ ] Create `SummaryCards` component
  - [ ] Total sales card
  - [ ] Transactions card
  - [ ] Average ticket card
  - [ ] Items sold card
- [ ] Currency formatting with locale

### Phase 3: Data Tables (2 days)
- [ ] Create `TopProducts` component (table with ranking)
- [ ] Create `TopCategories` component
- [ ] Create `PaymentMethods` component
- [ ] Create `DiscountsBreakdown` component
- [ ] Percentage calculations and formatting

### Phase 4: Date Filtering (1 day)
- [ ] Create `DateRangePicker` component
- [ ] Presets: Hoy, Ayer, Esta semana, Este mes
- [ ] Custom date range picker
- [ ] Connect to API with date params

### Phase 5: Export & Polish (2 days)
- [ ] Add CSV export buttons to each section
- [ ] Mobile responsive adjustments
- [ ] Loading skeletons
- [ ] Error states
- [ ] Empty states

### Phase 6: Accessibility (1 day)
- [ ] Add all data-testid attributes
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader support

## Test IDs Required
```
data-testid="analytics-dashboard"
data-testid="summary-cards"
data-testid="total-sales"
data-testid="total-transactions"
data-testid="average-ticket"
data-testid="items-sold"
data-testid="top-products"
data-testid="top-categories"
data-testid="payment-methods"
data-testid="discounts-breakdown"
data-testid="date-range-picker"
data-testid="export-csv-products"
data-testid="export-csv-categories"
data-testid="export-csv-payments"
data-testid="export-csv-discounts"
```

## Acceptance Criteria
- [ ] Dashboard loads in <2s
- [ ] All data displays correctly
- [ ] Date filtering works
- [ ] CSV export downloads file
- [ ] Mobile responsive
- [ ] All test IDs present

## Dependencies
- Kokoro: API endpoints must be ready (GET /api/analytics/dashboard)
- SKY_44_API_SPECS.md must be approved

## Artifacts to Produce
- Dashboard page and components
- TEST_ID_CONTRACT.md for Sentinela
- i18n translations (es/en)
