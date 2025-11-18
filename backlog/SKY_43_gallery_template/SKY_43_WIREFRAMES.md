# SKY-43: Gallery Template - Wireframes

> Mobile-first layouts for art gallery QR experience
> Created: 2025-01-17

---

## Priority Order

1. **Mobile Portrait** (100% traffic, primary)
2. **Mobile Landscape** (gallery seating, secondary)
3. Tablet (future-proofing)
4. Desktop (admin preview only)

---

## 1. Mobile Portrait (<640px) - PRIMARY

**Context:** User standing in gallery, phone vertical, QR scan → impulse buy

### A. Catalog Landing (QR Entry Point)

```
┌─────────────────────────────────────┐
│ ☰  ARTIST NAME            🔍  🛒   │ ← Header (sticky, 56px)
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [Hero Image - Optional]         │ │ ← Hero (optional, 240px)
│ │ "Summer Collection 2025"        │ │
│ │ [Browse Works →]                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌──────────────┐                   │
│ │ Type ▼       │ 24 artworks  ⚙️   │ ← Filter bar (48px)
│ └──────────────┘                   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [D]                      [New] │ │
│ │                                 │ │
│ │                                 │ │
│ │      [Artwork 1]                │ │ ← Card 1 (1 col)
│ │                                 │ │
│ │                                 │ │
│ │ "Sunset Over Mountains"         │ │
│ │ From $45 • 3 formats            │ │
│ │ [♡] [Quick View]                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [P]                             │ │
│ │                                 │ │
│ │      [Artwork 2]                │ │ ← Card 2
│ │                                 │ │
│ │ "Ocean Waves"                   │ │
│ │ $120                            │ │
│ │ [♡] [Quick View]                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [B]                      [Ltd] │ │
│ │                                 │ │
│ │      [Artwork 3]                │ │ ← Card 3
│ │                                 │ │
│ │ "Abstract Dreams"               │ │
│ │ From $90 • 2 formats            │ │
│ │ [♡] [Quick View]                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ...more cards (infinite scroll)    │
│                                     │
└─────────────────────────────────────┘

[D] = Digital badge
[P] = Physical badge
[B] = Both badge
[New] = New arrival badge
[Ltd] = Limited edition badge
```

**Specs:**
- Header: 56px height, sticky top, logo center, icons 48x48px tap targets
- Hero: 240px height, optional (tenant config), gradient overlay text
- Filter bar: 48px height, sticky below header, dropdown + sort + settings
- Cards: 1 col, 100% width (minus 16px edge padding), 16px vertical gap
- Image aspect: 1:1 (square), full-bleed
- Info section: 96px height (title + meta + actions)
- Scroll: Infinite scroll (load 12 cards per batch)

### B. Quick View Modal (Mobile Portrait)

```
┌─────────────────────────────────────┐
│                              [×]    │ ← Close (48x48px, top-right)
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │                                 │ │
│ │      [Large Preview 1:1]        │ │ ← Image (full width, 360px)
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ "Sunset Over Mountains"             │ ← Title (18px, bold)
│ by Artist Name                      │ ← Artist (14px, link)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🖼️ DIGITAL DOWNLOAD            │ │ ← Option 1 (card, tap to expand)
│ │ • High-res JPG, 4000x4000px     │ │
│ │ • 300 DPI, print-ready          │ │
│ │                                 │ │
│ │ $45    [Add to Cart] ───────►  │ │ ← CTA (primary, 48px height)
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎨 PHYSICAL PRINT               │ │ ← Option 2
│ │ • Canvas 60x80cm                │ │
│ │ • Gallery wrap, ready to hang   │ │
│ │                                 │ │
│ │ $120   [Add to Cart] ───────►  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🖼️ FRAMED PRINT                │ │ ← Option 3
│ │ • 40x60cm, wooden frame         │ │
│ │ • Black or white frame          │ │
│ │                                 │ │
│ │ $180   [Add to Cart] ───────►  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [View Full Details] ───────────────►│ ← Link to detail page
│                                     │
└─────────────────────────────────────┘
```

