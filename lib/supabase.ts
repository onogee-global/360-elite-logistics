import { createClient } from "@supabase/supabase-js"
import type { Category, Product, ProductVariation, PromoCode } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const imagesBucket = process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET ?? "product-images"

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})

// Helpers return app-level types for consistency with UI
// ---- User profile helpers ----
export interface UserProfile {
  userId: string
  companyName: string
  pib: string
  address: string
  city: string
  phone: string
  contactName: string
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id, company_name, pib, address, city, phone, contact_name")
    .eq("user_id", userId)
    .single()
    .returns<any>()
  if (error && error.code !== "PGRST116") {
    throw error
  }
  if (!data) return null
  return {
    userId: data.user_id,
    companyName: data.company_name ?? "",
    pib: data.pib ?? "",
    address: data.address ?? "",
    city: data.city ?? "",
    phone: data.phone ?? "",
    contactName: data.contact_name ?? "",
  }
}

export async function upsertUserProfile(profile: UserProfile): Promise<void> {
  const payload = {
    user_id: profile.userId,
    company_name: profile.companyName || null,
    pib: profile.pib || null,
    address: profile.address || null,
    city: profile.city || null,
    phone: profile.phone || null,
    contact_name: profile.contactName || null,
  }
  const { error } = await supabase.from("user_profiles").upsert(payload, { onConflict: "user_id" })
  if (error) throw error
}

export async function fetchProductsPublic(): Promise<Product[]> {
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
      price,
      discount
    `,
    )
    .order("name", { ascending: true })
    .returns<any[]>()

  if (error || !data) {
    throw error ?? new Error("Failed to fetch products")
  }
  // No variations embedded here on purpose (lighter payload for listing)
  return data as Product[]
}

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
      product_variations:product_variations!product_variations_product_id_fkey (
        id,
        product_id,
        name,
        nameEn,
        description,
        descriptionen,
        price,
        unit,
        unitEn,
        inStock,
        imageUrl,
        isActive,
        discount
      )
    `,
    )
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
      price,
      discount,
      product_variations:product_variations!product_variations_product_id_fkey (
        id,
        product_id,
        name,
        nameEn,
        price,
        unit,
        unitEn,
        inStock,
        imageUrl,
        isActive,
        discount
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
    price: typeof data.price === "number" ? data.price : undefined,
    discount: data.discount ?? undefined,
    variations,
  }
  return product
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, nameen, slug, icon")
    .returns<any[]>()
  if (error || !data) {
    throw error ?? new Error("Failed to fetch categories")
  }
  // Subcategories fetched separately if needed; keep empty for now
  return data.map((c) => ({ id: c.id, name: c.name, nameEn: c.nameen, slug: c.slug, icon: c.icon, subcategories: [] })) as Category[]
}

export async function fetchCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, nameen, slug, icon")
    .eq("id", id)
    .single()
    .returns<any>()
  if (error && error.code !== "PGRST116") {
    throw error
  }
  if (!data) return null
  return { id: data.id, name: data.name, nameEn: data.nameen, slug: data.slug, icon: data.icon, subcategories: [] } as Category
}

