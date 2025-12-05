# Component Specs – Blue Minimal System (Aurora)

Aligns with: white backgrounds, blue primaries, neutral grays, Inter type.

---
## Tokens (use via Tailwind or CSS vars)
- `primary`: #2563EB (hover #1D4ED8, active #1E40AF)
- `success`: #10B981
- `error`: #EF4444
- `info`: #F59E0B
- `bg-base`: #FFFFFF
- `sidebar`: #1A1A1A
- `text-strong`: #111827
- `text-subtle`: #374151
- `text-label`: #6B7280
- `border`: #E5E7EB
- `border-muted`: #F3F4F6
- `surface-hover`: #F9FAFB
- `shadow-soft`: 0 1px 3px rgba(0,0,0,0.10)
- `shadow-hover`: 0 2px 6px rgba(0,0,0,0.08)
- `radius-card`: 8px; `radius-input`: 4px
- `padding-card`: 20px; `gap`: 16px; `padding-page`: 24px
- `focus-outline`: 2px solid #2563EB; offset 2px

---
## Buttons (data-testid="btn-{action}")
**Primary**
- Classes: `bg-primary text-white rounded-[4px] px-6 py-3 shadow-sm transition duration-200 ease-out`
- Hover: `bg-[#1D4ED8] shadow-hover`; Active: `bg-[#1E40AF] scale-[0.98]`
- Focus: outline 2px blue, offset 2px; Disabled: `opacity-60 pointer-events-none`

**Secondary (Outline)**
- `border border-border text-text-strong bg-transparent rounded-[4px] px-6 py-3`
- Hover border → primary, bg hover surface

**Ghost**
- `text-text-subtle px-4 py-3 rounded-[4px]`
- Hover: text primary blue, bg hover surface

Loading: add spinner 16x16 inherit color, `data-testid="spinner"`.

---
## Inputs (data-testid="input-{field}")
- Base: `bg-white border border-border rounded-[4px] px-4 py-3 text-text-strong placeholder:text-gray-400`
- Focus: `ring-2 ring-[--color-blue] ring-offset-2 ring-offset-white shadow-[0_0_0_3px_rgba(37,99,235,0.18)]`
- Error: border/error ring rgba(239,68,68,0.18), helper text #EF4444 12px/400
- Success: border #10B981 shadow rgba(16,185,129,0.18)
- Disabled: `bg-border-muted text-gray-400 border-border`
- Label: 14px/600 #6B7280; Helper: 12px/400 #6B7280

---
## Cards (data-testid="card-{section}")
- Base: `bg-white border border-border rounded-[8px] p-5 shadow-soft transition duration-200`
- Hover: `shadow-hover bg-surface-hover`
- Stat card: flex col gap-3; Value 18px/600 #111827; Label 14px/600 #6B7280

---
## Badges (data-testid="badge-{status}")
- Base: `inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold`
- Success: bg #ECFDF3 text #15803D border border-[#BBF7D0]
- Error: bg #FEF2F2 text #B91C1C border border-[#FECACA]
- Info: bg #FFF7ED text #C2410C border border-[#FED7AA]
- Neutral: bg #F3F4F6 text #374151 border border-[#E5E7EB]
- Icon size 16-20px stroke 2px inherit

---
## Sidebar / Nav (data-testid="nav-{item}")
- Container: width 200px, bg #1A1A1A, text #F9FAFB, padding 16px
- Nav item: height ≥44px; padding 12x16; radius 6px acceptable but prefer 4-6px
- Active: bg rgba(255,255,255,0.08), text white, icon white
- Hover: bg rgba(255,255,255,0.04)
- Dividers: #2C2C2C 1px

---
## Layout
- Max content width 1400px; padding-x 24px; section gap 32px
- Grid: mobile 1 col, tablet 2, desktop 3; gap 16px
- Header/Hero: padding 24px; bottom border #E5E7EB; title 32/700; subtitle 16/500 #374151

---
## Icons
- Stroke: 2px; Size: 20x20 (16 for compact); Color inherits (blue on primary actions)
- Keep line style consistent; ensure focusable when standalone buttons

---
## States & Motion
- Hover: bg surface-hover; Focus: 2px blue outline; Active: 0.98 scale buttons
- Transitions: 200ms ease-out for color, bg, shadow; 100ms for active

---
## Responsive
- Reduce padding to 16px on mobile where needed; cards stay 20px if space allows
- Buttons full width on mobile; grids collapse to single column

---
## Accessibility
- Contrast AA: primary blue on white passes; text/dark combos all ≥4.5:1
- Keyboard: all interactive reachable, focus visible
- Form semantics intact; aria-label for icon-only controls

This spec replaces prior gold/emerald palette. Use these values moving forward.
