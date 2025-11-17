# SKY-43: Gallery Template Redesign - Notes

> Planning & context notes for gallery template improvement
> Created: 2025-01-17

---

## Cliente Target Inmediato

**🎨 Artista Visual - QR en Galería Física**

**🔴 CONTEXTO CRÍTICO:**
Clientes llegan escaneando **QR code en galería física** junto a cada cuadro:
- ✅ **100% tráfico mobile** (iPhone/Android, no desktop)
- ✅ **WiFi galería puede ser débil** (performance crítico)
- ✅ **Usuario parado/sentado** (portrait + landscape support)
- ✅ **Impulse buy** (están viendo arte físico, momentum de compra)
- ✅ **Tap targets grandes** (48x48px, prisa/emoción)
- ✅ **Load <2s** (no perder momentum impulse buy)

**Productos:**
- Digital prints (descarga inmediata, high-res)
- Cuadros físicos (diferentes tamaños, materiales)
- Bundles (digital + print con descuento)

**User Journey Real:**
1. 👁️ Ve cuadro físico en galería → **se enamora**
2. 📱 Escanea QR code junto al cuadro
3. 🌐 Land en catálogo mobile → **tap obra**
4. 👀 Quick View full-screen: opciones digital/físico
5. 🛒 Tap "Add to Cart" sticky bottom (thumb zone)
6. ✅ Checkout rápido → **compra (2 min total)**

**Necesidades:**
1. **Performance brutal** (<2s load, WiFi débil, no perder momentum)
2. **Quick View full-screen mobile** (claridad opciones)
3. **Sticky CTA thumb zone** (impulse buy mientras están ahí)
4. Presentación tipo galería de arte profesional
5. Diferenciación clara: digital vs físico
6. Showcase portfolio-quality pero lightweight
7. Opciones múltiples sin saturar (tamaños, formatos, materiales)
8. Perceived value alto (justifica precios arte)

**Pain Points con Gallery Actual:**
- Muy básico, no transmite valor artístico
- No diferencia digital vs físico
- No hay forma de mostrar opciones (tamaños) sin ir a página detalle
- Estética genérica, no galería/museo
- **No optimizado mobile (tráfico será 100% QR mobile)**
- **No performance optimizado (WiFi galería débil)**

---

## Decisiones Clave

### 1. Quick View Modal (Crítico)
Artista tiene mismo artwork en múltiples formatos:
- Digital download ($45)
- Canvas 60x80cm ($120)
- Framed 40x60cm ($180)
- Bundle digital + small print ($90)

**Solución:** Quick View modal que muestra opciones sin navegar.

### 2. Badges Type
Diferenciar claramente:
- 🖼️ Digital Download
- 🎨 Physical Print
- 📦 Both Available

### 3. Estética
Gallery White palette (neutro, tipo museo) para no competir con artwork.

### 4. Spacing
Generoso (32px desktop) - arte necesita breathing room.

---

## Otros Casos Uso (Futuro)

**SW4 Perfumes:**
- Ya usa gallery
- Visual-first (botella es arte)
- Necesita: zoom hover, badges (new, limited)

**Fashion Boutique:**
- Múltiples colores/tallas
- Necesita: Quick View con selectors
- Badges: sale, low stock

**Fotografía Stock:**
- Digital downloads principalmente
- Necesita: license options, sizes

---

## Scope Phases

**Phase 1 (MVP - este ticket):**
- Redesign GalleryCard (3 variantes)
- Quick View Modal
- Badge system (type, status)
- 3 paletas colores
- Design system completo
- Responsive grid mejorado

**Phase 2 (Futuro):**
- Color/size selectors en Quick View
- Image zoom/lightbox avanzado
- Filtro por product type (digital/physical)
- Collections/series agrupación
- Artist profile integration

---

## Questions Pendientes

- [ ] ¿Artista tiene artworks en diferentes aspect ratios? (cuadrados vs verticales)
- [ ] ¿Cuántos productos total? (afecta grid density)
- [ ] ¿Organiza en colecciones/series? (afecta nav)
- [ ] ¿Necesita watermark en preview? (protección digital)
- [ ] ¿Shipping físico es global o local? (afecta badges/info)

---

## Success Metrics

**Artista Visual (QR en Galería Física):**
- **QR scan → purchase:** <2 min (target impulse buy)
- **Mobile conversion:** ↑ 35% (vs gallery actual desktop baseline)
- **Bounce rate:** ↓ 40% (fast load, clear path to buy)
- **Load time mobile 3G:** <2s TTI (WiFi galería débil)
- **Perceived value:** ↑ 40% (user testing feedback)
- **Bundle purchases:** ↑ 20% (Quick View visibility)

**Technical Metrics:**
- Lighthouse mobile score: ≥90
- Core Web Vitals mobile: LCP <2.5s, FID <100ms, CLS <0.1
- Bundle size: <80KB JS gzip
- Image optimization: WebP delivery, lazy load, LQIP

**General Gallery Template:**
- Mobile engagement (tap, quick view): ↑ 40%
- Desktop metrics (secondary): engagement ↑ 20%

---

## Next Steps

1. ✅ Aurora → diseña sistema completo (SKY_43_AURORA_TASKS.md)
2. ⏳ Pixel → implementa components
3. ⏳ Sentinela → tests E2E + visual regression
4. ⏳ Deploy staging → test con artista real
5. ⏳ Gather feedback → iterate
6. ⏳ Production rollout

---

**Status:** Planning complete, Aurora ready to start design.