**Specs:**
- Modal: Full-screen (100vh), slide-up animation (300ms)
- Close: 48x48px tap target, top-right 16px margin
- Image: 360px height (1:1), full width, swipeable if multiple images
- Title: 18px, font-weight 700
- Artist: 14px, underline, link to artist profile
- Option cards: 48px padding, 16px margin between, tap to expand/collapse
- CTA: 48px height, primary accent color, thumb-friendly
- Backdrop: rgba(0,0,0,0.6), tap to close
- Scroll: Vertical scroll if options overflow

### C. Product Detail Page (Mobile Portrait)

```
┌─────────────────────────────────────┐
│ ← Back                    🔍  🛒   │ ← Header (56px)
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │                                 │ │
│ │      [Main Image 1:1]           │ │ ← Image (full width, swipeable)
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ ● ○ ○ ○                           │ ← Pagination dots
│                                     │
│ [Digital]                    [New] │ ← Badges
│                                     │
│ Sunset Over Mountains               │ ← Title (20px)
│ by Artist Name                      │ ← Artist (16px, link)
│                                     │
│ [♡ Add to Wishlist]                │ ← Wishlist (secondary button)
│                                     │
│ ──────────────────────────────────  │
│                                     │
│ Description                         │ ← Section heading (16px, bold)
│ A breathtaking sunset captured...  │ ← Body (16px, line-height 1.6)
│ Perfect for living rooms...        │
│                                     │
│ ──────────────────────────────────  │
│                                     │
│ Options                             │ ← Section heading
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [•] Digital Download      $45   │ │ ← Radio option 1 (selected)
│ │     High-res JPG, 4000px        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [ ] Physical Print       $120   │ │ ← Radio option 2
│ │     Canvas 60x80cm              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [ ] Framed Print         $180   │ │ ← Radio option 3
│ │     40x60cm, wooden frame       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ──────────────────────────────────  │
│                                     │
│ Details                             │ ← Section heading
│ • Type: Digital + Physical          │ ← Specs list
│ • Medium: Digital Photography       │
│ • Year: 2025                        │
│ • Limited: Yes (50 prints)          │
│                                     │
│ ...more content (scroll)            │
│                                     │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                     │ ← Spacer (80px, CTA clearance)
└─────────────────────────────────────┘
│ $45         [Add to Cart] ────────►│ ← Sticky CTA (bottom, 72px)
└─────────────────────────────────────┘
```

**Specs:**
- Header: 56px, back button (48x48px), search + cart icons
- Image gallery: Full-width, 1:1 aspect, swipeable (horizontal drag)
- Pagination: 8px dots, centered below image
- Content: 24px padding edges, 16px vertical spacing between sections
- Options: Radio buttons (48px tap target), expandable details
- Sticky CTA: 72px height (48px button + 24px padding), fixed bottom, shadow
- Scroll: Smooth scroll, CTA appears after scroll past fold

---

## 2. Mobile Landscape (640-900px) - SECONDARY

**Context:** User sitting in gallery, phone horizontal, comparison view

### A. Catalog Landing (Landscape)

