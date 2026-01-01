"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { Category, Product } from "@/lib/types";
import { fetchCategories, fetchProductsWithVariations } from "@/lib/supabase";

export default function HomePage() {
  const { locale, t } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProductsWithVariations(),
        ]);
        if (mounted) {
          setCategories(cats);
          setProducts(prods);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Special offers entries: one per discounted product (base) and one per discounted variation
  const featuredOffers = useMemo(() => {
    const items: Array<{ product: Product; promoVariationId?: string }> = [];
    for (const p of products) {
      if (typeof p.discount === "number" && p.discount > 0) {
        items.push({ product: p });
      }
      if (Array.isArray(p.variations)) {
        for (const v of p.variations) {
          const vd = (v as any)?.discount as number | undefined;
          if (typeof vd === "number" && vd > 0) {
            items.push({ product: p, promoVariationId: v.id });
          }
        }
      }
    }
    return items.slice(0, 8);
  }, [products]);

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <Image
          src="/brand/hero-breathtaking.svg"
          alt="360 Logistic hero"
          fill
          priority
          className="object-cover -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/0 to-background/40 -z-10" />
        <div className="container mx-auto px-4 py-24 md:py-40">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              {t("hero.badge")}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t("hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-shadow"
                asChild
              >
                <Link href="/products">
                  {t("hero.cta")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 h-14 bg-transparent"
                asChild
              >
                <Link href="/products?discount=true">
                  {t("hero.ctaSecondary")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {t("categories.title")}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t("categories.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group"
              >
                <Card className="relative overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1 aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="text-5xl md:text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                      {category.icon}
                    </div>
                    <p className="font-semibold text-base md:text-lg group-hover:text-primary transition-colors">
                      {locale === "sr" ? category.name : category.nameEn}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                {t("featured.title")}
              </h2>
              <p className="text-muted-foreground">{t("featured.subtitle")}</p>
            </div>
            <Button variant="ghost" className="gap-2" asChild>
              <Link href="/products?discount=true">
                {t("featured.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredOffers.map(({ product, promoVariationId }) => {
              const cat = categories.find((c) => c.id === product.categoryId);
              const catName = cat
                ? locale === "en"
                  ? cat.nameEn
                  : cat.name
                : undefined;
              return (
                <ProductCard
                  key={`${product.id}-${promoVariationId ?? "base"}`}
                  product={product}
                  categoryName={catName}
                  promoVariationId={promoVariationId}
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
