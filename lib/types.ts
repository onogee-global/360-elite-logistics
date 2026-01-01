export interface ProductVariation {
  id: string
  productId: string
  name: string
  nameEn: string
  price: number
  unit: string
  unitEn: string
  inStock: boolean
  imageUrl?: string
  isActive?: boolean
  discount?: number
}

export interface Product {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  image: string
  categoryId: string
  subcategoryId: string
  // Product-level commercial fields deprecated in favor of variations
  // Kept optional during migration to avoid breaking UI while refactoring
  price?: number
  unit?: string
  unitEn?: string
  inStock?: boolean
  discount?: number
  // Active variations for this product (must be fetched on detail page)
  variations?: ProductVariation[]
}

export interface Category {
  id: string
  name: string
  nameEn: string
  slug: string
  icon: string
  subcategories: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
  nameEn: string
  slug: string
  categoryId: string
}

export interface CartItem {
  product: Product
  variation: ProductVariation
  quantity: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "completed" | "cancelled"
  customerName: string
  customerEmail: string
  customerPhone: string
  note?: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: "customer" | "admin"
}

export interface Locale {
  code: "sr" | "en"
  name: string
}

export interface PromoCode {
  id: string
  code: string
  discount: number
  active?: boolean
  createdAt?: string
}
