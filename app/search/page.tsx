"use client"

import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { useMemo } from "react"
import { useLocale } from "@/lib/locale-context"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const { locale, t } = useLocale()

  const searchResults = useMemo(() => {
    if (!query.trim()) return []

    const lowerQuery = query.toLowerCase()
    return products.filter((product) => {
      const name = product.name?.[locale] || ""
      const description = product.description?.[locale] || ""
      const categoryName = product.categoryName?.[locale] || ""

      return (
        name.toLowerCase().includes(lowerQuery) ||
        description.toLowerCase().includes(lowerQuery) ||
        categoryName.toLowerCase().includes(lowerQuery)
      )
    })
  }, [query, locale])

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
