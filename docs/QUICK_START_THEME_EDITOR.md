# Quick Start - Admin Theme Editor

**Purpose:** Customize storefront appearance as tenant OWNER

---

## Access

**URL:** `/{tenantId}/dashboard/settings/appearance`

**Requirements:**
- Logged in as OWNER
- Tenant must be active

---

## Quick Guide

### 1. Choose Template

Click one of three template cards:
- **Gallery** - Large images, hover zoom (Instagram-style)
- **Detail** - Wide layout, rich product info (Amazon-style)
- **Minimal** - Compact grid, many products (Pinterest-style)

### 2. Customize Theme

Adjust settings to match your brand:
- **Grid Columns:** Drag slider (1-6 products per row)
- **Image Aspect:** Pick ratio (Square, Standard, Widescreen)
- **Card Style:** Choose visual (Flat, Elevated, Outlined)
- **Spacing:** Select density (Compact, Normal, Relaxed)
- **Colors:** Pick primary + accent colors with pickers

### 3. Preview Changes

Right panel shows live preview:
- Updates automatically after 300ms
- Shows 4 sample products
- Reflects all your customizations

### 4. Save or Reset

**Save Changes:**
- Click blue "Save Changes" button
- Success notification appears
- Storefront updates immediately

**Reset to Defaults:**
- Click "Reset to Defaults" button
- Form reverts to template defaults
- Preview updates to show defaults

---

## Tips

- Template defaults auto-load when switching templates
- Custom colors are preserved across template changes
- Preview shows actual ProductGrid component
- Changes are not applied until you click Save
- You can Reset at any time to undo unsaved changes

---

## Troubleshooting

**Can't access page?**
- Verify you're logged in
- Check you're OWNER (not just member)
- Try logging out and back in

**Preview not updating?**
- Wait 300ms after making changes
- Check browser console for errors
- Refresh page if needed

**Save button disabled?**
- Make at least one change first
- Check no validation errors (red text)
- Verify colors are valid hex format (#RRGGBB)

---

**End of Guide**
