# Miicel.io Design System – Quick Reference (Blue Minimal)

**Core:** White + noir sidebar, blue primary, neutral grays, Inter typography, 8/16/20/24 spacing.

---
## Palette (copy-paste)
```
Primary (blue):   #2563EB | hover #1D4ED8 | active #1E40AF
Success:          #10B981
Error:            #EF4444
Info:             #F59E0B
BG base:          #FFFFFF
Sidebar:          #1A1A1A
Text primary:     #111827
Text secondary:   #374151
Text labels:      #6B7280
Border:           #E5E7EB
Surface subtle:   #F3F4F6
Hover surface:    #F9FAFB
```

## Typography
| Usage | Size | Weight | Color |
|-------|------|--------|-------|
| H1 | 32px | 700 | #111827 |
| Subtitle | 16px | 500 | #374151 |
| Label/Metric | 14px | 600 | #6B7280 |
| Body | 14px | 400 | #111827 |
| Small | 12px | 400 | #6B7280 |
Font: Inter, sans-serif (Poppins ok).

## Spacing
- Page/section padding: 24px
- Card padding: 20px
- Gaps: 16px
- Radius: 8px (cards), 4px (inputs/buttons)
- Shadow: 0 1px 3px rgba(0,0,0,0.10)

## Components (essentials)
**Button Primary**: bg #2563EB, text #FFF, radius 4px, focus outline 2px blue, hover darken, testid `btn-{action}`.

**Input**: border #E5E7EB, radius 4px, padding 12x16, focus border 2px blue + shadow rgba(37,99,235,0.18), error #EF4444, success #10B981, testid `input-{field}`.

**Card**: bg #FFF, border #E5E7EB, radius 8px, padding 20px, shadow soft, hover shadow + bg #F9FAFB, testid `card-{section}`.

**Badge**: pill radius 16px, padding 4x12, font 12/600; success bg #ECFDF3 text #15803D; error bg #FEF2F2 text #B91C1C; info bg #FFF7ED text #C2410C; neutral bg #F3F4F6 text #374151; testid `badge-{status}`.

**Sidebar Nav**: width 200px, bg #1A1A1A, text #F9FAFB; active bg rgba(255,255,255,0.08); hover bg rgba(255,255,255,0.04); icons 20px stroke 2px inherit; testid `nav-{item}`.

## Layout
- Max content width: ~1400px, center with 24px padding
- Grid: 1 col mobile, 2 col tablet, 3 col desktop; gap 16px
- Header/hero: padding 24px, bottom divider #E5E7EB

## States & Motion
- Hover: bg #F9FAFB on interactive
- Focus: outline 2px #2563EB, offset 2px
- Active: scale 0.98 buttons
- Transition: 200ms ease-out

## CSS Variables (see styles.css)
- Colors: `--color-blue`, `--color-success`, `--color-error`, `--color-info`, `--color-border`, `--color-surface-hover`, `--color-sidebar`
- Fonts: `--font-sans` (Inter), sizes 32/24/18/16/14/12
- Radii: `--radius-card: 8px`, `--radius-input: 4px`
- Shadows: `--shadow-soft`, `--shadow-hover`

**Use this as guardrails to keep UI aligned with the new blue/white system.**
