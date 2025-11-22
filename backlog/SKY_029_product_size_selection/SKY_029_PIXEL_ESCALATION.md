# SKY-029: Size Selector Implementation - Pixel Task Escalation

**From:** Sentinela (QA/Test Automation)
**To:** Pixel (Frontend Designer)
**Priority:** Medium
**Timeline:** ~4-6h implementation + 2h testing

---

## Context

Products have size metadata (Small, Medium, Large with prices) stored in database and mapped to frontend, but **GalleryGrid component doesn't render the UI for size selection**.

- 3 affected products: Toro, Samurai, Chamán (artmonkeys template)
- Data flow verified: DB → page.tsx → Artwork type → (missing: GalleryGrid UI)
- Full investigation in: `SKY_029_INVESTIGATION_REPORT.md`

---

## Design Decision Needed

**Where should size selection live?**

### Option A: Inline in Gallery Card (Compact)
- Size selector buttons/dropdown appear on card
- On selection, update price display
- "Add to Cart" button includes selected size
- Best for: Quick browsing without page navigation
- Effort: 3-4h
- Complexity: Medium (state per card)

### Option B: Product Detail Page Only (Canonical)
- Gallery card shows base price only
- Link to `/product/{id}` for full size selection
- User selects size on detail page before adding to cart
- Best for: Rich product detail experience
- Effort: 2-3h (detail page may already have structure)
- Complexity: Low (detail page handles state)

### Option C: Hybrid (Best UX)
- Gallery card shows size options as buttons/dropdown (quick select)
- Detail page has expanded view with specs/dimensions
- Both support size selection
- Effort: 5-6h
- Complexity: High (sync state across pages)

---

## Technical Specs

### Artwork Type Structure
```typescript
interface Artwork {
  id: string
  title: string
  price: number
  currency: string
  sizes: Array<{
    id: string        // 'small', 'medium', 'large'
    label: string     // 'Small', 'Medium', 'Large'
    dimensions: string // '30 × 40 cm'
    price: number     // variant-specific price
    stock: number | null // null = unlimited
  }>
  // ... other fields
}
```

### Test IDs Contract
Add these to your implementation (coordinate with `.claude/TEST_ID_CONTRACT.md`):

```typescript
data-testid="artwork-card-{id}"              // card container
data-testid="artwork-size-selector-{id}"     // selector group
data-testid="artwork-size-option-{sizeId}"   // individual option (e.g., small/medium/large)
data-testid="artwork-price-{id}"             // price display (updates on selection)
data-testid="artwork-dimensions-{id}"        // dimension text
data-testid="artwork-add-to-cart-{id}"       // add to cart action
```

---

## Acceptance Criteria

- [ ] Size options visible for Toro, Samurai, Chamán
- [ ] Selecting size updates price display (if inline)
- [ ] Dimensions shown (30 × 40 cm, 50 × 70 cm, 100 × 140 cm)
- [ ] All test IDs present
- [ ] Responsive on mobile
- [ ] Works with existing cart flow
- [ ] No regression on mangobajito (restaurant template)

---

## Blocking E2E Tests (Sentinela)

Ready to implement once UI complete. Tests will verify:
- Size selector visibility
- Price updates on selection
- Dimensions display
- Cart flow with size parameter

See `SKY_029_SENTINELA_TASKS.md` lines 37-82 for full test suite.

---

## File Locations

| File | Purpose |
|------|---------|
| `components/gallery-v2/GalleryGrid.tsx` | **Target for modification** |
| `components/gallery-v2/types.ts` | Artwork type (no change needed) |
| `app/[locale]/[tenantId]/page.tsx` | Data mapping (working) |
| `.claude/TEST_ID_CONTRACT.md` | Test ID standards (align with this) |

---

## Decision

**Which option do you recommend? (A, B, or C)**

Once chosen, comment on this ticket and I'll begin implementation.
