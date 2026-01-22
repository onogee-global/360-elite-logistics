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
  const [cursor, setCursor] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [parallax, setParallax] = useState<{ px: number; py: number }>({ px: 0, py: 0 });
  const [pulse, setPulse] = useState(0);

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

  // Special offers: list base discounted products and discounted variations; order by highest discount
  const featuredOffers = useMemo(() => {
    type Entry = { product: Product; promoVariationId?: string; isVariation: boolean; discountPct: number };
    const list: Entry[] = [];
    for (const p of products) {
      // base product discount with valid base price
      if (typeof p.discount === "number" && p.discount > 0 && typeof p.price === "number" && p.price > 0) {
        list.push({ product: p, isVariation: false, discountPct: p.discount });
      }
      // discounted variations
      const vars = Array.isArray(p.variations) ? p.variations : [];
      for (const v of vars) {
        const vd = (v as any)?.discount as number | undefined;
        if (typeof vd === "number" && vd > 0) {
          list.push({ product: p, promoVariationId: v.id, isVariation: true, discountPct: vd });
        }
      }
    }
    list.sort((a, b) => b.discountPct - a.discountPct);
    return list.slice(0, 12);
  }, [products]);

  return (
    <div className="min-h-screen">
      <div
        className="relative overflow-hidden"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          setCursor({ x: cx, y: cy });
          setPulse((p) => (p + 1) % 10000);
          // normalized center-based parallax (-1..1)
          const nx = (cx / rect.width) * 2 - 1;
          const ny = (cy / rect.height) * 2 - 1;
          setParallax({ px: nx, py: ny });
        }}
        onMouseLeave={() => setParallax({ px: 0, py: 0 })}
      >
        {/* Hero background inspired by new logo (lighter cool blues) */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1200px 500px at 10% -10%, rgba(90,170,255,0.55), transparent 60%), radial-gradient(1100px 460px at 110% 0%, rgba(120,220,255,0.46), transparent 55%), radial-gradient(900px 620px at 50% 120%, rgba(60,150,255,0.42), transparent 60%), radial-gradient(1400px 700px at -10% 110%, rgba(170,100,255,0.28), transparent 60%), radial-gradient(1200px 700px at 110% 120%, rgba(0,230,210,0.22), transparent 60%), linear-gradient(180deg, rgba(12,26,48,0.08) 0%, rgba(12,26,48,0.05) 40%, rgba(12,26,48,0.04) 100%)",
          }}
        />
        {/* Subtle moving glows */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "linear-gradient(135deg, rgba(70,150,255,0.35), rgba(180,220,255,0.28))" }}
          style={{
            background: "linear-gradient(135deg, rgba(70,150,255,0.35), rgba(180,220,255,0.28))",
            x: parallax.px * 24,
            y: parallax.py * -18,
          } as any}
          animate={{ opacity: [0.55, 0.75, 0.6, 0.55] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -right-28 h-80 w-80 rounded-full blur-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(120,190,255,0.32), rgba(60,120,230,0.28))",
            x: parallax.px * -20,
            y: parallax.py * 16,
          } as any}
          animate={{ opacity: [0.5, 0.7, 0.6, 0.5] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Interactive ripple pulses at cursor (colorful, not just a circle) */}
        <motion.div
          key={`pulse-${pulse}`}
          aria-hidden
          className="pointer-events-none absolute -z-10"
          style={{ left: cursor.x, top: cursor.y, translateX: "-50%", translateY: "-50%" }}
          initial={{ opacity: 0.35, scale: 0.6, rotate: 0 }}
          animate={{ opacity: 0, scale: 1.4, rotate: 12 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        >
          <div
            className="relative"
            style={{ width: "46vmin", height: "46vmin" }}
          >
            <div
              className="absolute inset-0 rounded-[40%_60%_50%_50%/40%_40%_60%_60%] blur-xl"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(0,230,210,0.35), rgba(90,170,255,0.4), rgba(170,100,255,0.35), rgba(0,230,210,0.35))",
                filter: "saturate(1.2)",
              }}
            />
            <div
              className="absolute inset-8 rounded-full border"
              style={{
                borderColor: "rgba(255,255,255,0.35)",
                boxShadow: "0 0 40px rgba(120,200,255,0.25) inset",
              }}
            />
          </div>
        </motion.div>
        {/* Animated conic hue halo */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[60vmin] w-[60vmin] rounded-full blur-2xl opacity-25 -z-10"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(80,160,255,0.35), rgba(120,220,255,0.3), rgba(60,140,255,0.35), rgba(80,160,255,0.35))",
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        {/* Subtle grid lines overlay */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.7), rgba(255,255,255,0.7) 1px, transparent 1px, transparent 14px), repeating-linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,0.7) 1px, transparent 1px, transparent 14px)",
          }}
        />
        {/* Faint logo watermark */}
        <motion.div
          className="pointer-events-none absolute right-6 top-6 opacity-10 md:opacity-15 -z-10"
          animate={{ y: [0, 4, 0], opacity: [0.1, 0.14, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/brand/logo.png"
            alt=""
            width={320}
            height={120}
            className="w-[160px] md:w-[240px] lg:w-[320px] h-auto drop-shadow"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-background/10" />
        <div className="container mx-auto px-4 py-24 md:py-40">
          <motion.div
            className="max-w-3xl mx-auto text-center will-change-transform"
            style={{
              rotateX: parallax.py * -3,
              rotateY: parallax.px * 3,
              transformPerspective: 900,
            } as any}
          >
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
                <Button size="lg" className="text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden" asChild>
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
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-transparent" asChild>
                  <Link href="/products?discount=true">
                    {t("hero.ctaSecondary")}
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
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
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {categories.map((category, idx) => (
              <Reveal key={category.id} delay={idx * 0.05}>
                <Link
                  href={`/products?categoryId=${category.id}`}
                  className="group"
                >
                  <Card className="relative overflow-hidden border hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 aspect-square">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative h-full flex flex-col items-center justify-center p-3 text-center">
                      {category.image ? (
                        <div className="relative h-12 w-12 md:h-14 md:w-14 mb-2 transform group-hover:scale-105 transition-transform">
                          <Image
                            src={category.image}
                            alt={locale === "en" ? category.nameEn : category.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="text-3xl md:text-4xl mb-2 transform group-hover:scale-105 transition-transform">
                          {category.icon}
                        </div>
                      )}
                      <p className="font-medium text-xs md:text-sm group-hover:text-primary transition-colors">
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
            {featuredOffers.map(({ product, promoVariationId, isVariation }) => {
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
                  forceBaseDiscount={!isVariation}
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