```
┌─────────────────────────────────────────────────────────────────┐
│ ☰  ARTIST NAME                                     🔍  🛒     │ ← Header (56px)
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────┐                       ┌──────────┐               │
│ │ Type ▼   │ 24 artworks       ⚙️  │ Sort: ▼  │               │ ← Filter (48px)
│ └──────────┘                       └──────────┘               │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐  ┌──────────────────────┐            │
│ │ [D]           [New] │  │ [P]                  │            │
│ │                      │  │                      │            │
│ │   [Artwork 1]        │  │   [Artwork 2]        │            │ ← 2 cols
│ │                      │  │                      │            │
│ │ "Sunset Over..."     │  │ "Ocean Waves"        │            │
│ │ From $45 • 3 formats │  │ $120                 │            │
│ │ [♡] [Quick View]     │  │ [♡] [Quick View]     │            │
│ └──────────────────────┘  └──────────────────────┘            │
│                                                                 │
│ ┌──────────────────────┐  ┌──────────────────────┐            │
│ │ [B]           [Ltd]  │  │ [D]                  │            │
│ │                      │  │                      │            │
│ │   [Artwork 3]        │  │   [Artwork 4]        │            │
│ │                      │  │                      │            │
│ │ "Abstract Dreams"    │  │ "City Lights"        │            │
│ │ From $90 • 2 formats │  │ $65                  │            │
│ │ [♡] [Quick View]     │  │ [♡] [Quick View]     │            │
│ └──────────────────────┘  └──────────────────────┘            │
│                                                                 │
│ ...more cards (infinite scroll)                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Specs:**
- 2 cols: 50% width each (minus 16px gap)
- Cards: Same structure as portrait, tighter spacing
- Comparison: Side-by-side artwork viewing (user intent)

### B. Quick View Modal (Landscape)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                          [×]    │
├────────────────────────────┬────────────────────────────────────┤
│                            │                                    │
│                            │ "Sunset Over Mountains"            │
│                            │ by Artist Name                     │
│                            │                                    │
│    [Large Preview]         │ ┌────────────────────────────────┐ │
│        (50%)               │ │ 🖼️ Digital Download    $45    │ │
│                            │ │ • High-res JPG                 │ │
│                            │ │ [Add to Cart] ───────────────► │ │
│                            │ └────────────────────────────────┘ │
│                            │                                    │
│                            │ ┌────────────────────────────────┐ │
│                            │ │ 🎨 Physical Print      $120    │ │
│                            │ │ • Canvas 60x80cm               │ │
│                            │ │ [Add to Cart] ───────────────► │ │
│                            │ └────────────────────────────────┘ │
│                            │                                    │
│                            │ [View Full Details] ──────────────►│
│                            │                                    │
└────────────────────────────┴────────────────────────────────────┘
```

**Specs:**
- Split layout: 50% image (left), 50% options (right)
- Image: 1:1 aspect, centered
- Options: Scroll vertical if overflow
- More desktop-like layout (landscape = seated, relaxed)

---

## 3. Tablet (900-1024px)

### Catalog Landing

