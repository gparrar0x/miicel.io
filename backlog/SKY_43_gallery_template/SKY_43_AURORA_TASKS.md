# SKY-43: Gallery Template Redesign - Aurora Tasks

> **Ticket:** SKY-43
> **Agente:** Aurora (Brand + Visual Design)
> **Prioridad:** Alta
> **Creado:** 2025-01-17
> **Owner:** Mentat → Aurora

---

## Contexto

Vendio tiene actualmente 3 templates:
- **Gallery:** visual-first, imágenes grandes, hover zoom (3 cols, 1:1) - **ESTE**
- **Detail:** info-rich, descripciones amplias (2 cols, 16:9)
- **Minimal:** compacto, catálogos grandes (4 cols, 4:3)
- **Restaurant:** optimizado comida, categorías, badges (2-3 cols, 16:9) - recién diseñado

**Problema:**
El template **Gallery** es el más antiguo y básico. Solo tiene:
- Imagen grande 1:1 con hover zoom
- Texto overlay básico (nombre + precio)
- Stock indicators
- Sin badges, sin categorización, sin personalización visual

**Cliente Real Inmediato:**
🎨 **Artista visual** vendiendo:
- Digital prints (descarga inmediata)
- Cuadros físicos (diferentes tamaños/materiales)
- Necesita: presentación tipo galería de arte, diferenciación producto digital/físico, showcase portfolio-quality

**🔴 CONTEXTO CRÍTICO - QR en Galería Física:**
Los clientes llegarán escaneando **QR code en galería física**:
- ✅ **100% tráfico mobile** (no desktop, no tablet)
- ✅ **Usuario está viendo arte físico** → escanea para comprar/info
- ✅ **Compra rápida** (mientras están ahí, impulse buy)
- ✅ **WiFi galería puede ser inestable** (lightweight, offline-ready)
- ✅ **Portrait + Landscape** (usuarios parados o sentados viendo)
- ✅ **Tap targets grandes** (44x44px mínimo, preferible 48x48px)
- ✅ **Font 16px+** (iOS no-zoom, legibilidad galería con luz variable)

**Otros clientes potenciales:**
- SW4 Perfumes (perfumería, actualmente usa gallery)
- Fashion boutiques (ropa, accesorios)
- Artesanías, fotografía stock
- Joyería, decoración home

---

## Objetivo

Rediseñar sistema visual completo para template **"gallery"** optimizado para **QR en galería física**:
- **Mobile-first absoluto** (100% tráfico desde QR scan)
- Estética galería de arte / portfolio profesional
- UX rápida: tap → quick view → buy (3 pasos max)
- Diferenciación visual productos digitales vs físicos
- Performance: lightweight, offline-ready, fast load en WiFi débil
- Landscape + Portrait support (usuarios parados/sentados)
- Diseño premium, aspiracional, que valorice el arte/producto

**KPI Target:**
- Time to purchase ↓ 50% (QR scan → checkout en <2 min)
- Mobile conversion ↑ 35% (impulse buy en galería física)
- Bounce rate ↓ 40% (fast load, clear CTA)
- Perceived value ↑ 40% (vs gallery actual)

---

## Scope Aurora

### 1. Identidad Visual Template

**Deliverables:**
- [ ] Moodboard (3-5 refs galería arte online: Saatchi Art, Artsy, Behance, Format portfolio)
- [ ] 3 paletas colores sugeridas (gallery white, modern dark, warm neutral)
- [ ] Tipografía elegante minimalista (tipo museo/galería)
- [ ] Sistema de badges discretos (digital, limited, new arrival, sold)

**Guidelines:**
- Estética museo/galería contemporánea
- Background neutro (no compite con artwork)
- Tipografía serif elegante o sans-serif refined
- Espaciado generoso (breathing room para arte)
- Badges sutiles, no invasivos

---

### 2. Product Card Design

Rediseñar card gallery con 3 variantes:

