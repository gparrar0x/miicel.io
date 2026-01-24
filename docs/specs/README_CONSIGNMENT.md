# SKY-53: Consignment Management — Design System Index

**Quick Navigation for Agents**

---

## For Everyone: Start Here

**`CONSIGNMENT_SUMMARY.md`** (5 min read)
- Overview of what was built
- Architecture & data model
- Timeline & dependencies
- Success metrics

---

## For Pixel (Frontend)

**`PIXEL_COMPONENT_GUIDE.md`** (20 min read)
- React/Next.js implementation guide
- Component-by-component code examples
- Props interfaces & hooks
- Test ID contract
- CSS utility classes
- Responsive strategy

**`consignment-ux-spec.md`** (Sections 1-3)
- Wireframes & flow descriptions
- Mobile/desktop layouts
- Component specs table
- Empty/error/loading states

**`lib/types/consignment.ts`**
- TypeScript interfaces for components
- Props types for all components
- Error classes
- Hook return types

---

## For Kokoro (Backend)

**`CONSIGNMENT_SUMMARY.md`** (Section: "Data Model")
- 3 tables: locations, assignments, movements
- Relationships & indexes

**`CONSIGNMENT_SUMMARY.md`** (Section: "API Route Contract")
- 18 endpoints mapped
- Request/response format
- Pagination strategy

**`consignment-ux-spec.md`** (Section 2: "Information Architecture")
- SQL schema reference
- State machine for consignment status
- Validation rules

**`lib/types/consignment.ts`** (Sections: Request/Response Types)
- Request DTOs
- Response DTOs
- Error types

---

## For Sentinela (QA/Testing)

**`consignment-ux-spec.md`** (Section 8: "Accessibility")
- Test ID contract (30+ IDs)
- WCAG AA compliance requirements

**`CONSIGNMENT_SUMMARY.md`** (Section: "E2E Test Scenarios")
- Happy path flows
- Error cases
- Mobile specific tests

**`PIXEL_COMPONENT_GUIDE.md`** (Section: "Test ID Contract")
- Full list of test IDs by feature
- Pattern convention

---

## For Hermes (Deployment)

**`CONSIGNMENT_SUMMARY.md`** (Section: "Handoff Checklist")
- Environment variables needed
- Map provider decision
- Staging setup

**`consignment-design-tokens.css`** (Section: "IMPLEMENTATION NOTES")
- Performance considerations
- CSS best practices
- GPU acceleration strategy

---

## For Lumen (SEO)

**`consignment-ux-spec.md`** (Section 4: "Reports Tab")
- Public-facing consignment reports
- Artist profile metadata
- Schema markup opportunities

---

## Design Tokens Reference

**`consignment-design-tokens.css`** (Complete reference)

### Colors
```
--color-status-gallery: #B8860B (in gallery)
--color-status-transit: #3B82F6 (in transit)
--color-status-sold: #10B981 (sold)
--color-status-pending: #F59E0B (pending)
--color-status-returned: #EF4444 (returned)
```

### Component Sizing
```
--location-card-height-mobile: 140px
--map-height-mobile: 240px
--timeline-dot-size: 12px
--badge-gallery-height: 24px
```

---

## File Manifest

```
/docs/specs/
├── README_CONSIGNMENT.md          (this file)
├── CONSIGNMENT_SUMMARY.md         (executive summary)
├── consignment-ux-spec.md         (wireframes + specs)
├── consignment-design-tokens.css  (design system)
└── PIXEL_COMPONENT_GUIDE.md       (implementation guide)

/lib/types/
└── consignment.ts                 (TypeScript interfaces)
```

**Total:** ~100 KB, 1500+ lines of spec + code

---

## Acceptance Criteria ✓

- [x] Wireframes of all flows (overview, locations, works, reports)
- [x] Design tokens defined (colors, typography, spacing, animations)
- [x] Component specs (10+ components with props + states)
- [x] TypeScript interfaces (models + hooks + errors)
- [x] Empty/loading/error states documented
- [x] Responsive behavior (3 breakpoints)
- [x] Accessibility guidelines (WCAG AA)
- [x] Test ID contract (30+ IDs)
- [x] API route contract (18 endpoints)
- [x] Data model (3 tables + relationships)

---

## Implementation Order

1. **Kokoro:** DB migrations + API routes (3-4 days)
2. **Pixel:** Components + hooks (4-5 days)
3. **Pixel:** Integration + styling (2-3 days)
4. **Sentinela:** E2E tests (2 days)
5. **Hermes:** Deploy + monitor (1 day)

**Total:** 12-15 days

---

## Key Decision Points

| Decision | Status | Notes |
|----------|--------|-------|
| Map provider | Pending | Recommend Leaflet (MVP) vs Mapbox |
| i18n keys | Pending | Pixel to add to messages/es.json |
| Figma file | Pending | Design system components |
| Timeline DB | Pending | Kokoro - separate movement table or audit log? |

---

## Questions?

- UX/Layout: See `consignment-ux-spec.md`
- Components: See `PIXEL_COMPONENT_GUIDE.md`
- Types: See `lib/types/consignment.ts`
- Architecture: See `CONSIGNMENT_SUMMARY.md`
- Design: See `consignment-design-tokens.css`

**Design Lead:** Aurora (@aurora)
**Created:** 2025-01-16
**Status:** Ready for development