```
┌────────────────────────────────────────────────────────────────────┐
│ ☰  ARTIST NAME                                       🔍  🛒       │
├────────────────────────────────────────────────────────────────────┤
│ ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│ │ [D]      [New] │  │ [P]            │  │ [B]      [Ltd] │       │
│ │                │  │                │  │                │       │
│ │  [Artwork 1]   │  │  [Artwork 2]   │  │  [Artwork 3]   │       │ ← 3 cols
│ │                │  │                │  │                │       │
│ │ "Sunset..."    │  │ "Ocean Waves"  │  │ "Abstract..."  │       │
│ │ From $45       │  │ $120           │  │ From $90       │       │
│ │ [♡] [Quick]    │  │ [♡] [Quick]    │  │ [♡] [Quick]    │       │
│ └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                    │
│ ...more rows (3 cols grid)                                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Specs:**
- 3 cols: ~31% width each, 24px gap
- Same card structure as mobile
- Hover effects enabled (desktop-like)

---

## 4. Desktop (>1024px)

### Catalog Landing (With Sidebar Filter)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ☰  ARTIST NAME                                           🔍  🛒         │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌──────────────────────────────────────────────────┐   │
│ │ FILTERS     │  │ 24 artworks                         Sort: ▼      │   │
│ │             │  ├──────────────────────────────────────────────────┤   │
│ │ Type        │  │ ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│ │ □ Digital   │  │ │ [D] [New]│  │ [P]      │  │ [B] [Ltd]│        │   │
│ │ □ Physical  │  │ │          │  │          │  │          │        │   │
│ │ □ Both      │  │ │ [Art 1]  │  │ [Art 2]  │  │ [Art 3]  │        │   │
│ │             │  │ │          │  │          │  │          │        │   │ ← 3 cols
│ │ Status      │  │ │ "Sun..." │  │ "Ocean"  │  │ "Abstr"  │        │   │
│ │ □ New       │  │ │ $45      │  │ $120     │  │ $90      │        │   │
│ │ □ Limited   │  │ │ [♡][Qck] │  │ [♡][Qck] │  │ [♡][Qck] │        │   │
│ │ □ Featured  │  │ └──────────┘  └──────────┘  └──────────┘        │   │
│ │             │  │                                                  │   │
│ │ Price Range │  │ ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│ │ [$--$-----] │  │ │          │  │          │  │          │        │   │
│ │             │  │ │ [Art 4]  │  │ [Art 5]  │  │ [Art 6]  │        │   │
│ │ Size        │  │ │          │  │          │  │          │        │   │
│ │ □ Small     │  │ │ ...      │  │ ...      │  │ ...      │        │   │
│ │ □ Medium    │  │ │          │  │          │  │          │        │   │
│ │ □ Large     │  │ └──────────┘  └──────────┘  └──────────┘        │   │
│ │             │  │                                                  │   │
│ │ [Clear All] │  │ ...more cards (paginate or infinite scroll)     │   │
│ │             │  │                                                  │   │
│ └─────────────┘  └──────────────────────────────────────────────────┘   │
│ (240px width)    (Remaining width, max 1200px)                          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Specs:**
- Sidebar: 240px width, sticky scroll
- Grid: 3 cols, 320-360px width, 32px gap, max-width 1200px
- Hover effects: Card lift, image zoom, action buttons visible
- No sticky CTA (desktop = mouse, different UX)

---

## Component Hierarchy

### Mobile Portrait (Primary)

```
<Page>
  <Header sticky>
    <MenuIcon />
    <Logo />
    <SearchIcon />
    <CartIcon />
  </Header>

  <Hero optional />

  <FilterBar sticky>
    <TypeFilter />
    <Count />
    <SortDropdown />
    <SettingsIcon />
  </FilterBar>

  <ProductGrid infinite-scroll>
    <GalleryCard repeat />
  </ProductGrid>

  <QuickViewModal conditional>
    <CloseButton />
    <ImagePreview />
    <ProductInfo />
    <OptionCards repeat />
    <ViewDetailsLink />
  </QuickViewModal>
</Page>
```

### Mobile Landscape (Secondary)

```
<Page>
  <Header sticky />
  <FilterBar sticky />

  <ProductGrid cols={2} infinite-scroll>
    <GalleryCard repeat />
  </ProductGrid>

  <QuickViewModal split-layout>
    {/* 50% image, 50% options */}
  </QuickViewModal>
