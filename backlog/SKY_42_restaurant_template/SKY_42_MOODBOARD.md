# SKY-42: Restaurant Template Moodboard

> Visual references for food service e-commerce template
> Target: Mobile-first, appetite-driven, quick conversion

---

## 1. Reference Apps Analysis

### Rappi
**Strengths:**
- Horizontal scrolling category tabs (sticky header)
- Large food imagery (16:9 aspect)
- Orange CTA buttons (appetite trigger)
- Badge hierarchy: Promo > New > Discounts

**Apply to Vendio:**
- Copy category tab pattern
- Use warm CTA colors
- Similar badge placement

---

### Uber Eats
**Strengths:**
- Photo-first cards (appetite appeal)
- Quick add (+) button visible without modal
- Delivery time + rating prominent
- Clean white background (food pops)

**Apply to Vendio:**
- Adopt "Photo Hero" card variant
- Keep add-to-cart one-tap
- White/light bg default

---

### PedidosYa
**Strengths:**
- Clear promo badges (% off, 2x1)
- Price hierarchy (before/after discount)
- Compact list view for long menus
- Filter pills (Veggie, Gluten-free, Spicy)

**Apply to Vendio:**
- Prominent discount display
- Filter badges as product metadata
- Compact variant for 50+ item menus

---

### DoorDash
**Strengths:**
- Floating cart button (sticky bottom, shows total)
- Minimal text (name, price, quick description)
- 1-column mobile layout (full width)
- Dark mode option (nighttime orders)

**Apply to Vendio:**
- Implement floating cart summary
- Keep descriptions under 3 lines
- Mobile-first 1-col grid

---

### Toast POS / Square Online
**Strengths:**
- Category-based navigation (Entrees, Sides, Drinks)
- Customization options visible on card (Add peppers, Extra cheese)
- Photo placeholders for items without images
- Inventory badges (Sold out, Limited)

**Apply to Vendio:**
- Category sections with headers
- Show "Agotado" badge when stock = 0
- Graceful fallback for missing images

---

## 2. Color Psychology Food Service

### Appetite-Stimulating Colors
- **Red (#E63946):** Urgency, appetite, classic fast food
- **Orange (#F4A261):** Energy, warmth, casual dining
- **Yellow (#FFC857):** Happiness, value, quick service
- **Green (#06D6A0):** Fresh, healthy, success state

### Colors to AVOID
- **Blue (#1E90FF):** Suppresses appetite (unnatural food color)
- **Purple (#6A0DAD):** Luxury but low conversion food context
- **Gray (#9CA3AF):** Neutral but boring, reduces excitement

---

## 3. Typography Principles

### Recommended Stacks
**Primary (Headings):**
- Inter Bold (web-safe, high legibility, modern)
- Poppins SemiBold (friendly, rounded, casual)
- Roboto Bold (Android-native feel)

**Secondary (Body):**
- Inter Regular (clean, readable at small sizes)
- Open Sans Regular (Google Fonts standard)

### Rules:
- Min 16px body text (iOS no-zoom)
- Max 2 font weights (Bold + Regular)
- Line height 1.5 for descriptions
- Tight letter-spacing for prices ($-0.02em)

---

## 4. Imagery Guidelines

### Photo Specs
- **Aspect ratios:** 16:9 (menu item), 1:1 (hero), 4:3 (compact)
- **Resolution:** 800x450px min (retina displays)
- **Lighting:** Natural light, 45° angle, white/wood background
- **Composition:** Plate in focus, blurred background, garnish visible

### Placeholder Strategy
When no photo:
- Use category icon (🍕 pizza, 🍔 burger)
- Soft gradient background (warm colors)
- Text overlay: "Sin foto disponible"

---

## 5. Competitive Benchmark

| Feature | Rappi | Uber Eats | PedidosYa | Vendio Restaurant |
|---------|-------|-----------|-----------|-------------------|
| Category tabs | ✅ Scroll | ✅ Scroll | ✅ Fixed | ✅ Scroll (mobile) |
| Quick add | ❌ Modal | ✅ Direct | ❌ Modal | ✅ Direct |
| Badges | ✅ Promo | ⚠️ Limited | ✅ Rich | ✅ Rich (8 types) |
| Responsive grid | 1 col | 1 col | 2 col tablet | 1/2/3 col |
| Floating cart | ✅ | ✅ | ❌ | ✅ |
| Dark mode | ❌ | ✅ | ❌ | 🔄 Future |

---

## 6. Mobile-First Priority

**80% orders from mobile** (Vendio data target):
- Touch targets min 44x44px (iOS HIG)
- Spacing between cards 16px min
- CTA buttons full width on mobile
- Sticky elements: header tabs + bottom cart
- Landscape support (rotated phone common in restaurants)

---

## 7. Accessibility Requirements

### WCAG AA Compliance
- **Contrast ratios:**
  - Text on background: min 4.5:1
  - Large text (>18px): min 3:1
  - CTA buttons: min 4.5:1

- **Tap targets:**
  - Min size: 44x44px (iOS), 48x48px (Android)
  - Spacing between: 8px min

- **Alt text:**
  - Product images: "[Nombre plato] - [Descripción breve]"
  - Icons: Descriptive labels (not "icon1.svg")

- **Focus states:**
  - Visible outline on keyboard navigation
  - Skip to cart link for screen readers

---

## 8. Emotion & Brand Perception Goals

**Target feelings:**
- Hungry → Satisfied (visual hierarchy, food photography)
- Confused → Clear (simple navigation, obvious CTAs)
- Hesitant → Confident (badges: popular, recommended, reviews)
- Impatient → Fast (quick add, minimal clicks, loading indicators)

**Brand archetypes:**
- **Fast Casual:** Orange/yellow, bold typography, energetic
- **Bistro/Upscale:** Dark primary, serif accents, elegant spacing
- **Healthy/Fresh:** Green accents, light backgrounds, natural photography

---

## 9. Design System Inspirations

### Material Design
- Elevation system (cards 2dp, floating cart 8dp)
- Ripple effect on touch
- Bottom sheet for cart summary

### iOS Human Interface Guidelines
- Large touch targets
- Safe area insets
- Haptic feedback on add-to-cart

### Tailwind CSS Patterns
- 8px spacing grid
- Predefined color palette (50-900)
- Responsive breakpoints (sm, md, lg, xl)

---

## Final Moodboard Summary

**Visual direction:** Warm, appetite-driven, mobile-optimized
**Color mood:** Orange primary, green success, red accents
**Typography:** Bold sans-serif headings, clean body text
**Imagery:** 16:9 food photos, white backgrounds, natural light
**UX patterns:** Horizontal tabs, quick add, floating cart, rich badges

**Next step:** Translate moodboard into 3 concrete color palettes + product card designs.
