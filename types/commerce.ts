/**
 * Commerce Types for Multi-Tenant Product Pages
 *
 * Defines interfaces for products, cart, and color variants
 * Used across storefront components and API interactions
 */

// Re-export theme types for convenience
export type {
  TenantTemplate,
  CardVariant,
  SpacingMode,
  ImageAspectRatio,
  ThemeColors,
  ThemeOverrides,
  ResolvedTheme,
} from './theme'

export {
  TEMPLATE_DEFAULTS,
  DEFAULT_COLORS,
  isValidTemplate,
  isValidThemeOverrides,
  resolveTheme,
} from './theme'

/**
 * Product interface matching API response
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
 * Cart item with product reference and selections
 */
export interface CartItem {
  productId: string
  name: string
  price: number
  currency: string
  quantity: number
  image: string
  color?: ProductColor
  maxQuantity: number
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
