"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { Product, Category } from "@/lib/types";
import { fetchCategories, fetchProductsWithVariations } from "@/lib/supabase";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const discountParam = searchParams.get("discount");
  const { locale, t } = useLocale();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [showDiscountOnly, setShowDiscountOnly] = useState(
    discountParam === "true"
  );
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProductsWithVariations(),
        ]);
        if (!cancelled) {
          setCategories(cats);
          setAllProducts(prods);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
          setAllProducts([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Filter by category slug if possible
    if (selectedCategories.length > 0) {
      const slugById = new Map(categories.map((c) => [c.id, c.slug]));
      filtered = filtered.filter((p) =>
        selectedCategories.includes(slugById.get(p.categoryId) || "")
      );
    }

    // When not in discount-only mode, we keep product-level filtering only.
    // Discount-only listing is handled by discountedEntries below.

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc": {
          const aPrice = Math.min(
            ...((a.variations ?? []).map((v) => v.price) || [
              a.price ?? Number.MAX_SAFE_INTEGER,
            ])
          );
          const bPrice = Math.min(
            ...((b.variations ?? []).map((v) => v.price) || [
              b.price ?? Number.MAX_SAFE_INTEGER,
            ])
          );
          return aPrice - bPrice;
        }
        case "price-desc": {
          const aPrice = Math.min(
            ...((a.variations ?? []).map((v) => v.price) || [a.price ?? 0])
          );
          const bPrice = Math.min(
            ...((b.variations ?? []).map((v) => v.price) || [b.price ?? 0])
          );
          return bPrice - aPrice;
        }
        case "name":
        default: {
          const nameA = locale === "en" ? a.nameEn : a.name;
          const nameB = locale === "en" ? b.nameEn : b.name;
          return (nameA || "").localeCompare(nameB || "");
        }
      }
    });

    return filtered;
  }, [
    allProducts,
    categories,
    selectedCategories,
    sortBy,
    locale,
  ]);

  // Discount-only entries: base discounted products and discounted variations, ordered by highest discount
  const discountedEntries = useMemo(() => {
    if (!showDiscountOnly) return [];
    const entries: Array<{ product: Product; promoVariationId?: string; discountPct: number }> = [];
    const slugById = new Map(categories.map((c) => [c.id, c.slug]));
    const categoryFilterActive = selectedCategories.length > 0;
    for (const p of allProducts) {
      if (categoryFilterActive) {
        const slug = slugById.get(p.categoryId) || "";
        if (!selectedCategories.includes(slug)) continue;
      }
      if (typeof p.discount === "number" && p.discount > 0 && typeof p.price === "number" && p.price > 0) {
        entries.push({ product: p, discountPct: p.discount });
      }
      if (Array.isArray(p.variations)) {
        for (const v of p.variations) {
          const vd = (v as any)?.discount as number | undefined;
          if (typeof vd === "number" && vd > 0) {
            entries.push({ product: p, promoVariationId: v.id, discountPct: vd });
          }
        }
      }
    }
    entries.sort((a, b) => b.discountPct - a.discountPct);
    return entries;
  }, [showDiscountOnly, allProducts, categories, selectedCategories]);

  const toggleCategory = (categorySlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categorySlug)
        ? prev.filter((c) => c !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("allProducts")}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden"
        >
          <Filter className="mr-2 h-4 w-4" />
          {t("filters")}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside
          className={`w-full md:w-64 space-y-6 ${
            showFilters ? "block" : "hidden md:block"
          }`}
        >
          {/* Categories */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">{t("categories")}</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={category.slug}
                      checked={selectedCategories.includes(category.slug)}
                      onCheckedChange={() => toggleCategory(category.slug)}
                    />
                    <Label
                      htmlFor={category.slug}
                      className="text-sm cursor-pointer flex items-center gap-2"
                    >
                      <span>{category.icon}</span>
                      <span>
                        {locale === "en" ? category.nameEn : category.name}
                      </span>
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
                  onCheckedChange={(checked) =>
                    setShowDiscountOnly(checked as boolean)
                  }
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
                setSelectedCategories([]);
                setShowDiscountOnly(false);
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
              {t("showing")}{" "}
              {isLoading ? "…" : showDiscountOnly ? discountedEntries.length : filteredProducts.length}{" "}
              {!isLoading &&
                ((showDiscountOnly ? discountedEntries.length : filteredProducts.length) === 1
                  ? t("product")
                  : t("products"))}
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
          {isLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">{t("loading")}</p>
              </CardContent>
            </Card>
          ) : (showDiscountOnly ? discountedEntries.length > 0 : filteredProducts.length > 0) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {showDiscountOnly
                ? discountedEntries.map(({ product, promoVariationId, discountPct }) => {
                    const cat = categories.find((c) => c.id === product.categoryId);
                    const catName = cat ? (locale === "en" ? cat.nameEn : cat.name) : undefined;
                    return (
                      <ProductCard
                        key={`${product.id}-${promoVariationId ?? "base"}`}
                        product={product}
                        categoryName={catName}
                        promoVariationId={promoVariationId}
                        forceBaseDiscount={!promoVariationId}
                      />
                    );
                  })
                : filteredProducts.map((product) => {
                    const cat = categories.find((c) => c.id === product.categoryId);
                    const catName = cat
                      ? locale === "en"
                        ? cat.nameEn
                        : cat.name
                      : undefined;
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        categoryName={catName}
                        forceBaseDiscount
                      />
                    );
                  })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">{t("noProductsMatch")}</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSelectedCategories([]);
                    setShowDiscountOnly(false);
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
  );
}