// ---- Admin helpers (CRUD) ----
export async function fetchProductsAdmin(): Promise<Product[]> {
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
      price,
      discount
    `,
    )
    .order("name", { ascending: true })
    .returns<any[]>()

  if (error || !data) {
    throw error ?? new Error("Failed to fetch products")
  }
  return data as Product[]
}

export interface CreateProductInput {
  name: string
  nameEn: string
  description?: string
  descriptionEn?: string
  image?: string
  categoryId: string
  subcategoryId?: string
  price?: number
  discount?: number
}

export async function createProduct(input: CreateProductInput): Promise<string> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      nameEn: input.nameEn,
      description: input.description ?? null,
      descriptionEn: input.descriptionEn ?? null,
      image: input.image ?? null,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId ?? null,
      price: typeof input.price === "number" ? input.price : null,
      discount: input.discount ?? null,
    })
    .select("id")
    .single()
  if (error || !data) {
    throw error ?? new Error("Failed to create product")
  }
  return data.id as string
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string
}

export async function updateProduct(input: UpdateProductInput): Promise<void> {
  const updates: Record<string, unknown> = { }
  if (typeof input.name !== "undefined") updates.name = input.name
  if (typeof input.nameEn !== "undefined") updates.nameEn = input.nameEn
  if (typeof input.description !== "undefined") updates.description = input.description ?? null
  if (typeof input.descriptionEn !== "undefined") updates.descriptionEn = input.descriptionEn ?? null
  if (typeof input.image !== "undefined") updates.image = input.image ?? null
  if (typeof input.categoryId !== "undefined") updates.categoryId = input.categoryId
  if (typeof input.subcategoryId !== "undefined") updates.subcategoryId = input.subcategoryId ?? null
  if (typeof input.price !== "undefined") updates.price = typeof input.price === "number" ? input.price : null
  if (typeof input.discount !== "undefined") updates.discount = input.discount ?? null

  const { error } = await supabase.from("products").update(updates).eq("id", input.id)
  if (error) {
    throw error
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw error
}

export interface CreateCategoryInput {
  name: string
  nameEn: string
  slug: string
  icon?: string
  parentId?: string | null
}

export async function fetchCategoriesAdmin(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, nameen, slug, icon")
    .order("name", { ascending: true })
    .returns<any[]>()
  if (error || !data) throw error ?? new Error("Failed to fetch categories")
  return data.map((c) => ({ id: c.id, name: c.name, nameEn: c.nameen, slug: c.slug, icon: c.icon, subcategories: [] })) as Category[]
}

export async function createCategory(input: CreateCategoryInput): Promise<string> {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: input.name,
      nameen: input.nameEn,
      slug: input.slug,
      icon: input.icon ?? null,
      parent_id: input.parentId ?? null,
    })
    .select("id")
    .single()
  if (error || !data) {
    throw error ?? new Error("Failed to create category")
  }
  return data.id as string
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string
}

export async function updateCategory(input: UpdateCategoryInput): Promise<void> {
  const updates: Record<string, unknown> = { }
  if (typeof input.name !== "undefined") updates.name = input.name
  if (typeof input.nameEn !== "undefined") updates.nameen = input.nameEn
  if (typeof input.slug !== "undefined") updates.slug = input.slug
  if (typeof input.icon !== "undefined") updates.icon = input.icon ?? null
  if (typeof input.parentId !== "undefined") updates.parent_id = input.parentId ?? null
  const { error } = await supabase.from("categories").update(updates).eq("id", input.id)
  if (error) throw error
}

// ---- Product variations (admin CRUD) ----
export interface CreateProductVariationInput {
  productId: string
  name: string
  nameEn: string
  price: number
  imageUrl: string
  isActive?: boolean
  description?: string
  descriptionEn?: string
  discount?: number
}

export interface UpdateProductVariationInput extends Partial<CreateProductVariationInput> {
  id: string
}

export async function fetchProductVariationsAdmin(productId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("product_variations")
    .select("id, productId, name, nameEn, price, imageUrl, isActive, description, descriptionen, discount")
    .eq("productId", productId)
    .order("name", { ascending: true })
    .returns<any[]>()
  if (error || !data) {
    throw error ?? new Error("Failed to fetch product variations")
  }
  return data.map((row) => ({
    id: row.id,
    productId: row.productId,
    name: row.name,
    nameEn: row.nameEn,
    price: row.price,
    imageUrl: row.imageUrl ?? "",
    isActive: !!row.isActive,
    // new optional fields
    description: row.description ?? "",
    descriptionEn: row.descriptionen ?? "",
    discount: typeof row.discount === "number" ? row.discount : undefined,
  })) as any[]
}

export async function createProductVariation(input: CreateProductVariationInput): Promise<string> {
  const payload = {
    productId: input.productId,
    product_id: input.productId,
    name: input.name,
    nameEn: input.nameEn,
    price: input.price,
    imageUrl: input.imageUrl,
    isActive: input.isActive ?? true,
    description: (input as any).description ?? null,
    descriptionen: (input as any).descriptionEn ?? null,
    discount: (input as any).discount ?? null,
  }
  const { data, error } = await supabase
    .from("product_variations")
    .insert(payload)
    .select("id")
    .single()
  if (error || !data) {
    throw error ?? new Error("Failed to create product variation")
  }
  return data.id as string
}

export async function updateProductVariation(input: UpdateProductVariationInput): Promise<void> {
  const updates: Record<string, unknown> = {}
  if (typeof input.productId !== "undefined") {
    updates.productId = input.productId
    ;(updates as any).product_id = input.productId
  }
  if (typeof input.name !== "undefined") updates.name = input.name
  if (typeof input.nameEn !== "undefined") updates.nameEn = input.nameEn
  if (typeof input.price !== "undefined") updates.price = input.price
  if (typeof input.imageUrl !== "undefined") updates.imageUrl = input.imageUrl
  if (typeof input.isActive !== "undefined") updates.isActive = input.isActive ?? false
  if (typeof (input as any).description !== "undefined") updates.description = (input as any).description ?? null
  if (typeof (input as any).descriptionEn !== "undefined") updates.descriptionen = (input as any).descriptionEn ?? null
  if (typeof (input as any).discount !== "undefined") updates.discount = (input as any).discount ?? null
  const { error } = await supabase.from("product_variations").update(updates).eq("id", input.id)
  if (error) throw error
}

export async function deleteProductVariation(id: string): Promise<void> {
  const { error } = await supabase.from("product_variations").delete().eq("id", id)
  if (error) throw error
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id)
  if (error) throw error
}

// ---- Storage helper for image uploads ----
function safeUuid(): string {
  // Browser environment preferred
  if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
    return (crypto as any).randomUUID()
  }
  // Fallback: simple random string
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function uploadImageToStorage(file: File, folder: "products" | "categories"): Promise<{ publicUrl: string, path: string }> {
  const ext = file.name.split(".").pop() ?? "bin"
  const fileName = `${folder}/${safeUuid()}.${ext}`
  const { error } = await supabase.storage.from(imagesBucket).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  })
  if (error) {
    throw error
  }
  const { data: urlData } = supabase.storage.from(imagesBucket).getPublicUrl(fileName)
  return { publicUrl: urlData.publicUrl, path: fileName }
}

// ---- Orders helpers ----
export interface CreateOrderItemInput {
  productId: string
  variationId: string
  quantity: number
  unitPrice: number
  name: string
  variationName: string
  image?: string
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
    variation_id: it.variationId && !String(it.variationId).startsWith("base-") ? it.variationId : null,
    quantity: it.quantity,
    unit_price: it.unitPrice,
    name: it.name,
    variation_name: it.variationName,
    image: (it as any).image ?? null,
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
  orderNumber?: number
}

export async function fetchOrdersForUser(userId: string): Promise<OrderSummary[]> {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, created_at, total, status, order_number")
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
    orderNumber: typeof o.order_number === "number" ? o.order_number : undefined,
  }))
}

// ---- Order detail (for account page) ----
export interface OrderItemDetail {
  name: string
  variationName: string | null
  quantity: number
  unitPrice: number
  image: string | null
  productId?: string | null
  variationId?: string | null
}

export interface OrderDetail {
  id: string
  createdAt: string
  total: number
  items: OrderItemDetail[]
  orderNumber?: number
}

export async function fetchOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, created_at, total, order_number")
    .eq("id", orderId)
    .single()
    .returns<any>()
  if (orderErr || !order) return null

  // Try to read snapshot image if the column exists; otherwise fall back to current images
  let mapped: OrderItemDetail[] = []
  try {
    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("name, variation_name, quantity, unit_price, image, product_id, variation_id")
      .eq("order_id", orderId)
      .order("id", { ascending: true })
      .returns<any[]>()
    if (itemsErr) throw itemsErr
    mapped = (items ?? []).map((it) => ({
      name: it.name,
      variationName: it.variation_name ?? null,
      quantity: it.quantity ?? 0,
      unitPrice: it.unit_price ?? 0,
      image: it.image ?? null,
      // keep IDs for potential client actions (e.g., repeat order)
      productId: it.product_id ?? null,
      variationId: it.variation_id ?? null,
    }))
  } catch (_e: any) {
    // Fallback path: query without image column and compute images from products/variations
    const { data: items2, error: itemsErr2 } = await supabase
      .from("order_items")
      .select("name, variation_name, quantity, unit_price, product_id, variation_id")
      .eq("order_id", orderId)
      .order("id", { ascending: true })
      .returns<any[]>()
    if (itemsErr2) return null

    const productIds = Array.from(
      new Set((items2 ?? []).map((i) => i.product_id).filter(Boolean)),
    )
    const variationIds = Array.from(
      new Set((items2 ?? []).map((i) => i.variation_id).filter(Boolean)),
    )

    const [prodRes, varRes] = await Promise.all([
      productIds.length
        ? supabase
            .from("products")
            .select("id, image")
            .in("id", productIds)
            .returns<any[]>()
        : Promise.resolve({ data: [] as any[] }),
      variationIds.length
        ? supabase
            .from("product_variations")
            .select("id, imageUrl")
            .in("id", variationIds)
            .returns<any[]>()
        : Promise.resolve({ data: [] as any[] }),
    ])

    const prodMap = new Map<string, string | null>()
    ;(prodRes.data ?? []).forEach((p: any) => prodMap.set(p.id, p.image ?? null))
    const varMap = new Map<string, string | null>()
    ;(varRes.data ?? []).forEach((v: any) => varMap.set(v.id, v.imageUrl ?? null))

    mapped = (items2 ?? []).map((it) => ({
      name: it.name,
      variationName: it.variation_name ?? null,
      quantity: it.quantity ?? 0,
      unitPrice: it.unit_price ?? 0,
      image:
        (it.variation_id ? varMap.get(it.variation_id) : prodMap.get(it.product_id)) ?? null,
      productId: it.product_id ?? null,
      variationId: it.variation_id ?? null,
    }))
  }

  return {
    id: order.id,
    createdAt: order.created_at,
    total: order.total,
    items: mapped,
    orderNumber: typeof order.order_number === "number" ? order.order_number : undefined,
  }
}

// ---- Promo codes (admin CRUD) ----
export interface CreatePromoCodeInput {
  code: string
  discount: number
  active?: boolean
}

export interface UpdatePromoCodeInput extends Partial<CreatePromoCodeInput> {
  id: string
}

export async function fetchPromoCodesAdmin(): Promise<PromoCode[]> {
  const { data, error } = await supabase
    .from("promo_codes")
    .select("id, code, discount, active, created_at")
    .order("created_at", { ascending: false })
    .returns<any[]>()
  if (error || !data) throw error ?? new Error("Failed to fetch promo codes")
  return data.map((r) => ({
    id: r.id,
    code: r.code,
    discount: r.discount,
    active: typeof r.active === "boolean" ? r.active : true,
    createdAt: r.created_at,
  })) as PromoCode[]
}

export async function createPromoCode(input: CreatePromoCodeInput): Promise<string> {
  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      code: input.code,
      discount: input.discount,
      active: typeof input.active === "boolean" ? input.active : true,
    })
    .select("id")
    .single()
  if (error || !data) throw error ?? new Error("Failed to create promo code")
  return data.id as string
}

export async function updatePromoCode(input: UpdatePromoCodeInput): Promise<void> {
  const updates: Record<string, unknown> = {}
  if (typeof input.code !== "undefined") updates.code = input.code
  if (typeof input.discount !== "undefined") updates.discount = input.discount
  if (typeof input.active !== "undefined") updates.active = !!input.active
  const { error } = await supabase.from("promo_codes").update(updates).eq("id", input.id)
  if (error) throw error
}

export async function deletePromoCode(id: string): Promise<void> {
  const { error } = await supabase.from("promo_codes").delete().eq("id", id)
  if (error) throw error
}





