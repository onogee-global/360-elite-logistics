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
import { motion } from "framer-motion";
import Reveal from "@/components/reveal";

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
        {/* Animated gradient layers for a living backdrop */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full blur-3xl bg-primary/20 -z-10"
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -10, 10, 0],
            opacity: [0.6, 0.8, 0.7, 0.6],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full blur-3xl bg-accent/20 -z-10"
          animate={{
            x: [0, -10, 10, 0],
            y: [0, 12, -8, 0],
            opacity: [0.5, 0.7, 0.6, 0.5],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-64 w-[60%] blur-2xl bg-gradient-to-r from-primary/20 via-transparent to-accent/20 -z-10"
          animate={{ opacity: [0.15, 0.3, 0.2, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="container mx-auto px-4 py-24 md:py-40">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" />
              {t("hero.badge")}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.05,
              }}
              className="text-5xl md:text-7xl font-bold mb-6 text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
            >
              {t("hero.title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.12,
              }}
              className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    staggerChildren: 0.08,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <Button
                  size="lg"
                  className="text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
                  asChild
                >
                  <Link href="/products" className="group">
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
                    {t("hero.cta")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
              >
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
              </motion.div>
            </motion.div>
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
            {categories.map((category, idx) => (
              <Reveal key={category.id} delay={idx * 0.05}>
                <Link
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
              </Reveal>
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
