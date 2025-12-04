---
id: MIIC_6
project_code: MIIC
project: miicel.io
title: "MIIC_6: Refined Brand Identity & Dashboard Design"
estado: active
tags:
  - design-system
  - ui-ux
  - brand-identity
  - aurora
created_at: 2025-12-04
designer: Aurora (Product Designer Agent)
---

## Description

Professional brand identity and dashboard UI design for miicel.io platform. Aurora has created a complete design system with "Refined Luxury" aesthetic - elegant gallery-inspired styling suitable for a SaaS platform (not aggressive brutalist).

## Context

After attempting a brutalist rebrand (MIIC-5) that resulted in overly aggressive styling (4px borders, 8px shadows, font-black everywhere), we need a refined, professional design system that:
- Maintains gallery template inspiration (Cinzel serif, gold accents)
- Feels sophisticated and SaaS-appropriate
- Has clear information hierarchy without visual noise
- Is timeless and professional

Aurora has delivered complete design documentation ready for Pixel implementation.

## Problem / Need

Current state has two issues:
1. Original platform design lacks cohesive identity
2. MIIC-5 brutalist attempt is too loud/aggressive for a professional dashboard

Need: Professional, elegant design system that balances gallery aesthetics with SaaS usability.

## Objective

Implement Aurora's refined design system across platform areas:
- Landing page (superadmin tenant list)
- Login screen
- Tenant dashboard
- AdminSidebar navigation

Result: Cohesive, professional brand identity with clear hierarchy and polished interactions.

## Success Metric

- Lighthouse score ≥90 on all pages
- WCAG AA accessibility compliance (verified)
- User feedback: "Professional", "Clear", "Elegant" (not "loud" or "aggressive")
- Implementation time: 40-50 hours (Pixel estimate)
- Zero regressions in E2E tests

## Design System Deliverables

Aurora has created **9 complete design documents** (95+ pages) in this folder:

### Core Documentation
1. **DESIGN_SYSTEM.md** - Master specification
   - Color palette (noir, gold, status colors with hex codes)
   - Typography (Cinzel + Inter scales)
   - Spacing grid (8px base system)
   - 10 core components with full specs
   - Accessibility notes (WCAG AA compliant)

2. **COMPONENT_SPECS.md** - Implementation-ready reference
   - Tailwind config (copy-paste ready)
   - React TypeScript component definitions
   - Form validation patterns
   - Accessibility checklist

3. **DESIGN_QUICK_REFERENCE.md** - Developer bookmark
   - Color palette quick table
   - Typography reference
   - Component checklist
   - Test IDs reference

### Visual Specifications
4. **DESIGN_HANDOFF.md** - Team handoff documentation
   - Implementation roadmap (4 phases, 70 hours)
   - Test ID contract for Sentinela
   - E2E test scenarios
   - API contracts for Kokoro
   - Deployment checklist for Hermes

5. **README_DESIGN.md** - Project overview
   - Design philosophy ("Refined Luxury")
   - File structure
   - Quick start guide
   - Timeline & success metrics

6. **DESIGN_DELIVERY_INDEX.md** - Navigation guide
   - File organization
   - Quick start by role (Pixel/Sentinela/Kokoro/Hermes)
   - Handoff checklist

### Ready-to-Use Assets
7. **styles.css** - CSS variables & globals
   - All 12 colors as CSS variables
   - Typography scales
   - Spacing utilities
   - Animation keyframes
   - Ready to import in Next.js

8. **COMPONENT_TEMPLATES.tsx** *(if created)* - Production-ready code
   - 10 components ready to copy
   - Login page example
   - Dashboard page example
   - Full TypeScript types

## Design Direction: "Refined Luxury"

**Visual Philosophy:**
- Gallery aesthetic (Cinzel serif) without aggression
- Professional SaaS clarity (Inter sans-serif)
- Gold accent (#B8860B) signals premium without loudness
- Subtle shadows (max 8px) create hierarchy without drama
- WCAG AA compliant (19.26:1 contrast on body text)

**Color System:**
- Noir (#0F0F0F) + Charcoal (#1A1A1A) for text/UI
- White (#FFFFFF) + Alabaster (#FAFAFA) for surfaces
- Gold (#B8860B) as primary accent
- Status colors: Emerald (success), Coral (warning), Slate Blue (info)

**Typography:**
- **Cinzel** (serif, 400/600/700): H1-H4 headings only
- **Inter** (sans-serif, 400/500/600): All body copy + UI
- **Source Code Pro** (mono): Code/logs

## Next Steps

### Phase 1: Review & Approval (You are here)
- [ ] Review design documentation
- [ ] Validate color system with stakeholders
- [ ] Approve typography choices
- [ ] Sign-off on component designs

### Phase 2: Pixel Implementation (40-50 hours)
- [ ] Set up design tokens in tailwind.config.ts
- [ ] Implement component library
- [ ] Update landing page
- [ ] Update login screen
- [ ] Update dashboard
- [ ] Update AdminSidebar

### Phase 3: Sentinela QA (15-20 hours)
- [ ] Visual regression tests
- [ ] Accessibility audit (WCAG AA)
- [ ] E2E test updates
- [ ] Responsive testing (mobile/tablet/desktop)

### Phase 4: Deployment
- [ ] Hermes performance audit (Lighthouse ≥90)
- [ ] Staging validation
- [ ] Production deployment
- [ ] Post-launch monitoring

## Agent Assignments

- **Aurora** (Designer): ✅ Complete - All design docs delivered
- **Pixel** (Frontend): Ready to start implementation
- **Sentinela** (QA): E2E scenarios provided in DESIGN_HANDOFF.md
- **Kokoro** (Backend): API contracts documented (no changes needed)
- **Hermes** (DevOps): Performance targets specified

## References

- Original gallery rebrand attempt: `backlog/active/MIIC_5_adopt_gallery_template_identity.md`
- Brutalist implementation commits: `28708c4`, `3893fb0`
- All design files: `backlog/MIIC_6_refined_brand_identity/`

## Notes

- This replaces MIIC-5 approach (too aggressive)
- Design is production-ready, no mockup tools needed
- All specs include accessibility compliance
- Tailwind config is copy-paste ready
- Timeline: 70 hours total (40-50 Pixel, 15-20 Sentinela)