#### Variante A: "Art Gallery" (Recomendada para artista)
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│     [Imagen 1:1 alta calidad]   │
│                                 │
│ [🖼️ Digital]                   │
│                                 │
│ "Sunset Over Mountains"         │
│ From $45 • 3 formats            │
│                                 │
│ [❤️] [🔍 Quick View]            │
└─────────────────────────────────┘
```
- Imagen dominante 1:1 (o 4:5 portrait flexible)
- Badge discreto tipo producto (Digital / Physical / Print)
- Título obra (no "nombre producto" genérico)
- Precio desde + opciones disponibles
- Iconos acción bottom (wishlist, quick view)
- Hover: lift sutil + shadow suave (tipo marco flotante)

#### Variante B: "Magazine Editorial"
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│     [Imagen 4:5 portrait]       │
│                                 │
│                                 │
│                                 │
│ ──────────────────────────────  │
│                                 │
│ TÍTULO OBRA                     │
│ Limited Edition • $120          │
│                                 │
└─────────────────────────────────┘
```
- Aspecto vertical tipo revista
- Espaciado ultra generoso
- Tipografía grande, statement
- Info mínima, elegante

#### Variante C: "Overlay Minimal"
```
┌─────────────────────────────────┐
│                                 │
│  [Imagen con gradient bottom]   │
│                                 │
│  Título Obra                    │
│  $45+              [❤️] [🔍]   │
└─────────────────────────────────┘
```
- Todo sobre imagen (overlay elegante)
- Gradient sutil bottom
- Iconos floating
- Hover: gradient más visible + botones

**CRÍTICO para artista visual:**
- Quick View debe mostrar: preview imagen full, opciones (tamaños, digital/físico), price matrix
- Badge "Digital" vs "Physical" vs "Both" clarísimo
- Thumbnail debe ser alta calidad (no compression artifacts)

**Entregar:** Figma frames de 3 variantes + recomendación para caso artista.

---

### 3. Quick View Modal (Nuevo componente crítico)

Para productos con múltiples opciones (digital prints + físicos), diseñar modal Quick View:

```
┌──────────────────────────────────────────────────────┐
│                                        [×]           │
│  ┌─────────────────────┐                            │
│  │                     │  "Sunset Over Mountains"   │
│  │                     │  by Artist Name            │
│  │  [Imagen grande]    │                            │
│  │                     │  ┌─────────────────────┐   │
│  │                     │  │ 🖼️ Digital Download │   │
│  │                     │  │ • High-res JPG      │   │
│  │                     │  │ • 300 DPI, 4000px   │   │
│  └─────────────────────┘  │ $45                 │   │
│                           └─────────────────────┘   │
│                                                      │
│                           ┌─────────────────────┐   │
│                           │ 🖼️ Physical Print   │   │
│                           │ • Canvas 60x80cm    │   │
│                           │ • Gallery wrap      │   │
│                           │ $120                │   │
│                           └─────────────────────┘   │
│                                                      │
│                           [View Full Details]        │
└──────────────────────────────────────────────────────┘
```

**Features:**
- Imagen grande preview
- Tabs o cards para opciones (Digital / Physical / Bundles)
- Specs visuales claras (tamaño, material, entrega)
- CTA por opción (no único global)
- Link a página detalle completa

---

### 4. Layout & Navegación

Diseñar estructura página catálogo:

#### Header (Opción Gallery/Portfolio)
- Logo/Artist name centered
- Nav minimal: Shop | About | Contact
- Search + Cart iconos right
- Background: blanco/off-white (museo vibe)

#### Hero Section (Opcional, configurable)
- Featured artwork full-width
- Overlay text: Artist name + tagline
- CTA: "Explore Collection"

#### Grid System
- Mobile: 1 col (arte necesita atención full) o 2 cols (comparación)
- Tablet: 2-3 cols
- Desktop: 3 cols (sweet spot galería, no más)
- Espacio entre cards: generoso (24-32px, no apretado)

#### Filtros & Sorting
- **Filtros clave para artista:**
  - Type: Digital / Physical / Both
  - Format: Canvas, Framed, Poster, Download
  - Size: Small / Medium / Large
  - Price range
  - Collection (si artista organiza en series)

