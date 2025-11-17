# SKY-42: Template Restaurante/Comida - Aurora Tasks

> **Ticket:** SKY-42
> **Agente:** Aurora (Brand + Visual Design)
> **Prioridad:** Alta
> **Creado:** 2025-01-16
> **Owner:** Mentat → Aurora

---

## Contexto

Vendio actualmente tiene 3 templates:
- **Gallery:** visual-first, imágenes grandes, hover zoom (3 cols, 1:1)
- **Detail:** info-rich, descripciones amplias (2 cols, 16:9)
- **Minimal:** compacto, catálogos grandes (4 cols, 4:3)

Clientes reales:
- MangoBajito (hot dogs)
- SuperHotdog (hot dogs)
- SW4 Perfumes (inventario retail)

Necesitamos **4to template específico para restaurantes/food service**.

---

## Objetivo

Diseñar sistema visual completo para template **"restaurant"** que optimice venta de comida:
- UX adaptado a menú digital (categorías = secciones menú)
- Jerarquía visual clara (destacar promos, combos, add-ons)
- Diseño mobile-first (pedidos desde celular)
- Optimizado conversión rápida (hambre = baja tolerancia fricción)

---

## Scope Aurora

### 1. Identidad Visual Template

**Deliverables:**
- [ ] Moodboard (3-5 refs restaurante/food apps exitosas)
- [ ] Paleta colores sugerida (primary, accent, food-friendly)
- [ ] Tipografía (legible, appetite appeal)
- [ ] Iconografía (categorías comida: entradas, platos, postres, bebidas)

**Guidelines:**
- Colores cálidos/apetitosos (rojos, naranjas, amarillos)
- Evitar azules/fríos (reducen apetito)
- Contraste alto para legibilidad outdoor/móvil
- Espaciado generoso (fácil tap en carrito)

---

### 2. Product Card Design

Diseñar 3 variantes card producto food:

#### Variante A: "Menu Item" (Recomendada)
```
┌─────────────────────────────────┐
│ [Imagen 16:9 con badge promo]  │
│                                 │
│ Nombre Plato             $1200  │
│ Descripción corta (2 líneas)   │
│ 🌶️ Picante  🥗 Veggie          │
│                                 │
│          [+ Agregar]            │
└─────────────────────────────────┘
```
- Imagen aspect 16:9 (muestra contexto plato)
- Badges: promo, spicy, vegetariano, gluten-free
- Descripción 2-3 líneas (ingredientes destacados)
- CTA grande "Agregar" (no requiere modal)

#### Variante B: "Photo Hero"
```
┌─────────────────────────────────┐
│                                 │
│     [Imagen 1:1 grande]         │
│                                 │
│ Nombre Plato                    │
│ $1200                [+]        │
└─────────────────────────────────┘
```
- Imagen dominante (appetite appeal)
- Mínimo texto
- Quick add (botón flotante)

#### Variante C: "Compact List"
```
[Img] Nombre Plato.............$1200
      Descripción breve
      [+ Agregar]
```
- Para menús largos (>50 items)
- Scroll rápido
- Menos fricción visual

**Entregar:** Figma frames de 3 variantes + recomendación cuál por defecto.

---

### 3. Layout & Navegación

Diseñar estructura página catálogo:

#### Header (Sticky)
- Logo restaurante
- Tabs categorías horizontales (scroll)
  - Ej: 🍕 Pizzas | 🍔 Burgers | 🍰 Postres | 🍺 Bebidas
- Badge carrito (qty + total)

#### Grid Productos
- Mobile: 1 col (full width cards)
- Tablet: 2 cols
- Desktop: 2-3 cols (no más, comida necesita espacio)

#### Quick Actions
- Floating cart button (sticky bottom)
- "Scroll to top" después 2 pantallas

**Entregar:** Wireframes mobile + desktop en Figma.

---

### 4. Color Strategy

Proponer 3 paletas colores para restaurante template:

**Paleta A: "Warm Appetite"**
- Primary: #E63946 (rojo vibrante)
- Accent: #F4A261 (naranja cálido)
- Background: #F8F9FA (gris claro)
- Success: #06D6A0 (verde fresco)

**Paleta B: "Modern Bistro"**
- Primary: #264653 (azul oscuro elegante)
- Accent: #E76F51 (terracota)
- Background: #F1FAEE (beige suave)
- Success: #2A9D8F (verde azulado)

**Paleta C: "Fast Casual"**
- Primary: #FF6B35 (naranja energético)
- Accent: #FFC857 (amarillo mostaza)
- Background: #FFFFFF (blanco puro)
- Success: #4ECDC4 (turquesa)

**Recomendación:** Indicar cuál usar como default + rationale.

---

### 5. Assets & Iconografía

Crear/seleccionar iconos SVG para:

**Categorías comida (8-10 icons):**
- 🍕 Pizzas
- 🍔 Burgers
- 🥗 Ensaladas
- 🍝 Pastas
- 🍰 Postres
- ☕ Cafetería
- 🍺 Bebidas
- 🌯 Wraps/Sandwiches
- 🍛 Platos del día
- 🎉 Promociones

