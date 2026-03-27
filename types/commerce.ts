/**
 * Commerce Types for Multi-Tenant Product Pages
 *
 * Defines interfaces for products, cart, and color variants
 * Used across storefront components and API interactions
 */

// Re-export theme types for convenience
export type {
  CardVariant,
  ImageAspectRatio,
  ResolvedTheme,
  SpacingMode,
  TenantTemplate,
  ThemeColors,
  ThemeOverrides,
} from './theme'

export {
  DEFAULT_COLORS,
  isValidTemplate,
  isValidThemeOverrides,
  resolveTheme,
  TEMPLATE_DEFAULTS,
} from './theme'

/**
 * Product interface matching API response.
 * Discount fields (original_price, effective_price, discount_active) are
 * computed by the API via computeEffectivePrice / isDiscountActive.
 */
export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  images: string[]
  colors: ProductColor[]
  stock: number
  category: string | null
  artist?: string
  type?: 'digital' | 'physical' | 'both'
  optionsCount?: number
  isNew?: boolean
  isLimited?: boolean
  isFeatured?: boolean
  metadata?: any
  // Discount fields (from API withDiscountFields)
  original_price?: number
  effective_price?: number
  discount_active?: boolean
  discount_type?: string | null
  discount_value?: number | null
}

/**
 * Product color variant
 * MVP: Static data
 * Future: DB-backed product_variants table
 */
export interface ProductColor {
  id: string
  name: string
  hex: string
}

/**
 * Cart item with product reference and selections.
 * price = effective (post-discount) price.
 * originalPrice = base price before any discount.
 */
export interface CartItem {
  productId: string
  name: string
  price: number
  originalPrice: number
  currency: string
  quantity: number
  image: string
  color?: ProductColor
  maxQuantity: number
  size?: {
    id: string
    label: string
    dimensions: string
  }
  modifiers?: SelectedModifier[]
  modifiersTotalDelta?: number
}

/**
 * Cart store state
 */
export interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (productId: string, colorId?: string) => void
  updateQuantity: (productId: string, colorId: string | undefined, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

// ---- Product Modifiers ----

export interface ModifierGroup {
  id: string
  tenant_id: number
  product_id: number
  name: string
  min_selections: number
  max_selections: number
  display_order: number
  active: boolean
  created_at: string
  options?: ModifierOption[]
}

export interface ModifierOption {
  id: string
  tenant_id: number
  modifier_group_id: string
  name: string
  price_delta: number
  active: boolean
  display_order: number
}

export interface SelectedModifier {
  modifier_group_id: string
  modifier_option_id: string
}

export interface CartLineItem {
  product_id: number
  quantity: number
  selected_modifiers: SelectedModifier[]
}

// ---- Order Line Items (structured) ----

export interface OrderLineItem {
  id: string
  tenant_id: number
  order_id: number
  product_id: number
  product_name: string
  unit_price: number
  quantity: number
  subtotal: number
  modifiers?: OrderLineItemModifier[]
}

export interface OrderLineItemModifier {
  id: string
  order_line_item_id: string
  modifier_option_id: string
  modifier_group_name: string
  modifier_name: string
  price_delta: number
}

// ---- Legacy discount types removed (043 table dropped in 044) ----
// Product-level discounts now live on the products table as:
// discount_type, discount_value, discount_starts_at, discount_ends_at
// Use computeEffectivePrice / isDiscountActive from lib/pricing.ts