- Sidebar collapsible (desktop) o drawer (mobile)
- Sort: Featured, New, Price, Popular

#### Footer (Opcional para artista)
- About artist (mini bio + photo)
- Social links (Instagram, Behance, etc)
- Copyright notice

**Entregar:** Wireframes mobile + tablet + desktop específicos para caso artista.

---

### 5. Color Strategy

Proponer 3 paletas colores para gallery template:

**Paleta A: "Gallery White" (Recomendada para artista)**
- Primary: #FFFFFF (blanco puro, museo)
- Accent: #1A1A1A (negro texto)
- Highlight: #B8860B (gold sutil para CTAs)
- Background: #FAFAFA (off-white suave)

Rationale: Neutro total, artwork es protagonista, estética galería profesional.

**Paleta B: "Modern Dark"**
- Primary: #0F0F0F (casi negro)
- Accent: #F5F5F5 (blanco texto)
- Highlight: #3B82F6 (blue accent)
- Background: #1A1A1A (dark elegant)

Rationale: Drama, contraste, works con fotografía/arte digital, modern edge.

**Paleta C: "Warm Neutral"**
- Primary: #2C2416 (brown oscuro)
- Accent: #E8DCC4 (beige cálido)
- Highlight: #8B7355 (terracota)
- Background: #F5F1E8 (cream suave)

Rationale: Calidez, organic, vintage gallery vibe, sofisticado.

**Recomendación:** Gallery White como default, pero permitir switch fácil (tenant preference).

---

### 6. Badges & Labels System

Diseñar badges específicos para caso artista + general:

**Type Badges (crítico para artista):**
- 🖼️ Digital Download (blue outline)
- 🎨 Physical Print (brown fill)
- 📦 Both Available (purple outline)
- 🖨️ Print on Demand (gray outline)

**Status Badges:**
- ✨ New Arrival (gold)
- 🔥 Limited Edition (red)
- ⭐ Featured (yellow)
- ✓ Sold (as physical, gray)

**Delivery Badges:**
- ⚡ Instant Download (digital, green)
- 🚚 Ships in 7-10 days (physical, blue)

**Placement:**
- Top-left corner: Type badge (Digital/Physical)
- Top-right corner: Status badge (New, Limited, etc)
- Bottom-left: Delivery badge (hover visible)

**Deliverable:** SVG pack + guía uso + Figma components.

---

### 7. Assets & Iconografía

Crear/seleccionar iconos SVG:

**Actions (8 icons):**
- ❤️ Wishlist (heart outline → fill)
- 🔍 Quick View (magnifying glass)
- 🛒 Add to Cart (bag)
- 👁️ View Details (eye)
- 📥 Download (digital products)
- 📐 Size Guide (physical products)
- ⭐ Rating stars

**Product Type Icons:**
- 🖼️ Digital (monitor/download)
- 🎨 Canvas
- 🖨️ Poster/Print
- 🖼️ Framed
- 📦 Physical (box)
- 🎁 Bundle/Set

**Deliverable:** SVG sprite + individual files + usage guide.

---

### 8. Component Specs (Design System)

Documentar en Figma:

#### Componentes Atom
- Button Primary (Add to Cart, Buy Now)
- Button Secondary (Quick View, View Details)
- Button Icon (Wishlist, Download)
- Badge Type (Digital, Physical, Both)
- Badge Status (New, Limited, Featured)
- Price Tag (simple, range "From $X", discount)
- Icon (action icons, product type icons)

#### Componentes Molecule
- Product Card (3 variantes)
- Quick View Modal
- Option Selector (Digital/Physical tabs)
- Size/Format Picker (visual buttons)
- Filter Pill (active/inactive)
- Image Zoom (hover/click behavior)

#### Componentes Organism
- Product Grid (responsive, spacing rules)
- Filter Sidebar (collapsible, categories)
- Header Gallery (minimal, centered)
- Hero Section (optional, configurable)
- Footer Artist Info (bio, social)

**Specs incluir:**
- Spacing system: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- Typography scale:
  - Body: 16px (mobile), 18px (desktop)
  - Small: 14px
  - Heading: 24px, 32px, 48px
  - Display: 64px (hero)