**Badges producto (6-8 icons):**
- 🔥 Nuevo
- 💰 Promo
- 🌶️ Picante (mild/medium/hot)
- 🥗 Vegetariano
- 🌱 Vegano
- 🚫 Sin gluten
- ⭐ Destacado

**Deliverable:** SVG pack + guía uso (cuándo mostrar qué badge).

---

### 6. Component Specs (Design System)

Documentar en Figma:

#### Componentes Atom
- Button Primary (CTA agregar carrito)
- Button Secondary (ver detalle)
- Badge (promo, nuevo, spicy, etc)
- Price Tag (con/sin descuento)
- Category Tab (active/inactive)

#### Componentes Molecule
- Product Card (3 variantes)
- Cart Item Row (editar qty, eliminar)
- Category Section (header + grid)

#### Componentes Organism
- Header con tabs
- Product Grid
- Floating Cart Summary

**Specs incluir:**
- Spacing (padding/margin)
- Typography scale
- Color tokens
- Hover/active states
- Mobile vs desktop breakpoints

---

### 7. Responsive Behavior

Definir breakpoints y ajustes:

| Breakpoint | Grid Cols | Card Variant | Header Behavior |
|------------|-----------|--------------|-----------------|
| Mobile (<640px) | 1 | Menu Item (full) | Tabs scroll horizontal |
| Tablet (640-1024px) | 2 | Menu Item | Tabs scroll horizontal |
| Desktop (>1024px) | 2-3 | Menu Item o Photo Hero | Tabs fit screen |

**Notas diseño:**
- Mobile: priorizr legibilidad (min font 16px evita zoom iOS)
- Tablet: aprovechar espacio sin comprometer tap targets (min 44x44px)
- Desktop: mantener cards compactas (no stretch full width)

---

## Deliverables Finales

### Archivos Figma
1. **Moodboard** (1 frame)
2. **Paletas colores** (3 opciones con recomendación)
3. **Product Cards** (3 variantes diseñadas)
4. **Wireframes** (mobile + desktop)
5. **Design System** (componentes documentados con specs)
6. **Icon Pack** (SVG exports)

### Documentación
7. **SKY_42_DESIGN_SPECS.md** (este doc lo genera Aurora):
   - Decisiones design rationale
   - Paleta elegida + por qué
   - Card variant recomendada por caso uso
   - Guidelines customización tenant (qué puede cambiar dueño restaurante)
   - Accessibility notes (contrast ratios, tap targets, alt texts)

---

## Constraints & Guidelines

### DO
✅ Diseño appetite-driven (colores, imágenes, spacing)
✅ Mobile-first (80% pedidos desde celular)
✅ Quick add to cart (reducir clics)
✅ Badges visuales claros (promos, tags dietarios)
✅ Accesibilidad (WCAG AA mínimo)

### DON'T
❌ Colores fríos (azules, violetas)
❌ Fuentes script/difíciles leer móvil
❌ Cards pequeñas (<280px width mobile)
❌ Imagery genérica stock (usar placeholders realistas food)
❌ Ignorar landscape mobile (común en restaurantes)

---

## Handoff to Pixel

Cuando Aurora termine diseño, Pixel implementará:
1. Agregar `'restaurant'` a `TenantTemplate` type
2. Crear defaults en `TEMPLATE_DEFAULTS` (theme.ts:80)
3. Implementar ProductCard variantes
4. CSS vars para paleta colores
5. Responsive grid ajustes

**Coordinación:**
Aurora debe marcar en Figma qué es **template default** vs **customizable por tenant**.

---

## Definition of Done

- [ ] Figma file completo con 6 frames requeridos
- [ ] Icon pack SVG exportado
- [ ] SKY_42_DESIGN_SPECS.md generado con rationale + guidelines
- [ ] Handoff session con Pixel (15min review specs)
- [ ] Aprobación Mentat (validar contra objetivos negocio)

---

## Referencias

**Competencia/inspiración:**
- Rappi (tabs categorías)
- PedidosYa (badges promos)
- Uber Eats (product cards)
- DoorDash (quick add)

**Archivos proyecto:**
- `types/theme.ts` (estructura templates actual)
- `components/admin/TemplateSelector.tsx` (UI selector)
- `docs/projects/sw_commerce_saas/PRD.md` (contexto negocio)

**Clientes target:**
- MangoBajito (hot dogs, combos)
- SuperHotdog (hot dogs, promos)
- Futuros: pizzerías, cafeterías, food trucks

---

## Timing Estimado

- Moodboard + paletas: **2h**
- Product cards (3 variantes): **3h**
- Wireframes responsive: **2h**
- Design system specs: **2h**
- Icon pack: **1h**
- Documentación: **1h**

**Total:** ~11h (1.5 días)

---

## Próximos Pasos

1. Aurora ejecuta tasks
2. Genera `SKY_42_DESIGN_SPECS.md`
3. Handoff con Pixel
4. Pixel implementa en `SKY_42_PIXEL_TASKS.md`
5. Mentat valida contra métricas conversión

---

**Aurora, listo para diseñar sistema visual restaurant template.** 🎨🍔
