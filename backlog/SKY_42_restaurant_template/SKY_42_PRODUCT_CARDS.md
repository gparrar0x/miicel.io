# SKY-42: Product Card Variants

> 3 card designs for restaurant menu items + recommendation

---

## Variant A: "Menu Item" (RECOMMENDED DEFAULT)

### Visual Layout
```
┌───────────────────────────────────────┐
│                                       │
│   [Image 16:9 with badge overlay]    │  <- 328x184px mobile
│        🔥 NUEVO    💰 20% OFF         │
│                                       │
├───────────────────────────────────────┤
│ Hot Dog Clásico              $1,200  │  <- Name + Price (bold)
├───────────────────────────────────────┤
│ Pan brioche, salchicha premium,      │  <- Description (2 lines)
│ cebolla caramelizada, mostaza miel   │
├───────────────────────────────────────┤
│ 🌶️ Picante  🥗 Sin gluten  ⭐ Popular │  <- Tags row
├───────────────────────────────────────┤
│                                       │
│         [+ Agregar al carrito]        │  <- CTA button (full width)
│                                       │
└───────────────────────────────────────┘
```

### Specs

**Dimensions:**
- Mobile: 328x420px (1 col, 16px margin)
- Tablet: 340x420px (2 col grid)
- Desktop: 360x420px (3 col grid max)

**Image:**
- Aspect: 16:9
- Object-fit: cover
- Fallback: Category icon + gradient background
- Alt text: "[Product name] - [Short description]"

**Badge Position:**
- Top-left: 8px from corner
- Stack vertically if multiple (max 2 visible)
- Priority: Promo > New > Popular

**Typography:**
- Product name: 18px Bold, line-height 1.3, max 2 lines (ellipsis)
- Price: 20px Bold, color: primary, align right
- Description: 14px Regular, line-height 1.5, max 2 lines, color: text-light
- Tags: 12px Medium, line-height 1.2

**Colors (Palette A):**
- Card background: #FFFFFF
- Border: #E5E7EB (1px)
- Shadow: 0 2px 8px rgba(0,0,0,0.08)
- Hover: shadow 0 4px 16px rgba(0,0,0,0.12)

**Spacing:**
- Padding: 0 (image full bleed top)
- Content padding: 16px
- Gap between elements: 12px
- CTA button height: 48px (tap target)

**Interaction States:**
- **Default:** Border gray, shadow light
- **Hover:** Shadow deeper, scale 1.02 (desktop only)
- **Focus:** 2px outline primary color
- **Loading:** Skeleton shimmer effect
- **Out of stock:** Opacity 0.6, overlay "AGOTADO"

---

### Use Cases
✅ **Best for:**
- Standard menus (20-80 items)
- Equal emphasis on photo + description
- Mobile users (80% traffic)
- Products needing dietary info (allergens, spice level)

❌ **Not ideal for:**
- Very large menus (>100 items, too tall)
- Minimal description items (drinks, sides)
- Desktop-primary traffic (underuses space)

---

## Variant B: "Photo Hero"

### Visual Layout
```
┌───────────────────────────────────────┐
│                                       │
│                                       │
│         [Image 1:1 Large]             │  <- 328x328px mobile
│     🔥 NUEVO    💰 2x1                │
│                                       │
│                                       │
├───────────────────────────────────────┤
│ Pizza Pepperoni                       │  <- Name only (bold)
├───────────────────────────────────────┤
│ $2,500            [+]                 │  <- Price + Quick Add
└───────────────────────────────────────┘
```

### Specs

**Dimensions:**
- Mobile: 328x400px
- Tablet: 340x420px
- Desktop: 360x440px

**Image:**
- Aspect: 1:1 (Instagram-style)
- Larger display area (hero emphasis)
- Min resolution: 600x600px

**Typography:**
- Product name: 18px Bold, 1 line only (ellipsis)
- Price: 20px Bold, left align
- NO description (photo sells itself)

**Quick Add Button:**
- Size: 48x48px circle (top right of price row)
- Icon: Plus symbol (24px)
- Color: Primary background, white icon
- Hover: Scale 1.1, shadow

**Spacing:**
- Image: Full bleed top
- Content padding: 12px (tighter than variant A)
- Minimal whitespace (photo is star)

---

### Use Cases
✅ **Best for:**
- Photography-first brands (professional food photos)
- Simple menus (pizzas, burgers, single-item focus)
- Instagram/social media integration
- Desktop grid (2-3 cols, visual showcase)

❌ **Not ideal for:**
- Items needing description (complex dishes, ingredients)
- Poor quality photos (exposes bad imagery)
- Dietary restrictions (no space for tags)

---

## Variant C: "Compact List"

### Visual Layout
```
┌─────────────────────────────────────────────────┐
│ [Img] Hot Dog Vegetariano............$1,000 [+] │
│ 80px  Pan integral, salchicha soja, vegetales   │
│       🌱 Vegano  🥗 Saludable                   │
└─────────────────────────────────────────────────┘
```

### Specs

**Dimensions:**
- Height: 120px fixed
- Width: Full viewport - 32px margin
- Image: 80x80px (left aligned)

**Layout:**
- Horizontal flex
- Image: 80px square (fixed)
- Content: Flex-grow (fills remaining space)
- Add button: 40x40px (right aligned)