- Color tokens: primary, accent, highlight, bg, text, muted
- Elevation: 0 (flat), 1 (subtle), 2 (lifted), 3 (modal)
- Border radius: 0 (square, gallery vibe) o 8px (soft modern)
- Animation timings: fast 150ms, normal 300ms, slow 500ms
- Breakpoints: mobile <640px, tablet 640-1024px, desktop >1024px

---

### 9. Responsive Behavior (Mobile-First Absoluto)

**🔴 PRIORIDAD: Mobile es 100% del tráfico (QR scan)**

Definir mobile primero, tablet/desktop secundarios:

| Breakpoint | Grid Cols | Card Size | Image Aspect | Tap Target | Font Size |
|------------|-----------|-----------|--------------|------------|-----------|
| **Mobile Portrait** (<640px) | **1** | **Full width** | **1:1 o 4:5** | **48x48px** | **16px+** |
| **Mobile Landscape** (640-900px) | **2** | **50% width** | **1:1 o 4:5** | **48x48px** | **16px+** |
| Tablet (900-1024px) | 2-3 | 240-280px | 1:1 o 4:5 | 44x44px | 16px |
| Desktop (>1024px) | 3 | 320-360px | 1:1 o 4:5 | 44x44px | 16px |

**Notas diseño mobile (CRÍTICO):**
- **Portrait:** 1 col (full attention, artwork grande, scroll vertical natural)
- **Landscape:** 2 cols (usuario sentado, comparación lado a lado)
- **Tap targets:** 48x48px mínimo (thumb-friendly, galería física = prisa)
- **Font:** 16px+ (iOS no-zoom, luz galería variable)
- **Quick View modal:** Full-screen mobile (no small drawer, needs clarity)
- **Spacing:** 16px mobile (compacto pero breathable)
- **CTA:** Sticky bottom (thumb zone, "Add to Cart" siempre visible)
- **Images:** Lazy load, WebP, LQIP (WiFi galería débil)

**Performance mobile (WiFi galería débil):**
- Critical CSS inline (<14KB)
- Defer non-critical (modals, tooltips)
- Images: WebP + JPEG fallback, lazy load, 800px max width
- Total bundle: <80KB JS gzip
- TTI: <2s en 3G (target galería con WiFi malo)

---

### 10. Animation & Microinteractions

Definir animaciones elegantes, sutiles:

**Card Hover (Desktop):**
1. Transform: translateY(-8px) suave
2. Shadow: 0 → 20px blur, 0.1 opacity (tipo marco flotante)
3. Image: scale(1.03) muy sutil (no exagerado)
4. Badge: mantiene posición (no distrae)
5. Actions: fade-in 200ms (wishlist, quick view buttons)

**Card Tap (Mobile):**
1. Scale: 0.98 (feedback táctil)
2. Shadow: mantiene elevation
3. Navigate 150ms después

**Quick View Modal:**
1. Backdrop: fade-in 200ms, blur(4px)
2. Modal: scale(0.95) → 1.0 + fade-in 300ms
3. Close: scale → 0.95 + fade-out 200ms

**Image Load:**
1. Placeholder: blur-up (LQIP)
2. Skeleton → image fade-in 300ms
3. Error: fade-in placeholder icon

**Filter Apply:**
1. Grid fade-out 150ms
2. Skeleton if loading >300ms
3. New items stagger fade-in 50ms delay

**Deliverable:** Animation specs en Figma (durations, easings, triggers).

---

## Deliverables Finales

### Archivos Figma
1. **Moodboard** - Referencias galería arte online
2. **Paletas colores** - 3 opciones (Gallery White recomendada)
3. **Product Cards** - 3 variantes (Art Gallery recomendada)
4. **Quick View Modal** - Para productos con opciones múltiples
5. **Wireframes** - Mobile + tablet + desktop (caso artista)
6. **Design System** - Componentes atoms → organisms
7. **Icon Pack** - Actions + type icons + badges
8. **Animation Specs** - Hover, transitions, microinteractions

