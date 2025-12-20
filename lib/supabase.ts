import { createClient } from "@supabase/supabase-js"
import type { Category, Product, ProductVariation } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})

// Helpers return app-level types for consistency with UI
export async function fetchProductsWithVariations(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      nameEn,
      description,
      descriptionEn,
      image,
      categoryId,
      subcategoryId,
      discount,
      product_variations (
        id,
        productId,
        name,
        nameEn,
        price,
        unit,
        unitEn,
        inStock,
        imageUrl,
        isActive
      )
    `,
    )
    .eq("isActive", true)
    .returns<any[]>()

  if (error || !data) {
    throw error ?? new Error("Failed to fetch products")
  }

  return data.map((row) => {
    const variations: ProductVariation[] = (row.product_variations ?? []) as ProductVariation[]
    const product: Product = {
      id: row.id,
      name: row.name,
      nameEn: row.nameEn,
      description: row.description,
      descriptionEn: row.descriptionEn,
      image: row.image,
      categoryId: row.categoryId,
      subcategoryId: row.subcategoryId,
      discount: row.discount ?? undefined,
      variations,
    }
    return product
  })
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      nameEn,
      description,
      descriptionEn,
      image,
      categoryId,
      subcategoryId,
      discount,
      product_variations (
        id,
        productId,
        name,
        nameEn,
        price,
        unit,
        unitEn,
        inStock,
        imageUrl,
        isActive
      )
    `,
    )
    .eq("id", id)
    .single()
    .returns<any>()

  if (error && error.code !== "PGRST116") {
    throw error
  }
  if (!data) return null

  const variations: ProductVariation[] = (data.product_variations ?? []) as ProductVariation[]
  const product: Product = {
    id: data.id,
    name: data.name,
    nameEn: data.nameEn,
    description: data.description,
    descriptionEn: data.descriptionEn,
    image: data.image,
    categoryId: data.categoryId,
    subcategoryId: data.subcategoryId,
    discount: data.discount ?? undefined,
    variations,
  }
  return product
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, nameEn, slug, icon")
    .returns<any[]>()
  if (error || !data) {
    throw error ?? new Error("Failed to fetch categories")
  }
  // Subcategories fetched separately if needed; keep empty for now
  return data.map((c) => ({ ...c, subcategories: [] })) as Category[]
}

// ---- Orders helpers ----
export interface CreateOrderItemInput {
  productId: string
  variationId: string
  quantity: number
  unitPrice: number
  name: string
  variationName: string
}

export interface CreateOrderInput {
  userId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  note?: string
  total: number
  address: {
    street: string
    city: string
    zip: string
    country: string
  }
  items: CreateOrderItemInput[]
}

export async function createOrder(input: CreateOrderInput): Promise<{ orderId: string }> {
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: input.userId,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      note: input.note ?? null,
      total: input.total,
      status: "pending",
      street: input.address.street,
      city: input.address.city,
      zip: input.address.zip,
      country: input.address.country,
    })
    .select("id")
    .single()

  if (orderError || !orderRow) {
    throw orderError ?? new Error("Failed to create order")
  }

  const orderId = orderRow.id as string

  const itemsPayload = input.items.map((it) => ({
    order_id: orderId,
    product_id: it.productId,
    variation_id: it.variationId,
    quantity: it.quantity,
    unit_price: it.unitPrice,
    name: it.name,
    variation_name: it.variationName,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(itemsPayload)
  if (itemsError) {
    throw itemsError
  }

  return { orderId }
}

export interface OrderSummary {
  id: string
  createdAt: string
  total: number
  status: string
  itemsCount: number
}

export async function fetchOrdersForUser(userId: string): Promise<OrderSummary[]> {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, created_at, total, status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<any[]>()

  if (ordersError || !orders) {
    throw ordersError ?? new Error("Failed to fetch orders")
  }

  const orderIds = orders.map((o) => o.id)
  if (orderIds.length === 0) return []

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("order_id, quantity")
    .in("order_id", orderIds)
    .returns<any[]>()

  if (itemsError || !items) {
    throw itemsError ?? new Error("Failed to fetch order items")
  }

  const countByOrderId = new Map<string, number>()
  for (const it of items) {
    const prev = countByOrderId.get(it.order_id) ?? 0
    countByOrderId.set(it.order_id, prev + (it.quantity ?? 0))
  }

  return orders.map((o) => ({
    id: o.id,
    createdAt: o.created_at,
    total: o.total,
    status: o.status,
    itemsCount: countByOrderId.get(o.id) ?? 0,
  }))
}





