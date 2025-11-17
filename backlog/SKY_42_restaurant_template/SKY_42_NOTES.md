# SKY-42: Template Restaurante - Notas Proyecto

> **Creado:** 2025-01-16
> **Status:** Planning → Design
> **Owner:** Mentat

---

## Resumen Ejecutivo

Agregar 4to template "restaurant" a Vendio SaaS optimizado para:
- Venta comida/menú digital
- Pedidos mobile-first
- Conversión rápida (hambre = baja fricción)
- Categorías = secciones menú

**ROI:** Alta - 2 de 3 clientes actuales son food (MangoBajito, SuperHotdog).

---

## Business Context

### Clientes Existentes Beneficiados
1. **MangoBajito** (hot dogs, combos)
   - Actualmente usa template "minimal"
   - Pain: no destaca promos/combos
   - Win: badges promo, categorías menu

2. **SuperHotdog** (hot dogs)
   - Actualmente usa template "gallery"
   - Pain: demasiado visual, poco info
   - Win: balance imagen + descripción ingredientes

### Mercado Potencial
- Food trucks
- Cafeterías
- Pizzerías
- Dark kitchens
- Kioscos/snacks

**Conversión estimada:** 40% clientes free → Pro con template restaurant.

---

## Technical Approach

### Stack
```typescript
// types/theme.ts
export type TenantTemplate = 'gallery' | 'detail' | 'minimal' | 'restaurant'

TEMPLATE_DEFAULTS = {
  restaurant: {
    gridCols: 2,              // mobile 1, tablet 2, desktop 2-3
    imageAspect: '16:9',      // muestra plato completo
    cardVariant: 'outlined',  // definición clara items menú
    spacing: 'normal',        // balance info vs scroll
  }
}
```

### Components Nuevos
- `ProductCardRestaurant.tsx` (variantes A/B/C)
- `CategoryTabs.tsx` (horizontal scroll)
- `FloatingCart.tsx` (sticky bottom CTA)
- `FoodBadge.tsx` (promo, spicy, veggie, etc)

### DB Schema (sin cambios)
Template "restaurant" usa misma estructura:
- `tenants.template = 'restaurant'`
- `tenants.theme_overrides` (custom colors, gridCols)
- `products.category` (mapea a tabs menú)

---

## Design Principles

### 1. Appetite Appeal
- Colores cálidos (rojos, naranjas, amarillos)
- Imágenes food dominantes
- Whitespace generoso (no abrumar)

### 2. Speed to Checkout
- Quick add (no modal producto)
- Categorías sticky (no re-scroll)
- Cart badge visible always

### 3. Mobile-First
- 80% pedidos desde celular
- Min font 16px (evita zoom iOS)
- Tap targets 44x44px mínimo
- Landscape support (común en food)

### 4. Accessibility
- WCAG AA (contrast 4.5:1 mínimo)
- Alt texts descriptivos comida
- Keyboard navigation
- Screen reader friendly badges

---

## Competitive Analysis

| App | Grid | Aspect | Strengths | Weaknesses |
|-----|------|--------|-----------|------------|
| **Rappi** | 2 cols | 1:1 | Tabs categorías, badges promo | Imágenes pequeñas |
| **Uber Eats** | 1 col | 16:9 | Imágenes grandes, quick add | Scroll largo |
| **PedidosYa** | 2 cols | 4:3 | Balance info/imagen | Categorías buried |
| **DoorDash** | 1 col | 16:9 | Hero images, CTA claro | Mucho whitespace móvil |

**Nuestra diferencia:** Customizable per tenant (dueño elige variante card).

---

## Phased Rollout

### Fase 1: Design (Esta Sprint)
- [ ] Aurora: Moodboard + paletas
- [ ] Aurora: Product card variantes
- [ ] Aurora: Wireframes responsive
- [ ] Aurora: Design system + icon pack
- [ ] Deliverable: `SKY_42_DESIGN_SPECS.md`

### Fase 2: Implementación (Sprint +1)
- [ ] Pixel: Agregar 'restaurant' a types
- [ ] Pixel: ProductCardRestaurant componentes
- [ ] Pixel: CategoryTabs horizontal scroll
- [ ] Pixel: FloatingCart sticky
- [ ] Pixel: Responsive grid ajustes
- [ ] Deliverable: Template funcional staging

