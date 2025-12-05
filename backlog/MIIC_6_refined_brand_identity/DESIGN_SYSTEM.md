# Miicel.io Design System v1.1 (Blue Minimal)

**Status:** Production-Ready  
**Last Updated:** 2025-12-05  
**Tone:** Minimalista, profesional, confiable — claridad sobre ornamento.

---

## 1. Color System

### Core Palette
```
White        #FFFFFF   (primary background)
Sidebar      #1A1A1A   (fixed left rail)
Text Primary #111827   (titles/body)
Text Muted   #374151   (subtitles)
Text Subtle  #6B7280   (labels/metrics)
Dividers 1   #E5E7EB   (lines/borders)
Dividers 2   #F3F4F6   (panel fills)
```

### Accents & States
```
Primary (Blue)   #2563EB
Primary Hover    #1D4ED8
Primary Active   #1E40AF
Success          #10B981
Error            #EF4444
Info             #F59E0B
```

### Surfaces
```
Surface Base    #FFFFFF
Surface Card    #FFFFFF
Surface Hover   #F9FAFB
Overlay         rgba(0,0,0,0.6)
Sidebar Text    #F9FAFB
```

### Borders & Shadows
```
Border Default  #E5E7EB
Border Muted    #F3F4F6
Border Focus    #2563EB
Shadow Soft     0 1px 3px rgba(0,0,0,0.10)
Shadow Hover    0 2px 6px rgba(0,0,0,0.08)
```

---

## 2. Typography System

### Font Stack
```
Headings / UI / Body: Inter, 'Inter', system-ui, sans-serif
(Optional alt: Poppins)
```

### Scale
| Usage | Size | Weight | Line Height | Color |
|-------|------|--------|-------------|-------|
| H1 (Page) | 32px | 700 | 1.25 | #111827 |
| H2 (Section) | 24px | 600 | 1.3 | #111827 |
| H3 (Card) | 18px | 600 | 1.35 | #111827 |
| Subtitle | 16px | 500 | 1.4 | #374151 |
| Label/Metric | 14px | 600 | 1.4 | #6B7280 |
| Body | 14px | 400 | 1.6 | #111827 |
| Small | 12px | 400 | 1.5 | #6B7280 |

### Focus & Accessibility
- Contrast: text on white ≥ 4.5:1
- Focus outline: `2px solid #2563EB`, offset 2px
- Touch targets ≥ 44px height

---

## 3. Spacing System

- Base padding: **24px** (page/sections)
- Card padding: **20px**
- Gaps between components: **16px**
- Grid gaps: 16px rows/cols; section spacing 32px
- Border radius: **8px** cards/panels, **4px** inputs/buttons

Aliases (px): `4, 8, 12, 16, 20, 24, 32, 48` for flexibility.

---

## 4. Component Library

### Buttons
**Primary**
- BG: #2563EB; Hover: #1D4ED8; Active: #1E40AF
- Text: #FFFFFF
- Radius: 4px; Height: 44-48px
- Shadow: 0 1px 3px rgba(0,0,0,0.10)
- Focus: 2px outline #2563EB

**Secondary (Outline)**
- Border: 1px solid #E5E7EB; Text: #111827; BG: transparent
- Hover: BG #F9FAFB, Border #2563EB

**Ghost**
- Text: #374151; Hover: BG #F9FAFB, Text #2563EB

Test IDs: `data-testid="btn-{action}"`.

### Inputs
- BG: #FFFFFF; Border: 1px solid #E5E7EB; Radius: 4px; Padding: 12px 16px
- Text: #111827; Placeholder: #9CA3AF
- Focus: border 2px #2563EB + shadow 0 0 0 3px rgba(37,99,235,0.18)
- Error: border #EF4444 + shadow rgba(239,68,68,0.18)
- Success: border #10B981 + shadow rgba(16,185,129,0.18)
- Disabled: BG #F3F4F6, border #E5E7EB, text #9CA3AF

Labels 14px/600 #6B7280; Helper 12px/400 #6B7280; Error text #EF4444.

Test IDs: `data-testid="input-{field}"`.

### Cards
- BG: #FFFFFF; Border: 1px solid #E5E7EB; Radius: 8px; Padding: 20px
- Shadow: 0 1px 3px rgba(0,0,0,0.10); Hover: 0 2px 6px rgba(0,0,0,0.08) + BG #F9FAFB

**Stat Card**
- Layout: column gap 12px; Value 18px/600 #111827; Label 14px/600 #6B7280

Test IDs: `data-testid="card-{section}"`.

### Badges
- Radius: 16px pill (min height 24px)
- Padding: 4px 12px; Font: 12px/600
- Success BG #ECFDF3 text #15803D; Error BG #FEF2F2 text #B91C1C; Info BG #FFF7ED text #C2410C; Neutral BG #F3F4F6 text #374151
- Optional 1px border same hue at 30% opacity

Test IDs: `data-testid="badge-{status}"`.

### Navigation / Sidebar
- Sidebar: width 200px, BG #1A1A1A, text/icons #F9FAFB
- Nav item height ≥44px, padding 12px 16px
- Active: BG rgba(255,255,255,0.08); Text #FFFFFF; Icon stroke 2px #FFFFFF
- Hover: BG rgba(255,255,255,0.04)
- Divider: 1px #2C2C2C

Test IDs: `data-testid="nav-{item}"`.

### Layout Elements
- Container max width 1400px; horizontal padding 24px (mobile/desktop); section spacing 32px
- Hero/header: padding 24px, divider bottom #E5E7EB
- Grids: 1col mobile, 2col tablet, 3col desktop; gap 16px

### Modals
- Overlay rgba(0,0,0,0.6); Dialog BG #FFFFFF; Radius 8px; Padding 24px; Shadow 0 8px 24px rgba(0,0,0,0.18)
- Focus trap; close target 44px

---

## 5. Interaction & Motion
- Hover: BG #F9FAFB or appropriate tint; transitions 200ms ease-out
- Focus: 2px blue outline on all interactive elements
- Active: scale 0.98 for buttons
- Disabled: opacity 0.6, pointer-events none

---

## 6. Accessibility
- WCAG AA for all text/background combos
- Keyboard navigation ordered; focus visible
- Form fields labeled; ARIA for icon-only controls

---

## 7. Layout Summary (Dashboard)
- Sidebar fixed left 200px; main content scrolls independently
- Content max 1400px centered; padding 24px
- Cards grid 2-3 columns responsive; gaps 16px; cards padding 20px

---

## 8. File/Token References
- CSS variables: `styles.css` (import in layout/app)
- Quick specs: `DESIGN_QUICK_REFERENCE.md`
- Component examples: `COMPONENT_SPECS.md`

---

**Design aligns to the blue/white system: clear, minimal, trustworthy for small business users.**