</Page>
```

---

## Navigation Patterns

### Primary Flow (QR → Purchase)

```
1. QR Scan → Catalog Landing (mobile portrait)
2. Scroll → See artwork cards (1 col, large images)
3. Tap "Quick View" → Full-screen modal (digital/physical options)
4. Tap "Add to Cart" → Cart preview modal
5. Tap "Checkout" → Checkout page
6. Complete → Purchase (<2 min total)
```

### Secondary Flow (Browse → Detail)

```
1. QR Scan → Catalog Landing
2. Tap card → Product Detail Page
3. View full description, options, artist info
4. Select option → "Add to Cart" sticky CTA
5. Checkout
```

### Tertiary Flow (Filter → Discover)

```
1. QR Scan → Catalog Landing
2. Tap filter icon → Filter drawer (bottom sheet)
3. Select Type (Digital/Physical/Both)
4. Apply → Filtered catalog
5. Browse → Quick View → Purchase
```

---

## Interaction States

### Card States

| State | Visual | Mobile Behavior | Desktop Behavior |
|-------|--------|-----------------|------------------|
| **Default** | Flat, no shadow | - | Slight shadow |
| **Tap/Hover** | Scale 0.98 (tap) | 100ms feedback | Lift 4px, shadow, zoom image 1.03x |
| **Active** | Navigate | Navigate to detail | Same |
| **Loading** | Skeleton pulse | Gray placeholder, pulse animation | Same |

### Quick View States

| State | Visual | Behavior |
|-------|--------|----------|
| **Closed** | Hidden | Display: none |
| **Opening** | Slide-up | 300ms ease-out, backdrop fade-in |
| **Open** | Full-screen | Scroll vertical, backdrop tap = close |
| **Closing** | Slide-down | 200ms ease-in, backdrop fade-out |

### CTA States

| State | Visual | Behavior |
|-------|--------|----------|
| **Default** | Accent color bg | - |
| **Tap** | Scale 0.96 | 100ms feedback |
| **Hover** | Darker accent | Desktop only |
| **Loading** | Spinner | Disabled during add to cart |
| **Success** | Checkmark | 1s, then revert |

---

## Responsive Breakpoints

| Breakpoint | Width | Grid | Image Size | Padding | Gap |
|------------|-------|------|------------|---------|-----|
| **Mobile Portrait** | <640px | **1 col** | 800x800px | 16px | 16px |
| **Mobile Landscape** | 640-900px | **2 cols** | 600x600px | 16px | 16px |
| **Tablet** | 900-1024px | 3 cols | 480x480px | 20px | 24px |
| **Desktop** | >1024px | 3 cols | 640x640px | 24px | 32px |

---

## Performance Considerations

### Mobile Portrait (100% traffic)

1. **Critical Path:**
   - Header (inline CSS)
   - First 2 cards (eager load images)
   - Sticky CTA (if product detail page)

2. **Lazy Load:**
   - Cards 3+ (below fold)
   - Quick View modal (on-demand)
   - Hero image (if enabled)

3. **Bundle:**
   - Core: <50KB JS gzip
   - Components: <30KB (modal, filters, etc)
   - Total: <80KB target

4. **Images:**
   - Mobile: 800x800px WebP (~40KB each)
   - LQIP: 20x20px base64 (<1KB inline)
   - Lazy threshold: 200px before viewport

---

## Accessibility

### Mobile Focus

- **Tap targets:** 48x48px minimum (WCAG 2.5.5 AA)
- **Font size:** 16px+ (iOS no-zoom)
- **Contrast:** 4.5:1 text (WCAG 1.4.3 AA)
- **Focus indicators:** 2px outline, visible
- **Screen reader:** Semantic HTML, ARIA labels
- **Keyboard nav:** Tab order logical (fallback desktop)

### Modal Accessibility

- **Focus trap:** Modal open = focus inside only
- **Escape key:** Close modal (desktop)
- **Backdrop tap:** Close modal (mobile)
- **Scroll lock:** Body scroll disabled when modal open
- **Announce:** Screen reader "Quick view opened"

---

## Handoff Notes

**Priority:**
1. Mobile portrait (100% traffic, ship first)
2. Mobile landscape (secondary, ship with v1)
3. Tablet/desktop (future-proof, ship later)

**Test Scenarios:**
1. QR scan → catalog → quick view → add to cart (<2 min)
2. Portrait → landscape rotation (layout adjust)
3. Weak WiFi (gallery context, <2s TTI)
4. Tap targets (48x48px, thumb-friendly)
5. Font legibility (gallery lighting, 16px+)

**Files:**
- `pages/catalog.tsx` (catalog landing)
- `components/storefront/ProductGrid.tsx` (grid layout)
- `components/storefront/GalleryCard.tsx` (card)
- `components/storefront/QuickViewModal.tsx` (modal)
- `components/storefront/FilterBar.tsx` (filter)

---

**Status:** Wireframes complete. Next: Design system tokens + components.
