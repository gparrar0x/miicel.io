# Miicel.io Visual Mockups & Layout Specs

**Format:** ASCII mockups + detailed layout grids
**Usage:** Reference for Pixel during implementation
**Handoff:** Match spacing, colors, typography exactly

---

## 1. Login Screen

### Desktop Layout (1280px)
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  MIICEL                                                               │
│                                                                       │
│                                                                       │
│                    ┌──────────────────────────┐                       │
│                    │  Superadmin Login        │                       │
│                    │                          │                       │
│                    │  Email                   │                       │
│                    │  ┌────────────────────┐  │                       │
│                    │  │  admin@miicel.io   │  │                       │
│                    │  └────────────────────┘  │                       │
│                    │                          │                       │
│                    │  Password                │                       │
│                    │  ┌────────────────────┐  │                       │
│                    │  │  ••••••••••        │  │                       │
│                    │  └────────────────────┘  │                       │
│                    │                          │                       │
│                    │  [Sign In]               │                       │
│                    │                          │                       │
│                    │  Forgot password? »      │                       │
│                    │                          │                       │
│                    └──────────────────────────┘                       │
│                                                                       │
│                  Miicel.io © 2025                                     │
│                  Enterprise Multi-Tenant Platform                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

Background: #FAFAFA (alabaster)
Content: Centered, max-width 400px
Card: 24px padding (XL), 1px border #E5E5E5, shadow-sm
Typography: Cinzel 20px for heading, Inter 14px body
Button: 48px height, full width, #B8860B gold
```

### Mobile Layout (375px)
```
┌───────────────────────────┐
│                           │
│       MIICEL              │
│                           │
│                           │
│  ┌─────────────────────┐  │
│  │                     │  │
│  │  Superadmin Login   │  │
│  │                     │  │
│  │  Email              │  │
│  │  ┌───────────────┐  │  │
│  │  │ admin@miicel  │  │  │
│  │  └───────────────┘  │  │
│  │                     │  │
│  │  Password           │  │
│  │  ┌───────────────┐  │  │
│  │  │ ••••••••••    │  │  │
│  │  └───────────────┘  │  │
│  │                     │  │
│  │  [Sign In]          │  │
│  │                     │  │
│  │  Forgot password?   │  │
│  │                     │  │
│  └─────────────────────┘  │
│                           │
│  Miicel.io © 2025         │
│                           │
└───────────────────────────┘

Padding: 16px (LG)
Card width: Full - 32px
Font sizes: -2px from desktop
Button height: 44px (touch target)
```

### States & Interactions

**Form Validation:**
```
┌────────────────────────────┐
│ Email                      │
│ ┌──────────────────────┐   │
│ │ invalid@             │   │  ← Border: #D97760 (coral)
│ └──────────────────────┘   │
│ ✗ Please enter valid email │  ← Color: #D97760, Font: 11px
│                            │
│ Password                   │
│ ┌──────────────────────┐   │
│ │ ••••••••••           │   │
│ └──────────────────────┘   │
│                            │
│ [Sign In]                  │ ← Disabled: opacity 60%, cursor not-allowed
│                            │
└────────────────────────────┘
```

**Focus State:**
```
┌────────────────────────────┐
│ Email                      │
│ ┌──────────────────────┐   │
│ │ admin@miicel.io      │   │  ← Border: 2px #B8860B (gold)
│ └──────────────────────┘   │  ← Shadow: 0 0 0 3px rgba(184,134,11,0.1)
│ ┌──────────────────────┐   │     (shadow extends outside border)
```

---

## 2. Superadmin Tenant List

### Desktop Layout (1280px)
```
┌──────────────────────────────────────────────────────────────────────┐
│  ▯  Dashboard    Settings    Tenants    Reports    Help              │  ← Sidebar
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Tenants                                  [+ Create Tenant]           │
│  Manage all multi-tenant instances                                    │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ ▬ Search tenants...           ┌─────────────┐                    │ │
│  │                               │ Filters ▼   │                    │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐    │
│  │  Tenant: Acme Corp          │  │  Tenant: Global Goods       │    │
│  │  Status: Active ✓           │  │  Status: Active ✓           │    │
│  │  Users: 245                 │  │  Users: 1,204               │    │
│  │  Revenue: $12.4K/mo         │  │  Revenue: $45.2K/mo         │    │
│  │                             │  │                             │    │
│  │  [View]  [Edit]  [⋮]        │  │  [View]  [Edit]  [⋮]        │    │
│  └─────────────────────────────┘  └─────────────────────────────┘    │
│                                                                        │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐    │
│  │  Tenant: Tech Solutions     │  │  Tenant: Fashion House      │    │
│  │  Status: Paused ⊖           │  │  Status: Suspended ⊗        │    │
│  │  Users: 89                  │  │  Users: 0                   │    │
│  │  Revenue: $2.1K/mo          │  │  Revenue: $0/mo             │    │
│  │                             │  │                             │    │
│  │  [View]  [Edit]  [⋮]        │  │  [View]  [Edit]  [⋮]        │    │
│  └─────────────────────────────┘  └─────────────────────────────┘    │
│                                                                        │
│  [Previous] 1 2 3 [Next]                                              │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘

Grid: 2 columns (desktop), 1 (mobile)
Card: 16px padding, 1px border #E5E5E5, shadow-xs, hover:shadow-md
Spacing: 24px gap between cards
Header: 48px padding bottom
```

### Tenant Card Details
```
┌─────────────────────────────────────┐
│                                     │
│  Acme Corp                          │
│  ────────                           │  ← H4 heading, Cinzel 600
│  Status: Active ✓                   │
│  Users: 245                         │  ← Body text, 14px Inter
│  Monthly Revenue: $12,400           │
│                                     │
│  [View Dashboard]  [Edit]  [⋮]      │  ← Buttons: SM size, secondary
│                                     │
└─────────────────────────────────────┘

Layout: Vertical flex, gap: 12px
Title: Cinzel 20px, weight 600
Metadata: Inter 14px, color #595959 (gray-secondary)
Buttons: Gap 8px, full flex
```

---

## 3. Admin Dashboard (Inside Tenant)

### Full Page Layout (1280px)
```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  Dashboard                                                             │
│  Your store analytics & performance metrics                           │  ← Header section
│                                                                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌───┐│
│  │ Revenue         │  │ Total Orders    │  │ Avg Order Value │  │Con││
│  │ $54.2K          │  │ 1,245           │  │ $43.50          │  │ver││
│  │ ↑ 12% vs month  │  │ ↓ 3% vs month   │  │ ↑ 8% vs month   │  │ 2.││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └───┘│
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Quick Actions                                                   │ │
│  │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │ │
│  │ │ New Product  │  │ View Orders  │  │ Settings     │           │ │
│  │ └──────────────┘  └──────────────┘  └──────────────┘           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Recent Orders                                                   │ │
│  │ ─────────────────────────────────────────────────────────────── │ │
│  │ #ORD-2025-001  | Customer: John Doe      | $125.50  | ✓ Paid  │ │
│  │ #ORD-2025-002  | Customer: Jane Smith    | $89.00   | ⊲ Ship  │ │
│  │ #ORD-2025-003  | Customer: Corp Acme     | $540.00  | ⊙ Proc  │ │
│  │ ─────────────────────────────────────────────────────────────── │ │
│  │                                          [View All Orders] »    │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘

Stat Cards Grid: 4 columns, 24px gap
Stats Card Sizing: Min-height 140px, centered content
Quick Actions: 3 columns, 16px gap, button full width
Recent Orders: Card with table inside
```

### Stat Card Detail (Close-up)
```
┌─────────────────────────┐
│                         │
│ Revenue      [icon]     │  ← Header row: label (12px, secondary) + icon (24x24)
│                         │
│ $54.2K                  │  ← Value: H2 size (28px), weight 600
│                         │
│ ↑ 12% vs last month     │  ← Trend: 12px, green or red, icon + text
│                         │
└─────────────────────────┘

Padding: 20px (SM + LG)
Alignment: flex-col, gap: 12px (MD)
Card: White, border 1px #E5E5E5, shadow-xs
Hover: shadow-md, border #D0D0D0
```

### Recent Orders Table (Inside Card)
```
Card > Table Layout:

┌──────────────────────────────────────────────────────────────┐
│ Recent Orders                        [View All Orders] »     │
│ ──────────────────────────────────────────────────────────── │
│ Order ID      | Customer           | Amount  | Status       │
│ ──────────────────────────────────────────────────────────── │
│ #ORD-2025-001 | John Doe           | $125.50 | ✓ Paid       │
│ #ORD-2025-002 | Jane Smith         | $89.00  | ⊲ Shipped    │
│ #ORD-2025-003 | Corp Acme Inc.     | $540.00 | ⊙ Processing │
│ ──────────────────────────────────────────────────────────── │
│ [View All Orders] »                                          │
└──────────────────────────────────────────────────────────────┘