### Documentación
9. **SKY_43_DESIGN_SPECS.md** - Documento maestro:
   - Decisiones design rationale
   - Caso uso artista visual (digital + physical)
   - Paleta recomendada + alternativas
   - Card variant por caso uso
   - Quick View patterns
   - Customización tenant guidelines
   - Accessibility WCAG AA
   - Performance (image optimization, lazy load)

10. **SKY_43_MOODBOARD.md** - Referencias visuales detalladas
11. **SKY_43_COLOR_PALETTES.md** - 3 paletas con hex codes
12. **SKY_43_PRODUCT_CARDS.md** - 3 variantes comparadas
13. **SKY_43_WIREFRAMES.md** - Layouts anotados
14. **SKY_43_DESIGN_SYSTEM.md** - Tokens, spacing, components
15. **SKY_43_ICON_PACK.md** - SVG specs completas

---

## Constraints & Guidelines

### DO (Mobile QR Context)
✅ **Mobile-first ABSOLUTO** (100% tráfico QR, diseña mobile primero)
✅ **Tap targets 48x48px** (thumb-friendly, usuario en galería)
✅ **Font 16px+** (iOS no-zoom, luz galería variable)
✅ **Performance brutal** (<2s TTI en 3G, WiFi galería débil)
✅ **Quick View full-screen mobile** (claridad, impulse buy)
✅ **Sticky CTA bottom** (thumb zone, siempre accesible)
✅ **Portrait + Landscape** (usuarios parados/sentados)
✅ Diseño tipo galería arte/museo (neutral, elegante)
✅ Diferenciar claramente digital vs físico (badges, labels)
✅ Alta calidad imagen con lazy load (WebP, LQIP)
✅ Accessibility WCAG AA (contrast, focus, alt text)

### DON'T (Mobile QR Context)
❌ **Diseñar desktop primero** (mobile ES el producto)
❌ **Tap targets <44px** (frustración en galería)
❌ **Font <16px** (iOS zoom, ilegible galería)
❌ **Animaciones pesadas** (perf issue WiFi débil)
❌ **Hover states críticos** (mobile no tiene hover)
❌ **Modals pequeños mobile** (full-screen o nada)
❌ **CTAs escondidos** (sticky bottom thumb zone)
❌ Background que compite con artwork (solo neutros)
❌ Badges grandes/invasivos (discretos, esquinas)
❌ Grid apretado (arte necesita breathing room)

---

## Casos de Uso Clave

### Caso 1: Artista Visual (Cliente Real) - QR en Galería Física

**Context:**
- QR codes junto a cada cuadro físico en galería
- Usuario escanea para ver opciones / comprar
- 100% tráfico mobile (iPhone/Android mayoría)
- WiFi galería puede ser lento
- Impulse buy (están viendo arte físico, quieren llevarlo YA)

**Productos:**
- Digital print "Sunset Mountains" ($45)
- Canvas print 60x80cm ($120)
- Framed print 40x60cm ($180)
- Bundle digital + small print ($90, 25% off)

**User Journey:**
1. Ve cuadro físico en galería → se enamora
2. Escanea QR (móvil, parado/sentado)
3. Land en catálogo → tap obra específica
4. Quick View full-screen: opciones digital/físico
5. Tap "Add to Cart" sticky bottom
6. Checkout rápido → compra (2 min total)

**Necesidades:**
- Load <2s (WiFi galería débil, no perder momentum)
- Quick View full-screen mobile (clarity)
- Sticky CTA bottom (thumb zone)
- Showcase portfolio-quality pero lightweight
- Diferenciación digital/físico obvia
- Perceived value alto (justifica precios)

**Template Config:**
- Variant: Art Gallery (mobile-optimized)
- Palette: Gallery White
- Grid: **1 col portrait, 2 cols landscape** (mobile priority)
- Quick View: Enabled, full-screen mobile
- Performance: <80KB bundle, WebP images, LQIP

---

### Caso 2: Perfumería (SW4 Perfumes)
**Productos:**
- Perfumes alta gama ($80-$150)
- Visual-first (botella es arte)

