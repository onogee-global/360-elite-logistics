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