**Typography:**
- Name + price: 16px Bold, single line
- Price: Dots leader (....) between name and price
- Description: 13px Regular, 1 line max, color: text-light
- Tags: 11px Medium, single row, overflow hidden

**Spacing:**
- Padding: 12px
- Gap image-content: 12px
- Gap content-button: 8px

**Interaction:**
- Tap area: Full row (expand modal)
- Add button: Quick add (no modal)

---

### Use Cases
✅ **Best for:**
- Large menus (100+ items)
- Fast scrolling (drinks menu, sides, desserts)
- Minimal screen real estate
- List-view preference users

❌ **Not ideal for:**
- Feature products (not enough emphasis)
- First-time visitors (less appetite appeal)
- Mobile-primary with low-res photos (too small)

---

## Comparison Matrix

| Feature | Menu Item (A) | Photo Hero (B) | Compact List (C) |
|---------|---------------|----------------|------------------|
| **Image size** | 328x184 (16:9) | 328x328 (1:1) | 80x80 |
| **Description** | 2 lines | None | 1 line |
| **Tags/badges** | 3-4 visible | 2 visible | 2 visible |
| **Height** | 420px | 400px | 120px |
| **Items per screen** | 1.8 (mobile) | 2.2 (mobile) | 6.5 (mobile) |
| **Best for** | Standard menus | Photo showcase | Large catalogs |
| **Conversion** | High | Medium | Medium-Low |
| **Mobile UX** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## Recommendation: Variant A as DEFAULT

### Rationale
1. **Balanced information** (photo + description + tags)
2. **Mobile-optimized** (1 card = 1 screen, no scroll fatigue)
3. **Conversion-focused** (large CTA, clear pricing, appetite appeal)
4. **Flexible** (works for 20-80 item menus, most common)
5. **Accessibility** (sufficient text size, tap targets, alt text)

### When to Override

**Use Variant B when:**
- Professional food photography available
- Menu < 30 items (curated selection)
- Desktop traffic > 40%
- Brand is visual-first (Instagram, influencer-driven)

**Use Variant C when:**
- Menu > 80 items (drinks, sides, combos)
- Low-quality or missing photos
- Fast repeat customers (know what they want)
- List-view toggle feature

---

## Component States

### All Variants Include

**1. Default State**
- Card visible, shadow subtle
- All content readable
- Add button enabled

**2. Hover State (Desktop)**
- Shadow deeper (0 4px 16px)
- Scale 1.02 (subtle lift)
- CTA button color darkens 10%

**3. Focus State (Keyboard Nav)**
- 2px outline primary color
- Scroll into view if needed

**4. Loading State**
- Skeleton shimmer (image, text, button)
- Gray placeholders
- No interaction

**5. Out of Stock**
- Opacity 0.6
- Overlay badge "AGOTADO" (semi-transparent red)
- Add button disabled (gray, cursor: not-allowed)

**6. Added to Cart**
- Button text changes: "+ Agregar" → "✓ Agregado"
- Button color: Success green (1 second)
- Quantity badge appears top-right card

---

## Badge System

### Priority Order (max 2 visible)
1. 🔥 **NUEVO** (Yellow #FFC857, 7 days after creation)
2. 💰 **PROMO** (Red #E63946, if discount > 0)
3. ⭐ **POPULAR** (Orange #F4A261, if sales > avg)
4. 🌶️ **PICANTE** (Red outline, if spicy metadata)
5. 🥗 **VEGGIE** (Green outline, if vegetarian)
6. 🌱 **VEGANO** (Green fill, if vegan)
7. 🚫 **SIN GLUTEN** (Blue outline, if gluten-free)

### Badge Specs
- Size: 20px height, auto width, 4px padding
- Border radius: 4px
- Font: 11px Bold, uppercase
- Position: Top-left image, 8px margin
- Stack: Vertical, 4px gap if multiple

---

## Responsive Behavior

### Mobile (<640px)
- **Variant A:** 1 column, full width, 420px height
- **Variant B:** 1 column, full width, 400px height
- **Variant C:** Full width list, 120px height

### Tablet (640-1024px)
- **Variant A:** 2 columns, 340px width each
- **Variant B:** 2 columns, 340px width each
- **Variant C:** Full width list (same as mobile)

### Desktop (>1024px)
- **Variant A:** 3 columns max, 360px width each
- **Variant B:** 3 columns max, 360px width each
- **Variant C:** Full width list with max-width 800px (centered)

---

## Accessibility Checklist

- [ ] Alt text on all images
- [ ] Focus indicators visible
- [ ] Tap targets min 44x44px
- [ ] Color contrast WCAG AA (4.5:1 text, 3:1 graphics)
- [ ] Screen reader announces: "[Product name], [Price], [Description], Add to cart button"
- [ ] Keyboard navigation: Tab through cards, Enter to add
- [ ] Out of stock announced: "Not available"

---

## Next Steps

1. ✅ Variant A approved as default
2. 🔄 Aurora → Design wireframes with Variant A cards
3. 🔄 Pixel → Implement ProductCard component with 3 variants
4. 🔄 Add variant prop: `<ProductCard variant="menu-item" />`
5. 🔄 Sentinela → E2E test card states + accessibility