**Necesidades:**
- Imagen producto dominante
- Badges: New arrivals, Limited edition
- Hover: Zoom para ver detalle botella

**Template Config:**
- Variant: Classic Gallery
- Palette: Modern Dark o Warm Neutral
- Grid: 3 cols
- Quick View: Optional (productos simples)

---

### Caso 3: Fashion Boutique
**Productos:**
- Ropa, accesorios
- Múltiples colores/tallas

**Necesidades:**
- Quick View con color/size selector
- Badges: Sale, New, Low stock
- Hover: Second image (back view)

**Template Config:**
- Variant: Magazine Style
- Palette: según brand
- Grid: 3-4 cols
- Quick View: Enabled

---

## Handoff to Pixel

Cuando Aurora termine, Pixel implementará:

**Files to update:**
- `components/storefront/GalleryCard.tsx` (redesign)
- `components/storefront/QuickViewModal.tsx` (NEW)
- `components/ui/Badge.tsx` (NEW, reutilizable)
- `types/product.ts` (agregar type: digital | physical | both)
- `types/theme.ts` (gallery theme options)

**Tasks:**
1. Implementar 3 variantes GalleryCard
2. Crear QuickViewModal component
3. Badge system (Type, Status, Delivery)
4. Hover animations CSS
5. Responsive grid adjustments
6. Image optimization (WebP, lazy load, LQIP)
7. Admin UI: Gallery template settings (variant, palette, grid cols)

**Coordinación:**
- Aurora marca en Figma: default vs customizable
- Pixel usa design tokens (CSS vars)
- Handoff session 30min

---

## Definition of Done

- [ ] Figma file completo (8 frames: moodboard, palettes, cards, modal, wireframes, design system, icons, animations)
- [ ] Documentación completa (SKY_43_DESIGN_SPECS.md + 6 docs adicionales)
- [ ] Icon pack SVG exportado + sprite
- [ ] Animation specs detalladas
- [ ] Caso uso artista visual documentado
- [ ] Handoff session con Pixel (30min)
- [ ] Aprobación Mentat (validar vs negocio + cliente artista)

---

## Referencias

**Inspiración galería arte:**
- Saatchi Art (online art gallery)
- Artsy (art marketplace)
- Format (portfolio platform for artists)
- Behance (creative showcase)
- Squarespace templates (gallery/portfolio)

**Inspiración ecommerce visual:**
- Nike (product interactions)
- Farfetch (luxury fashion)
- Etsy (artisan products)
- Shopify gallery themes

**Files proyecto:**
- `components/storefront/GalleryCard.tsx` (actual)
- `types/theme.ts` (templates)
- `backlog/SKY_42_restaurant_template/` (referencia)

**Cliente target inmediato:**
- 🎨 Artista visual: digital prints + cuadros físicos

**Otros clientes potenciales:**
- SW4 Perfumes (usa gallery actualmente)
- Fashion boutiques
- Fotografía stock
- Joyería/decoración

---

## Timing Estimado

- Moodboard + research (galería arte): **2.5h**
- Paletas colores (3 opciones): **1.5h**
- Product cards (3 variantes): **4h**
- Quick View Modal (NEW): **2.5h**
- Wireframes responsive (3 breakpoints): **3h**
- Design system specs (atoms → organisms): **3.5h**
- Icon pack + badges: **2h**
- Animation specs: **2h**
- Documentación (7 docs): **3h**

**Total:** ~24h (3 días)

---

## Próximos Pasos

1. Aurora ejecuta tasks → genera deliverables
2. Aurora escribe documentación (7 docs)
3. Handoff con Pixel (30min review)
4. Pixel implementa en `SKY_43_PIXEL_TASKS.md`
5. Sentinela tests en `SKY_43_SENTINELA_TASKS.md`
6. Deploy staging → test con artista visual real
7. Mentat valida métricas (engagement, conversión)
8. Production rollout

---

**Aurora, listo para diseñar gallery template premium para artistas y marcas visuales.** 🎨🖼️✨