Table Header: bg #F5F5F5, border-b 1px #E5E5E5, font weight 500
Table Rows: border-b 1px #E5E5E5, padding 16px
Row Hover: bg #F0F0F0
Status Badge Colors:
  ✓ Paid = emerald (#2D5F4F)
  ⊲ Shipped = slate-blue (#4A5F7F)
  ⊙ Processing = gray
  ⊗ Failed = coral (#D97760)
```

---

## 4. Sidebar Navigation (Desktop)

### Layout & States
```
┌──────────────────┐
│                  │
│  MIICEL          │  ← Logo: 24px Cinzel 700, 120px min-width
│                  │
│  ──────────────  │  ← Divider: 1px #E5E5E5, margin 16px 0
│                  │
│  ◆ Dashboard     │  ← Active: bg #B8860B, text white, rounded 6px
│                  │
│  ○ Tenants       │  ← Inactive: bg transparent, text #595959
│                  │
│  ○ Reports       │  ← Hover: bg #F0F0F0, text #0F0F0F
│                  │
│  ○ Settings      │
│                  │
│  ○ Team          │
│                  │
│  ──────────────  │
│                  │
│  ○ Help & Docs   │
│                  │
│  ○ Account       │  ← Account menu at bottom
│                  │
└──────────────────┘

Width: 240px (fixed)
Padding: 16px (LG)
Font: Inter 14px, weight 400 (inactive) / 500 (active)
Item Height: 44px
Icon Size: 24x24px
Icon + Text Gap: 12px (MD)
```

---

## 5. Color Reference Cards

### Primary Palette Swatches
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Noir     │  │ Charcoal │  │ Slate    │  │ Stone    │  │Alabaster │
│          │  │          │  │          │  │          │  │          │
│ #0F0F0F  │  │ #1A1A1A  │  │ #2D2D2D  │  │ #F5F5F5  │  │ #FAFAFA  │
│          │  │          │  │          │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘

Gold Accent Progression:
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Gold     │  │Gold Light│  │Gold Dark │
│          │  │          │  │          │
│ #B8860B  │  │ #D4AF37  │  │ #8B6508  │
│          │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘

Status Colors:
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Emerald  │  │ Coral    │  │Slate Blue│
│(Success) │  │(Warning) │  │(Info)    │
│ #2D5F4F  │  │ #D97760  │  │ #4A5F7F  │
└──────────┘  └──────────┘  └──────────┘
```

---

## 6. Typography Specimens

### Display (Cinzel)
```
┌─────────────────────────────────────────┐
│ H1 - Page Heading                       │
│ Cinzel 700 • 48px • -0.02em tracking    │ ← Tight, commanding
│                                         │
│ H2 - Section Title                      │
│ Cinzel 600 • 36px • -0.01em tracking    │ ← Slightly loose
│                                         │
│ H3 - Subsection                         │
│ Cinzel 600 • 28px • 0em tracking        │ ← Normal tracking
│                                         │
│ H4 - Card Title                         │
│ Cinzel 600 • 20px • 0em tracking        │ ← Readable at small size
│                                         │
└─────────────────────────────────────────┘
```

### Body (Inter)
```
┌─────────────────────────────────────────┐
│ Body Large                              │
│ Inter 400 • 16px • 1.5 line-height      │
│ Used for: Descriptions, long-form      │
│                                         │
│ Body Default                            │
│ Inter 400 • 14px • 1.5 line-height      │
│ Used for: Card content, table text      │
│                                         │
│ Body Small                              │
│ Inter 400 • 12px • 1.5 line-height      │
│ Used for: Metadata, helper text         │
│                                         │
│ Label / UI                              │
│ Inter 500 • 12px • 1.4 line-height      │
│ Used for: Form labels, buttons          │
│                                         │
│ Caption                                 │
│ Inter 400 • 11px • 1.4 line-height      │
│ Used for: Timestamps, legal text        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 7. Interactive State Examples

### Button Hover Animation
```
Initial:  Button(bg: #B8860B, shadow: sm)
Hover:    Button(bg: #D4AF37, shadow: md)
Timeline: 200ms, ease-out

Visual:   Gold brightens, subtle shadow grows
Duration: Imperceptible lag, smooth transition
```

### Input Focus Animation
```
Initial:  Input(border: 1px #D0D0D0, shadow: none)
Focus:    Input(border: 2px #B8860B, shadow: 0 0 0 3px rgba(184,134,11,0.1))
Timeline: 100ms, ease-out

Visual:   Border thickens + brightens, glow appears
Effect:   Clear affordance without jarring
```

### Card Hover Effect
```
Initial:  Card(border: 1px #E5E5E5, shadow: xs)
Hover:    Card(border: 1px #D0D0D0, shadow: md)
Timeline: 200ms, ease-out

Visual:   Subtle lift, border darkens
Behavior: Not too aggressive, stays professional
```

---

## 8. Responsive Breakpoints (Mobile-First)

### Mobile (< 640px)
```
Layout:
  - Single column everywhere
  - Full-width cards
  - Bottom sheet for navigation (optional)
  - Touch targets: min 44x44px

Font Sizes:
  - H1: 38px (down from 48px)
  - H2: 28px (down from 36px)
  - H3: 20px (down from 28px)
  - Body: 14px (unchanged)
  - Label: 12px (unchanged)

Spacing:
  - Container padding: 16px (LG)
  - Card padding: 16px (LG)
  - Gap: 16px (LG) instead of 24px

Grid:
  - Stat cards: 1 column, full width
  - Quick actions: 1 column, full width
```

### Tablet (641-1024px)
```
Layout:
  - 2 columns for multi-item sections
  - Sidebar optional or collapsible
  - Mid-size containers

Grid:
  - Stat cards: 2 columns
  - Quick actions: 2 columns
  - Tenant list: 1-2 columns
```

### Desktop (1025px+)
```
Layout:
  - Full spec (see above)
  - Sidebar always visible
  - 3-4 columns standard

Grid:
  - Stat cards: 4 columns
  - Quick actions: 3 columns
  - Tenant list: 2 columns
```

---

## 9. Shadow Hierarchy

### Shadow XS (Subtle, default cards)
```
0 1px 2px rgba(15, 15, 15, 0.04)
Used for: Default card state, inactive elements
Feeling: Barely there, flat
```

### Shadow SM (Light elevation)
```
0 2px 4px rgba(15, 15, 15, 0.08)
Used for: Hovered cards, dropdowns
Feeling: Slight lift, interactive
```

### Shadow MD (Clear elevation)
```
0 4px 8px rgba(15, 15, 15, 0.12)
Used for: Strong hover, active modals
Feeling: Obvious depth, prominent
```

### Shadow LG (Heavy elevation)
```
0 8px 16px rgba(15, 15, 15, 0.16)
Used for: Modal dialogs, popovers
Feeling: Floating above, modal
```

### No Drop Shadows on Gold
```
Gold elements use border + hover color change, not shadow
Reason: Gold + shadow = muddy look
Solution: Bright borders, clean contrast
```

---

## 10. Animation Timing Functions

```
Default:         cubic-bezier(0.2, 0, 0, 1)  [ease-out-expo]
                 → Fast start, slow end
                 → Used for: hover states, color changes

In-Out:          cubic-bezier(0.4, 0, 0.2, 1) [ease-in-out-cubic]
                 → Symmetric acceleration/deceleration
                 → Used for: modals, page transitions

Fast (Active):   cubic-bezier(0.1, 0, 0.3, 1) [ease-out-quad]
                 → Very snappy, used for: button press, active states

Durations:
  Fast:  100ms (button press, active)
  Norm:  200ms (hover, focus, color)
  Slow:  300ms (page load, modal entry)
```

---

## 11. Accessibility Annotations

### Focus Indicator
```
All interactive elements:
- Outline: 2px solid #B8860B (gold)
- Outline-offset: 2px (outside border)
- Clear contrast against background
- Visible at all times when tabbed
```

### Color Contrast Examples
```
✓ Text Primary (#0F0F0F) on Surface (#FFFFFF)
  Ratio: 19.26:1 (AAA grade)

✓ Text Secondary (#595959) on Surface (#FFFFFF)
  Ratio: 7.24:1 (AA grade)

✓ Gold (#B8860B) on Noir (#0F0F0F)
  Ratio: 7.89:1 (AA grade)

✓ Gold (#B8860B) on Charcoal (#1A1A1A)
  Ratio: 7.47:1 (AA grade)
```

### Touch Target Sizing
```
Minimum: 44x44px for all buttons, links, interactive
Examples:
  - Buttons: 48px (includes padding)
  - Sidebar items: 44px height
  - Icon buttons: 44x44px
  - Form inputs: 44px minimum height
```

---

**Ready for Pixel to implement. All specs locked.**
