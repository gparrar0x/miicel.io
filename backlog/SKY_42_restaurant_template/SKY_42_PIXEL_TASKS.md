# SKY-42: Template Restaurante - Pixel Tasks

> **Ticket:** SKY-42
> **Agente:** Pixel (Frontend Implementation)
> **Prioridad:** Alta
> **Creado:** 2025-01-16
> **Owner:** Mentat → Aurora → Pixel

---

## Contexto

Aurora completó diseño sistema visual template "restaurant":
- 3 wireframes (mobile/tablet/desktop) + imágenes PNG
- Paleta Warm Appetite (rojo #E63946 + naranja #F4A261)
- Product Card variant "Menu Item" (16:9 + badges + quick add)
- Design system completo (tokens, components)

**Tu scope:** Implementar template funcional en Next.js.

---

## Objetivo

Agregar 4to template `'restaurant'` a Vendio SaaS con:
- Seleccionable en admin (`/{tenant}/admin/settings`)
- Layout optimizado food (mobile-first)
- Category tabs horizontal scroll
- Product cards con badges (promo, spicy, veggie)
- Floating cart sticky
- Responsive (1 col mobile → 2 tablet → 3 desktop)

---

## Deliverables

### 1. Type Definitions
- [ ] Agregar `'restaurant'` a `TenantTemplate` type
- [ ] Agregar defaults `TEMPLATE_DEFAULTS.restaurant`
- [ ] Extender `ThemeOverrides` si necesario (badges config)

### 2. Components (Atomic Design)

#### Atoms
- [ ] `FoodBadge.tsx` (promo, nuevo, spicy, veggie, etc)
- [ ] `CategoryIcon.tsx` (wrapper SVG/emoji)
- [ ] `QuickAddButton.tsx` (+ Agregar con loading state)

#### Molecules
- [ ] `ProductCardRestaurant.tsx` (variant Menu Item)
- [ ] `CategoryTab.tsx` (tab individual con icon + label)
- [ ] `CartSummary.tsx` (qty + total inline)

#### Organisms
- [ ] `CategoryTabsNav.tsx` (horizontal scroll + sticky spy)
- [ ] `ProductGridRestaurant.tsx` (responsive 1/2/3 cols)
- [ ] `FloatingCartButton.tsx` (sticky bottom con animation)

### 3. Layout Template
- [ ] `app/[tenant]/(restaurant)/page.tsx` (condicional si template === 'restaurant')
- [ ] O extender `app/[tenant]/page.tsx` con switch template
- [ ] Header con logo + cart badge
- [ ] Section headers por categoría

### 4. Styling
- [ ] CSS variables paleta Warm Appetite
- [ ] Responsive grid (Tailwind breakpoints)
- [ ] Animations (tab scroll, cart slide-up, button states)
- [ ] Mobile-first (min font 16px, tap 44px)

### 5. Admin Integration
- [ ] Actualizar `TemplateSelector.tsx` (agregar 4ta opción)
- [ ] Preview template restaurant
- [ ] Guardar `tenants.template = 'restaurant'` en DB

### 6. Testing
- [ ] Test IDs todos los componentes nuevos
- [ ] Visual regression (Percy/Chromatic)
- [ ] E2E happy path (browse → add cart → checkout)

---

## Specs Técnicos (desde Aurora)

### Paleta Colores

```typescript
// lib/themes/restaurant.ts
export const RESTAURANT_THEME = {
  primary: '#E63946',      // Red (appetite trigger)
  accent: '#F4A261',       // Orange (warmth)
  background: '#F8F9FA',   // Light gray
  surface: '#FFFFFF',      // White
  success: '#06D6A0',      // Green (fresh)
  textPrimary: '#1F2937',  // Gray-800
  textSecondary: '#6B7280' // Gray-500
}
```

### Template Defaults

```typescript
// types/theme.ts (línea 80)
TEMPLATE_DEFAULTS = {
  // ... existing templates
  restaurant: {
    gridCols: 2,              // Mobile 1, tablet 2, desktop 3
    imageAspect: '16:9',      // Show full plate context
    cardVariant: 'outlined',  // Clear item definition
    spacing: 'normal',        // Balance info vs scroll
  }
}
```

### Component Specs

#### ProductCardRestaurant

```tsx
interface ProductCardRestaurantProps {
  product: Product
  onAddToCart: (productId: string) => void
  badges?: BadgeType[]  // ['promo', 'nuevo', 'spicy', 'veggie']
}

// Layout (328px mobile, 340px tablet, 360px desktop)
// - Image 16:9 aspect (hover zoom sutil)
// - Badge stack top-left absolute
// - Title 18px bold
// - Description 14px gray (2 lines clamp)
// - Price 20px bold primary
// - Button 48px height, full width, success color
```

#### CategoryTabsNav

```tsx
interface CategoryTabsNavProps {
  categories: Category[]
  activeCategory: string
  onTabClick: (categoryId: string) => void
}

// Behavior:
// - Horizontal scroll (overflow-x-auto hide-scrollbar)
// - Sticky top 64px (below header)
// - Active tab: bold + 3px underline primary
// - Scroll spy: update active on section scroll
// - Smooth scroll to category on click
```

#### FloatingCartButton

```tsx
interface FloatingCartButtonProps {
  itemCount: number
  totalAmount: number
  onViewCart: () => void
}

// Specs:
// - Fixed bottom 0, z-index 50
// - Height 72px (safe area +16px iOS)
// - Background primary (#E63946)
// - White text
// - Slide up animation (enter from bottom)
// - Hide if itemCount === 0
```

### Badges System

```typescript
// types/badges.ts
export type BadgeType =
  | 'nuevo'      // 🔥 Red bg
  | 'promo'      // 💰 Orange bg
  | 'spicy-mild' // 🌶️ Yellow
  | 'spicy-hot'  // 🌶️🌶️ Red
  | 'veggie'     // 🥗 Green
  | 'vegan'      // 🌱 Dark green
  | 'gluten-free' // 🚫 Purple

export const BADGE_CONFIG: Record<BadgeType, BadgeStyle> = {
  nuevo: { bg: '#E63946', text: 'white', icon: '🔥' },
  promo: { bg: '#F4A261', text: 'white', icon: '💰' },
  // ... etc
}
```

### Responsive Breakpoints

```css
/* Tailwind config extend */
screens: {
  'xs': '375px',   // Mobile (iPhone)
  'sm': '640px',   // Tablet start
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop start
  'xl': '1280px',  // Desktop max-width container
}

/* Grid responsive */
.product-grid {
  @apply grid gap-4;
  @apply grid-cols-1;           /* Mobile */
  @apply sm:grid-cols-2;        /* Tablet */
  @apply lg:grid-cols-3;        /* Desktop */
  @apply xl:max-w-[1280px] xl:mx-auto; /* Centered */
}
```

---

## Implementación por Fases

### Fase 1: Types + Theme (1h)

**Files:**
```
types/theme.ts
  - Add 'restaurant' to TenantTemplate
  - Add TEMPLATE_DEFAULTS.restaurant

lib/themes/restaurant.ts (new)
  - Export RESTAURANT_THEME constants
  - CSS variable generator
```

**Tasks:**
- [ ] Modificar `TenantTemplate` type (línea 14)
- [ ] Agregar defaults restaurant (línea 80)
- [ ] Crear theme file con paleta
- [ ] Validar build pasa

---

### Fase 2: Atomic Components (3h)

**Files:**
```
components/restaurant/atoms/
  ├─ FoodBadge.tsx
  ├─ CategoryIcon.tsx
  └─ QuickAddButton.tsx
```

**FoodBadge specs:**
```tsx
<FoodBadge type="nuevo" />
// Renders:
// <span class="badge-nuevo" data-testid="badge-nuevo">
//   🔥 NUEVO
// </span>

// Styles:
// - Inline-flex, rounded-full, px-2 py-1
// - Font 12px bold uppercase
// - Bg from BADGE_CONFIG
// - Absolute position top-2 left-2 (on card)
```

**QuickAddButton specs:**
```tsx
<QuickAddButton onClick={handleAdd} loading={false} added={false} />

// States:
// 1. Default: "+ Agregar" (success bg)
// 2. Loading: "..." (disabled, spinner)
// 3. Added: "✓ Agregado" (1sec, then default)
```

**Tasks:**
- [ ] Implementar 3 atoms con test IDs
- [ ] Storybook stories (opcional)
- [ ] Unit tests (jest)

---

### Fase 3: Molecule Components (4h)

**Files:**
```
components/restaurant/molecules/
  ├─ ProductCardRestaurant.tsx
  ├─ CategoryTab.tsx
  └─ CartSummary.tsx
```

**ProductCardRestaurant layout:**
```tsx
<div className="product-card-restaurant" data-testid={`product-card-${product.id}`}>
  {/* Image wrapper 16:9 */}
  <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
    <Image src={product.image} fill className="object-cover hover:scale-105" />
    {/* Badges stack */}
    <div className="absolute top-2 left-2 flex flex-col gap-1">
      {badges.map(type => <FoodBadge key={type} type={type} />)}
    </div>
  </div>

  {/* Content */}
  <div className="p-4">
    <h3 className="text-lg font-bold">{product.name}</h3>
    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

    <div className="flex items-center justify-between mt-3">
      <span className="text-xl font-bold text-primary">${product.price}</span>
      <QuickAddButton onClick={() => onAddToCart(product.id)} />
    </div>
  </div>
</div>
```

**CategoryTab:**
```tsx
<button
  className={cn(
    "category-tab",
    isActive && "category-tab-active"
  )}
  data-testid={`category-tab-${category.slug}`}
  onClick={() => onTabClick(category.id)}
>
  <CategoryIcon icon={category.icon} />
  <span>{category.name}</span>
</button>

// Styles:
// - Flex items-center gap-2
// - Padding px-4 py-2
// - Border-b-3 transparent (active: primary)
// - Font medium (active: bold)
```

**Tasks:**
- [ ] Implementar ProductCardRestaurant
- [ ] Agregar hover effects (card lift, image zoom)
- [ ] Implementar CategoryTab con active state
- [ ] CartSummary inline (qty + total)
- [ ] Test IDs + props validation

---

### Fase 4: Organism Components (5h)

**Files:**
```
components/restaurant/organisms/
  ├─ CategoryTabsNav.tsx
  ├─ ProductGridRestaurant.tsx
  └─ FloatingCartButton.tsx
```

**CategoryTabsNav (crítico):**
```tsx
// Features:
// 1. Horizontal scroll (overflow-x-auto)
// 2. Hide scrollbar (scrollbar-hide class)
// 3. Sticky positioning (top-16 below header)
// 4. Scroll spy (IntersectionObserver)
// 5. Smooth scroll to section on tab click

const CategoryTabsNav = ({ categories }) => {
  const [activeId, setActiveId] = useState(categories[0]?.id)

  // Scroll spy (detect visible category)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { threshold: 0.5 }
    )

    // Observe all category sections
    categories.forEach(cat => {
      const section = document.getElementById(`category-${cat.id}`)
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [categories])

  const handleTabClick = (categoryId: string) => {
    document.getElementById(`category-${categoryId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  return (
    <nav className="sticky top-16 z-40 bg-gray-50 border-b">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-2">
          {categories.map(cat => (
            <CategoryTab
              key={cat.id}
              category={cat}
              isActive={activeId === cat.id}
              onClick={() => handleTabClick(cat.id)}
            />
          ))}
        </div>
      </div>
    </nav>
  )
}
```

**ProductGridRestaurant:**
```tsx
// Simple responsive grid wrapper
<div className="product-grid-restaurant px-4 py-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:max-w-[1280px] xl:mx-auto">
    {products.map(product => (
      <ProductCardRestaurant
        key={product.id}
        product={product}
        badges={getProductBadges(product)}
        onAddToCart={handleAddToCart}
      />
    ))}
  </div>
</div>
```

**FloatingCartButton:**
```tsx
// Slide-up animation when cart not empty
<AnimatePresence>
  {itemCount > 0 && (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-0 left-0 right-0 z-50"
      data-testid="floating-cart"
    >
      <div className="bg-primary text-white p-4 pb-safe">
        <div className="flex items-center justify-between mb-2">
          <CartSummary itemCount={itemCount} total={total} />
        </div>
        <button
          className="w-full bg-white text-primary font-bold py-3 rounded-lg"
          onClick={onViewCart}
          data-testid="floating-cart-cta"
        >
          Ver Carrito →
        </button>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

**Tasks:**
- [ ] CategoryTabsNav con scroll spy
- [ ] ProductGridRestaurant responsive
- [ ] FloatingCartButton con animation
- [ ] Test scroll behavior
- [ ] Validate sticky positioning mobile

---

### Fase 5: Page Layout Integration (3h)

**Files:**
```
app/[tenant]/page.tsx (modify)
  - Add template switch
  - Render RestaurantLayout if template === 'restaurant'

app/[tenant]/(restaurant)/
  └─ RestaurantLayout.tsx (new)
```

**RestaurantLayout structure:**
```tsx
export default function RestaurantLayout({ tenant, products, categories }) {
  const { cart, addToCart } = useCart()

  return (
    <div className="restaurant-template">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <Logo src={tenant.logo} />
          <h1 className="font-bold text-lg">{tenant.name}</h1>
          <CartBadge count={cart.itemCount} />
        </div>
      </header>

      {/* Category Tabs Nav */}
      <CategoryTabsNav categories={categories} />

      {/* Product Sections (by category) */}
      <main>
        {categories.map(category => (
          <section
            key={category.id}
            id={`category-${category.id}`}
            className="mb-8"
          >
            <div className="section-header px-4 py-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CategoryIcon icon={category.icon} />
                {category.name}
                <span className="text-sm text-gray-500">
                  ({category.productCount} productos)
                </span>
              </h2>
            </div>

            <ProductGridRestaurant
              products={products.filter(p => p.categoryId === category.id)}
              onAddToCart={addToCart}
            />
          </section>
        ))}
      </main>

      {/* Floating Cart */}
      <FloatingCartButton
        itemCount={cart.itemCount}
        totalAmount={cart.total}
        onViewCart={() => router.push(`/${tenant.slug}/cart`)}
      />
    </div>
  )
}
```

**Page switch logic:**
```tsx
// app/[tenant]/page.tsx
export default function TenantStorefront({ tenant, products }) {
  switch (tenant.template) {
    case 'gallery':
      return <GalleryLayout {...props} />
    case 'detail':
      return <DetailLayout {...props} />
    case 'minimal':
      return <MinimalLayout {...props} />
    case 'restaurant':
      return <RestaurantLayout {...props} />
    default:
      return <GalleryLayout {...props} />
  }
}
```

**Tasks:**
- [ ] Crear RestaurantLayout component
- [ ] Integrar template switch en page.tsx
- [ ] Data fetching (products grouped by category)
- [ ] SSR optimization (ISR revalidate)

---

### Fase 6: Admin Integration (2h)

**Files:**
```
components/admin/TemplateSelector.tsx (modify)
  - Add 'restaurant' option to TEMPLATES array
```

**Add template option:**
```typescript
// components/admin/TemplateSelector.tsx (línea 23)
const TEMPLATES = [
  // ... existing templates
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Menú digital optimizado para comida. Tabs categorías, badges promos, mobile-first.',
    icon: '🍔',
  },
]
```

**Preview mode (opcional v2):**
- Modal preview iframe con template restaurant
- Toggle entre templates live

**Tasks:**
- [ ] Agregar restaurant a selector
- [ ] Update admin settings page
- [ ] Validar persist `tenants.template = 'restaurant'`
- [ ] Test switch template (gallery → restaurant)

---

### Fase 7: Polish & Performance (2h)

**Optimizations:**
- [ ] Lazy load images (next/image priority false)
- [ ] Skeleton loading states (cards, tabs)
- [ ] Optimize badge icons (inline SVG críticos)
- [ ] Add meta tags (OG image, description)
- [ ] Lighthouse audit (target >90)

**Animations polish:**
- [ ] Card hover lift (translateY -2px)
- [ ] Image zoom on hover (scale 1.05)
- [ ] Tab active transition (underline slide)
- [ ] Floating cart slide-up (spring animation)

**A11y checks:**
- [ ] Keyboard nav (tab order correcto)
- [ ] Focus indicators (outline primary)
- [ ] Alt texts imágenes food
- [ ] ARIA labels (cart badge, tabs nav)
- [ ] Screen reader test (VoiceOver)

**Tasks:**
- [ ] Run Lighthouse CI
- [ ] Fix performance issues (<2.5s LCP)
- [ ] Validate WCAG AA (axe-core)
- [ ] Cross-browser test (Safari, Chrome, Firefox)

---

## Test IDs Required

```typescript
// Para Sentinela E2E tests
export const RESTAURANT_TEST_IDS = {
  // Layout
  header: 'restaurant-header',
  logo: 'restaurant-logo',
  cartBadge: 'restaurant-cart-badge',

  // Navigation
  categoryTabs: 'category-tabs-nav',
  categoryTab: (slug: string) => `category-tab-${slug}`,

  // Products
  productGrid: 'product-grid-restaurant',
  productCard: (id: string) => `product-card-${id}`,
  productImage: (id: string) => `product-image-${id}`,
  productBadge: (type: string) => `badge-${type}`,
  quickAddButton: (id: string) => `add-to-cart-${id}`,

  // Cart
  floatingCart: 'floating-cart',
  floatingCartCta: 'floating-cart-cta',
  cartSummary: 'cart-summary',

  // Admin
  templateSelectorRestaurant: 'template-selector-restaurant',
}
```

---

## Performance Targets

| Métrica | Target | Crítico |
|---------|--------|---------|
| **LCP** | <2.5s | ✅ Hero image prioritaria |
| **FID** | <100ms | ✅ Quick add button responsive |
| **CLS** | <0.1 | ✅ Skeleton states, fixed heights |
| **Lighthouse** | >90 | ✅ Mobile + Desktop |
| **Bundle size** | +50KB | ⚠️ Tree-shake icons, lazy organisms |

---

## Handoff Coordination

### Con Aurora
- [ ] Clarificar doubts diseño durante impl
- [ ] Visual QA review (compare vs wireframes)
- [ ] Iterate si componentes no match specs

### Con Sentinela
- [ ] Proveer test IDs completos
- [ ] Document interaction flows (scroll spy, cart)
- [ ] Flag edge cases (empty category, slow network)

### Con Kokoro
- [ ] Validar badges stored en `products.metadata JSONB`
- [ ] Confirm category grouping query performance
- [ ] API endpoint `/api/products/by-category` si necesario

---

## Migration Path (MangoBajito)

**Post-implementación:**
1. Deploy template restaurant staging
2. Crear tenant test `mangobajito-restaurant` (clone data)
3. A/B test: 50% traffic gallery, 50% restaurant
4. Medir conversión 7 días
5. Si +15% conversión → migrate 100%
6. Repeat con SuperHotdog

---

## Timeline Estimado

| Fase | Horas | Días |
|------|-------|------|
| 1. Types + Theme | 1h | 0.2 |
| 2. Atoms | 3h | 0.5 |
| 3. Molecules | 4h | 0.6 |
| 4. Organisms | 5h | 0.8 |
| 5. Page Layout | 3h | 0.5 |
| 6. Admin | 2h | 0.3 |
| 7. Polish | 2h | 0.3 |

**Total:** 20h (~3 días full-time)

---

## Definition of Done

- [ ] Template 'restaurant' seleccionable admin
- [ ] Layout responsive (mobile/tablet/desktop match wireframes)
- [ ] Category tabs scroll + sticky spy funcionando
- [ ] Product cards con badges rendering
- [ ] Floating cart animation smooth
- [ ] Test IDs todos los componentes
- [ ] Lighthouse >90 mobile + desktop
- [ ] WCAG AA compliance (axe-core 0 violations)
- [ ] Visual QA aprobado Aurora
- [ ] E2E tests passing (Sentinela)
- [ ] Deploy staging OK
- [ ] Handoff docs completos

---

## Referencias

**Design specs Aurora:**
- `SKY_42_WIREFRAMES.md` (layouts + imágenes PNG)
- `SKY_42_DESIGN_SYSTEM.md` (tokens, spacing, typography)
- `SKY_42_COLOR_PALETTES.md` (Warm Appetite palette)
- `SKY_42_PRODUCT_CARDS.md` (variant specs)
- `SKY_42_ICON_PACK.md` (SVG icons + badges)

**Tech stack:**
- Next.js 14 App Router
- TypeScript + Tailwind CSS
- Framer Motion (animations)
- Supabase (data fetching)

**Existing code:**
- `types/theme.ts` (extend aquí)
- `components/admin/TemplateSelector.tsx` (agregar option)
- `app/[tenant]/page.tsx` (template switch)

---

**Pixel, ready to build. Ship high-quality, pixel-perfect restaurant template.** 🎨🚀
