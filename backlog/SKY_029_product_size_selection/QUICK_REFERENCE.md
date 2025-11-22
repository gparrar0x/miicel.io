# SKY-029 Quick Reference

## Problem
Size selector doesn't display for artmonkeys products (Toro, Samurai, Chamán) despite having size data in database.

## Status
✗ **BLOCKED:** Waiting for Pixel to implement size selector UI in GalleryGrid

## What's Done
- [x] Database has correct metadata
- [x] page.tsx correctly maps data
- [x] Artwork type has sizes field
- [x] Investigation complete
- [x] Test suite ready

## What's Needed
- [ ] Pixel: Implement size selector UI in `components/gallery-v2/GalleryGrid.tsx`
- [ ] Pixel: Add required test IDs
- [ ] Sentinela: Run E2E tests (tests already written)

## Key Files
| File | Purpose |
|------|---------|
| `SKY_029_INVESTIGATION_REPORT.md` | **Start here** - technical deep dive |
| `SKY_029_PIXEL_ESCALATION.md` | For Pixel - design options + specs |
| `SKY_029_SENTINELA_TASKS.md` | E2E test suite (ready to run) |

## For Pixel
1. Read: `SKY_029_PIXEL_ESCALATION.md`
2. Choose: Option A (inline), B (detail page), or C (hybrid)
3. Implement: Size selector UI in GalleryGrid
4. Add test IDs:
   - `data-testid="artwork-size-selector-{id}"`
   - `data-testid="artwork-size-option-{sizeId}"`
   - `data-testid="artwork-price-{id}"`

## For Sentinela (Post-Implementation)
```bash
npx playwright test tests/e2e/artmonkeys-size-selection.spec.ts
```

## Timeline
- Investigation: ✓ Complete (Nov 21)
- Pixel implementation: ~4-6h
- E2E testing: ~1-2h
- **Total:** ~6-8h

## DB Query (for reference)
```sql
SELECT id, name, metadata FROM products WHERE id IN (19, 20, 21);
```

All products have correct metadata with Small/Medium/Large sizes.