### Fase 3: Testing & Migration (Sprint +2)
- [ ] Sentinela: E2E tests template restaurant
- [ ] Migrar MangoBajito → restaurant template
- [ ] A/B test conversión vs minimal
- [ ] Validar con SuperHotdog
- [ ] Deliverable: 2 clientes migrados + metrics

### Fase 4: Launch (Sprint +3)
- [ ] Update TemplateSelector UI (agregar 4ta opción)
- [ ] Docs onboarding (cuándo usar restaurant)
- [ ] Marketing landing (showcase food clients)
- [ ] Anuncio clientes existentes

---

## Success Metrics

**Diseño:**
- [ ] 3 variantes card diseñadas
- [ ] 3 paletas colores propuestas
- [ ] Icon pack 15+ SVGs
- [ ] Figma handoff aprobado Mentat

**Implementación:**
- [ ] Template seleccionable admin
- [ ] Responsive mobile/tablet/desktop
- [ ] Tests E2E passing
- [ ] Lighthouse >90 performance

**Negocio:**
- [ ] MangoBajito migrado (semana +2)
- [ ] SuperHotdog migrado (semana +3)
- [ ] 3 nuevos clientes food onboarded (mes +1)
- [ ] +15% conversión checkout vs templates actuales

---

## Open Questions

### Para Aurora (Design)
1. ¿Paleta default = "Warm Appetite" o "Fast Casual"?
2. ¿Card variant A (Menu Item) suficiente o necesitamos B/C también?
3. ¿Badges: iconos color o monocromáticos?

### Para Pixel (Implementación)
1. ¿CategoryTabs usar library (react-tabs) o custom?
2. ¿FloatingCart animar slide-up o fade-in?
3. ¿Lazy load imágenes food (critical LCP)?

### Para Mentat (Strategy)
1. ¿Upgrade automático MangoBajito/SuperHotdog o pedirles opt-in?
2. ¿Restaurant template disponible Free tier o paywalled Pro?
3. ¿Prioridad vs SKY-4 (checkout backend)?

---

## Dependencies

**Blockers:**
- Ninguno (independiente otros tickets)

**Dependents:**
- SKY-4 (checkout) puede beneficiarse badges promo
- Onboarding wizard (agregar restaurant a opciones)

**Coordinación:**
- Aurora → Pixel (handoff design specs)
- Pixel → Sentinela (test IDs en nuevos componentes)

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Diseño no agrada clientes food | Low | High | Validar moodboard con MangoBajito antes full build |
| Performance imágenes food (large files) | Medium | Medium | Lazy load + WebP + Cloudinary resize |
| Complejidad CategoryTabs responsive | Low | Low | Usar library probada (react-horizontal-scrolling-menu) |
| Clients no migran de template actual | Medium | High | A/B test + ofrecer side-by-side preview |

---

## Resources

**Figma Files:**
- (Pending: Aurora genera link aquí)

**Tech Specs:**
- `types/theme.ts` (línea 14: TenantTemplate)
- `components/admin/TemplateSelector.tsx` (línea 23: TEMPLATES array)

**References:**
- PRD: `docs/projects/sw_commerce_saas/PRD.md`
- Clientes: MangoBajito (mangobajito.netlify.app), SuperHotdog (superhotdog.netlify.app)

---

## Timeline

| Milestone | Owner | Deadline | Status |
|-----------|-------|----------|--------|
| Design specs | Aurora | D+2 | 🟡 Pending |
| Pixel implementación | Pixel | D+5 | ⚪ Blocked by design |
| E2E tests | Sentinela | D+7 | ⚪ Blocked by Pixel |
| MangoBajito migration | Mentat + Pixel | D+10 | ⚪ Pending |
| SuperHotdog migration | Mentat + Pixel | D+12 | ⚪ Pending |
| Public launch | Mentat | D+14 | ⚪ Pending |

**D = Día inicio (hoy 2025-01-16)**

---

## Changelog

- **2025-01-16:** Ticket creado, Aurora delegado design tasks

---

**Status:** ✅ Ready for Aurora execution
