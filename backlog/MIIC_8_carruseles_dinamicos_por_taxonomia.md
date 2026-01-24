---
id: MIIC_8
project_code: MIIC
project: miicel.io
title: "MIIC_8: Carruseles dinámicos por taxonomía"
estado: active
tags:
  - feature
  - storefront
  - ux
created_at: 2026-01-13
---

## Description

Permitir a tenants configurar carruseles de productos filtrados por taxonomía. Primera taxonomía soportada: colección (ej: "Verano 2026", "Ofertas", "Nuevos ingresos"). Los carruseles se renderizan en storefront (home, PDP) según configuración del tenant.

## Context

Actualmente los productos solo se muestran en grids estáticos (ProductGrid, GalleryGrid). El campo `category` existe como string libre pero no hay concepto de "colección" como entidad separada. Los tenants no pueden destacar grupos específicos de productos de forma dinámica.

Templates actuales: Gallery (QR-based) y Restaurant. Ambos usan grids sin carruseles.

## Problem / Need

- Tenants no pueden destacar productos específicos agrupados (ofertas, novedades, colecciones temáticas)
- No hay forma de crear experiencias de navegación más ricas sin editar código
- La home page es estática - mismo layout para todos los productos

## Objective

1. Crear modelo de datos para colecciones (taxonomía inicial)
2. Permitir asignar productos a colecciones
3. Componente Carousel reutilizable con swipe/scroll horizontal
4. Admin UI para crear/gestionar colecciones y configurar carruseles
5. Renderizar carruseles en storefront según config del tenant

## Success Metric

- Tenant puede crear colección y asignar productos en <5 min
- Carrusel renderiza correctamente en mobile (swipe) y desktop (scroll/arrows)
- Al menos 1 tenant activo usando carruseles en producción

## Next Steps

- [ ] Diseñar modelo de datos: tabla `collections` + tabla pivot `product_collections`
- [ ] Decidir: ¿colecciones exclusivas o un producto puede estar en múltiples colecciones?
- [ ] Definir dónde se muestran carruseles (home only? PDP related products? configurable?)
- [ ] Crear migration inicial
- [ ] Asignar agentes: Kokoro (backend/DB), Pixel (componente carousel + admin UI)

## Technical Notes

**Modelo propuesto:**
```sql
-- collections
CREATE TABLE collections (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- product_collections (many-to-many)
CREATE TABLE product_collections (
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  collection_id BIGINT REFERENCES collections(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  PRIMARY KEY (product_id, collection_id)
);
```

**Componente Carousel:**
- Usar `embla-carousel-react` o similar (ya hay pattern en shadcn)
- Props: `title`, `products[]`, `showArrows`, `autoplay`
- Responsive: 1 item mobile, 3-4 desktop

**Taxonomías futuras (scope creep - no MVP):**
- Tags
- Vendor/Artist
- Custom attributes

## References

- Productos schema: `lib/schemas/product.ts`
- Tipos commerce: `types/commerce.ts`
- Grids existentes: `components/storefront/ProductGrid.tsx`, `components/gallery-v2/GalleryGrid.tsx`
