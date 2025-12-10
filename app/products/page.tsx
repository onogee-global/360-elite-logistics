"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { products, categories } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const discountParam = searchParams.get("discount")
  const { locale, t } = useLocale()

  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryParam ? [categoryParam] : [])
  const [showDiscountOnly, setShowDiscountOnly] = useState(discountParam === "true")
  const [sortBy, setSortBy] = useState("name")
  const [showFilters, setShowFilters] = useState(true)

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category))
    }

    // Filter by discount
    if (showDiscountOnly) {
      filtered = filtered.filter((p) => p.discount && p.discount > 0)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "name":
        default:
          const nameA = a.name?.[locale] || ""
          const nameB = b.name?.[locale] || ""
          return nameA.localeCompare(nameB)
      }
    })

    return filtered
  }, [selectedCategories, showDiscountOnly, sortBy, locale])

  const toggleCategory = (categorySlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categorySlug) ? prev.filter((c) => c !== categorySlug) : [...prev, categorySlug],
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("allProducts")}</h1>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
          <Filter className="mr-2 h-4 w-4" />
          {t("filters")}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className={`w-full md:w-64 space-y-6 ${showFilters ? "block" : "hidden md:block"}`}>
          {/* Categories */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">{t("categories")}</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.slug}
                      checked={selectedCategories.includes(category.slug)}
                      onCheckedChange={() => toggleCategory(category.slug)}
                    />
                    <Label htmlFor={category.slug} className="text-sm cursor-pointer flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{locale === "en" ? category.nameEn : category.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Discount Filter */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">{t("discounts")}</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="discount"
                  checked={showDiscountOnly}
                  onCheckedChange={(checked) => setShowDiscountOnly(checked as boolean)}
                />
                <Label htmlFor="discount" className="text-sm cursor-pointer">
                  {t("onlyDiscounted")}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Clear Filters */}
          {(selectedCategories.length > 0 || showDiscountOnly) && (
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                setSelectedCategories([])
                setShowDiscountOnly(false)
              }}
            >
              {t("clearFilters")}
            </Button>
          )}
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort and Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {t("showing")} {filteredProducts.length} {filteredProducts.length === 1 ? t("product") : t("products")}
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t("nameAZ")}</SelectItem>
                <SelectItem value="price-asc">{t("priceAsc")}</SelectItem>
                <SelectItem value="price-desc">{t("priceDesc")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">{t("noProductsMatch")}</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSelectedCategories([])
                    setShowDiscountOnly(false)
                  }}
                >
                  {t("clearFilters")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
