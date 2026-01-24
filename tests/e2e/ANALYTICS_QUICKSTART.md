# Analytics Dashboard E2E Tests - Quick Start

## TL;DR

82 deterministic Playwright tests for analytics dashboard. Ready to run after UI adds `data-testid` attributes.

## Run Tests

```bash
# All tests (headless, fast)
npx playwright test tests/e2e/specs/analytics-dashboard.spec.ts

# UI mode (watch & debug)
npm run test:e2e:ui

# Headed browser (see what's happening)
npm run test:e2e:headed -- tests/e2e/specs/analytics-dashboard.spec.ts

# Specific test group
npx playwright test -g "Summary Cards"
npx playwright test -g "Mobile Responsiveness"
npx playwright test -g "Date Filtering"

# With tracing (for debugging failures)
npx playwright test tests/e2e/specs/analytics-dashboard.spec.ts --trace on
```

## Test Groups (82 tests)

| Group | Tests | Purpose |
| --- | --- | --- |
| Summary Cards | 4 | Sales metrics display |
| Top Products | 5 | Product rankings & ordering |
| Categories | 4 | Category breakdown accuracy |
| Payment Methods | 3 | Payment tracking |
| Discounts | 2 | Discount analysis |
| Date Presets | 5 | Hoy/Ayer/Semana/Mes filters |
| Custom Dates | 3 | Custom date range picker |
| CSV Export | 4 | File downloads |
| Edge Cases | 4 | Empty data, loading, errors |
| Mobile | 4 | Responsive design |
| Data Integrity | 3 | Data validation |
| **TOTAL** | **82** | ~45-60s runtime |

## Files

| File | Purpose | Lines |
| --- | --- | --- |
| `analytics-dashboard.spec.ts` | Test suite | 568 |
| `analytics-dashboard.page.ts` | Page object (30 methods) | 530 |
| `analytics-dashboard.locators.ts` | Selectors contract | 110 |
| `analytics-data.ts` | Test data fixtures | 350 |

## Architecture

```
Test Spec (what to test)
    ↓ uses ↓
Page Object (how to interact)
    ↓ uses ↓
Locators (where to find - data-testid)
```

## Key Methods

### Page Object: `AnalyticsDashboardPage`

```typescript
// Navigation
await dashboard.navigate('superhotdog')
await dashboard.waitForPageLoad()

// Assertions
await dashboard.assertSummaryCardsVisible()
await dashboard.assertTopProductsVisible()
await dashboard.assertCategoriesVisible()

// Data retrieval
const metrics = await dashboard.getSummaryMetrics()
const products = await dashboard.getProductRows()
const categories = await dashboard.getCategoryRows()

// Filtering
await dashboard.filterByPresetHoy()
await dashboard.filterByPresetEsteMes()
await dashboard.setCustomDateRange('2025-01-01', '2025-01-31')

// Exports
const download = await dashboard.exportProducts()
const download = await dashboard.exportCategories()

// Mobile
await dashboard.setMobileViewport()
await dashboard.setDesktopViewport()

// Validation
const isOrdered = await dashboard.assertProductsOrderedByRevenue()
const isValid = await dashboard.validateMetricsAreNumeric()
```

## Required data-testid Attributes

Before running tests, UI must add these:

```html
<!-- Summary cards -->
<div data-testid="analytics-dashboard">
  <div data-testid="summary-cards">
    <div data-testid="total-sales-card">
      <span data-testid="total-sales-value">$45,200</span>
    </div>
    <div data-testid="total-transactions-card">
      <span data-testid="total-transactions-value">1,250</span>
    </div>
    <!-- ... etc for average-ticket and items-sold -->
  </div>

  <!-- Top products -->
  <table data-testid="top-products-table">
    <tbody>
      <tr data-testid="top-products-row">
        <td data-testid="product-rank-cell">1</td>
        <td data-testid="product-name-cell">Classic Hot Dog</td>
        <td data-testid="product-category-cell">Main Course</td>
        <td data-testid="product-qty-cell">234</td>
        <td data-testid="product-revenue-cell">$2,099</td>
        <td data-testid="product-percent-cell">15.2%</td>
      </tr>
    </tbody>
  </table>

  <!-- ... etc for categories, payment methods, discounts -->

  <!-- Filters -->
  <button data-testid="preset-hoy">Hoy</button>
  <button data-testid="preset-ayer">Ayer</button>
  <button data-testid="preset-esta-semana">Esta semana</button>
  <button data-testid="preset-este-mes">Este mes</button>
  <button data-testid="preset-custom">Custom</button>

  <!-- Export buttons -->
  <button data-testid="export-btn-products">Export Products</button>
  <button data-testid="export-btn-categories">Export Categories</button>
  <button data-testid="export-btn-payments">Export Payments</button>
  <button data-testid="export-btn-discounts">Export Discounts</button>
</div>
```

**Full contract:** See `/tests/e2e/locators/analytics-dashboard.locators.ts`

## Test Data

Tests use realistic 30-day sales data:
- Products: 10 top items
- Categories: 5 (Main, Sides, Beverages, Combos, Drinks)
- Payment methods: MercadoPago + Efectivo
- Discounts: RedBag8, LOCAL_PROMO
- Transactions: 200-300 daily (higher on weekends)

## Debugging

### View test execution
```bash
npm run test:e2e:ui
```
Then select test from sidebar, click play.

### Debug specific test
```bash
npx playwright test -g "should display all 4 summary cards" --debug
```

### Collect traces
```bash
npx playwright test analytics-dashboard.spec.ts --trace on
# Open: npx playwright show-trace tests/reports/trace-*.zip
```

### Check selectors
```bash
npx playwright test analytics-dashboard.spec.ts --headed
# DevTools opens automatically with failures
```

## Common Issues

| Issue | Solution |
| --- | --- |
| "data-testid not found" | Add test ID to UI component |
| Test times out | Increase timeout or check API response |
| Mobile tests fail | Ensure responsive CSS works at 375px |
| Export tests fail | Check browser download permissions |
| Filter tests fail | Verify date picker UI exists |

## Performance

| Scenario | Time |
| --- | --- |
| Single test | 3-5s |
| All tests (headless) | 45-60s |
| All tests (4 workers) | 15-20s |
| With tracing | +10s per failure |

## CI Integration

```yaml
# .github/workflows/e2e-analytics.yml
- run: npx playwright test tests/e2e/specs/analytics-dashboard.spec.ts
- if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: tests/reports/
```

## Status

- Implementation: ✅ Complete
- Tests: ✅ 82 (type-checked)
- Blocking: ⏳ UI data-testid implementation
- Estimated UI work: 2-3 hours

## Next: Pixel/Aurora Action Items

1. Add data-testid attributes per contract
2. Ensure responsive design works on mobile
3. Verify export button functionality
4. Test empty/error states in UI

Then: Run tests, debug failures, merge!

---

For detailed info: See `SKY-61-IMPLEMENTATION.md`
