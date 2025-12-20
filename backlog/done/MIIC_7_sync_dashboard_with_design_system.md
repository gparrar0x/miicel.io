---
id: MIIC_7
project_code: MIIC
project: miicel.io
title: "MIIC_7: Sync dashboard with design-system"
estado: active
tags:
  - design-system
  - frontend
  - pixel
created_at: 2025-12-19
---

## Description
Sincronizar el dashboard de miicel.io con el dashboard-design-system (source of truth). El design-system debe evolucionar para soportar navegación dinámica (i18n + multi-tenant), y miicel.io debe usar exactamente esos componentes.

## Context
El análisis de diff reveló que miicel.io tiene duplicación de componentes:
- `components/dashboard/` → copia exacta del design-system (no usado)
- `components/ds/dashboard/` → versión evolucionada con props dinámicos (usado en producción)

El design-system tiene Sidebar con navegación hardcodeada, mientras miicel.io necesita rutas dinámicas (`/${locale}/${tenantId}/dashboard`).

## Problem / Need
- Drift entre design-system y implementación real
- Duplicación de componentes causa confusión
- No hay single source of truth efectivo
- Cambios en DS no se reflejan automáticamente en miicel.io

## Objective
1. Design-system soporta navegación configurable (Sidebar acepta `brand` + `navItems` props)
2. miicel.io usa componentes del DS directamente (eliminar `components/ds/dashboard/`)
3. Layout de miicel.io sigue estructura del DS (Header separado)

## Success Metric
- Zero drift: componentes dashboard de miicel.io son idénticos a los del design-system
- Build pasa sin errores después de migración
- Visual regression: dashboard se ve igual antes y después

## Next Steps
- [ ] Actualizar Sidebar en design-system → aceptar `brand` + `navItems` props
- [ ] Actualizar Header en design-system si necesario
- [ ] Copiar componentes actualizados del DS a miicel.io `components/dashboard/`
- [ ] Eliminar `components/ds/dashboard/` de miicel.io
- [ ] Adaptar layout.tsx para usar Header separado
- [ ] Actualizar imports en pages
- [ ] Test visual de regresión

## References
- Design system: `projects/dashboard-design-system/`
- miicel.io dashboard: `projects/miicel.io/app/[locale]/[tenantId]/dashboard/`
- Componentes a sincronizar: Sidebar, Header, StatCard, DataTable, ChartCard
