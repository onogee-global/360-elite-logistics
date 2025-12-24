"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { Card, CardContent } from "@/components/ui/card"
import { useLocale } from "@/lib/locale-context"
import type { Product, Category } from "@/lib/types"
import { fetchCategories, fetchProductsWithVariations } from "@/lib/supabase"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const { locale, t } = useLocale()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProductsWithVariations(),
        ])
        if (mounted) {
          setCategories(cats)
          setAllProducts(prods)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const lowerQuery = query.toLowerCase()
    return allProducts.filter((product) => {
      const name = locale === "en" ? product.nameEn : product.name
      const description =
        locale === "en" ? product.descriptionEn : product.description
      const category = categories.find((c) => c.id === product.categoryId)
      const categoryName = category
        ? locale === "en"
          ? category.nameEn
          : category.name
        : ""
      return (
        (name || "").toLowerCase().includes(lowerQuery) ||
        (description || "").toLowerCase().includes(lowerQuery) ||
        (categoryName || "").toLowerCase().includes(lowerQuery)
      )
    })
  }, [query, locale, allProducts, categories])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("searchResults")}</h1>
        <p className="text-muted-foreground">
          {t("searchFor")}: <span className="font-medium text-foreground">{query}</span>
        </p>
      </div>

      {searchResults.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            {t("found")} {searchResults.length} {searchResults.length === 1 ? t("product") : t("products")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-2">{t("noResults")}</p>
            <p className="text-sm text-muted-foreground">{t("tryDifferentKeywords")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
