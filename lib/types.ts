export interface Product {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  price: number
  image: string
  categoryId: string
  subcategoryId: string
  unit: string
  unitEn: string
  inStock: boolean
  discount?: number
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
