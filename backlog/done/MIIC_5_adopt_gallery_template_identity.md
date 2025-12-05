---
id: MIIC_5
project_code: MIIC
project: miicel.io
title: "MIIC_5: Adopt Gallery Template Visual Identity in Platform Areas"
estado: done
completed_at: 2025-12-05
tags:
  - design-system
  - rebrand
  - ui
created_at: 2025-12-04
---

## Description
Adoptar la identidad visual del template gallery (negros, blancos, dorados, estilo brutalist) en las áreas de plataforma de miicel.io: landing page, login screen, y tenant dashboard. Los storefronts de tenants mantienen su theming personalizado.

## Context
El template gallery ya existe con una paleta definida (Gallery White: negro #1A1A1A, blanco #FFFFFF, gold #B8860B) y elementos visuales distintivos (sombras brutalist, tipografía Cinzel, efectos magnéticos). Las páginas de plataforma actualmente usan colores hardcoded (orange #FF6B35, blue gradients) que no reflejan esta identidad.

Los design tokens ya existen en `/styles/tokens.css` y `/app/globals.css`, pero las páginas de plataforma no los están usando.

## Problem / Need
Inconsistencia visual entre el template gallery (usado en storefronts) y las páginas administrativas/institucionales de la plataforma. Los usuarios ven diferentes identidades visuales al navegar entre areas de plataforma y tiendas.

## Objective
Unificar la identidad visual de miicel.io adoptando el estilo gallery en landing page, login, y dashboard. Esto incluye:
- Paleta: Negro #1A1A1A, blanco #FFFFFF, gold #B8860B (accent)
- Sombras brutalist: 4px 4px 0px black
- Tipografía: Cinzel serif para títulos, Inter para body
- Efectos visuales: Noise overlay (5% opacity), hover magnético
- Hard edges: rounded-none en lugar de rounded-lg

## Success Metric
- 100% de referencias a colores orange (#FF6B35) y blue gradients reemplazadas
- Focus rings gold (#B8860B) en todos los inputs de plataforma
- Brutal shadows en cards y buttons
- Cinzel typography en headings principales
- Build pasa sin warnings
- Visual regression tests actualizados

## Next Steps (cerrado)
- [x] Plan detallado creado en `/Users/gpublica/.claude/plans/reactive-imagining-raven.md`
- [x] Fase 1: Consolidar design tokens (tailwind.config.ts + globals.css)
- [x] Fase 2: Migrar platform pages (landing, login, dashboard)
- [x] Fase 3: Actualizar AdminSidebar con gallery colors
- [ ] Fase 4 (opcional): Crear shadcn/ui brutalist variants (dejado en backlog futuro)
- [x] Testing: Visual regression básica y smoke e2e OK
- [x] Deploy: cambios en main; listos para release

## Outcome

- Identidad Gallery aplicada a landing, login y dashboard; AdminSidebar alineada a paleta negro/blanco/oro.
- Tokens de diseño y globals actualizados; Cinzel/Inter como tipografía, sombras brutalist y noise overlay.
- CHANGELOG Unreleased refleja entrega; sin regresiones detectadas en build.

## References
- Plan completo: `/Users/gpublica/.claude/plans/reactive-imagining-raven.md`
- Gallery template: `/projects/miicel.io/components/storefront/GalleryCard.tsx`
- Design tokens: `/projects/miicel.io/styles/tokens.css`
- Global styles: `/projects/miicel.io/app/globals.css`
- Original ticket gallery: SKY-43 (si existe)
