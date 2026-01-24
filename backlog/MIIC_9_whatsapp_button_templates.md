---
id: MIIC_9
project_code: MIIC
project: miicel.io
title: "MIIC_9: Botón WhatsApp configurable en todos los templates"
estado: active
tags:
  - feature
  - storefront
  - ux
  - conversion
created_at: 2026-01-13
---

## Description

Agregar un botón flotante de WhatsApp a todos los templates de storefront (Gallery, Detail, Minimal, Restaurant) que abra directamente una conversación con el número configurado por el tenant. El número de WhatsApp será configurable desde el dashboard del tenant.

## Context

Actualmente los storefronts no tienen canal de comunicación directa con el vendedor. Los compradores que quieren hacer preguntas o negociar deben buscar manualmente el contacto del vendedor. WhatsApp es el canal de comunicación dominante en LATAM para comercio informal/semi-formal.

Templates actuales implementados en `/components/storefront/`:
- GalleryCard.tsx
- DetailCard.tsx
- MinimalCard.tsx
- RestaurantLayout.tsx

## Problem / Need

- Compradores no tienen forma rápida de contactar al vendedor desde el storefront
- Pérdida de ventas por fricción en comunicación (preguntas no respondidas, dudas sobre productos)
- Tenants deben compartir su WhatsApp manualmente fuera de la plataforma
- No hay llamado a la acción visible para iniciar conversación

## Objective

1. Componente `WhatsAppButton` flotante reutilizable (posición fija, ícono reconocible)
2. Campo `whatsapp_number` en configuración del tenant (con validación de formato)
3. El botón abre `https://wa.me/{number}?text={mensaje_opcional}` en nueva pestaña
4. UI en dashboard para que tenant configure su número
5. El botón solo aparece si el tenant tiene número configurado

## Success Metric

- Tenant puede configurar número de WhatsApp en < 1 minuto
- Botón visible en todos los templates sin conflicto visual
- Al menos 50% de tenants activos configuran número en primera semana post-deploy
- Click-through rate del botón > 5% (medible via analytics)

## Next Steps

- [ ] Agregar campo `whatsapp_number` a tabla `tenants` (migration)
- [ ] Crear componente `WhatsAppButton.tsx` flotante con ícono estándar
- [ ] Integrar botón en cada template (Gallery, Detail, Minimal, Restaurant)
- [ ] UI en dashboard settings para configurar número
- [ ] Validación de formato de número (con código de país)
- [ ] Mensaje predeterminado opcional (ej: "Hola, vi tu tienda en miicel.io")

## Technical Notes

**Campo en DB:**
```sql
ALTER TABLE tenants ADD COLUMN whatsapp_number VARCHAR(20);
-- Formato esperado: +5491123456789 (con código país)
```

**Componente WhatsAppButton:**
```tsx
// Posición: fixed bottom-right, z-50
// Ícono: WhatsApp oficial (lucide-react o SVG custom)
// Click: window.open(`https://wa.me/${number}`, '_blank')
// Estilo: círculo verde WhatsApp (#25D366), hover scale
```

**Integración en templates:**
- Agregar al layout principal de cada template
- Condicional: solo renderizar si `tenant.whatsapp_number` existe
- No debe interferir con otros elementos flotantes (cart button en Restaurant)

**Dashboard UI:**
- Agregar en `/[tenantId]/dashboard/settings` o nueva sección "Contacto"
- Input con máscara de teléfono internacional
- Preview del enlace generado

## Agents

- **Kokoro:** Migration DB + validación backend
- **Pixel:** Componente WhatsAppButton + integración templates + UI dashboard

## References

- Templates docs: `website/docs/architecture/templates.md`
- Storefront components: `components/storefront/`
- Restaurant layout: `components/restaurant/`
- Tenant settings: `app/[locale]/[tenantId]/dashboard/settings/`
