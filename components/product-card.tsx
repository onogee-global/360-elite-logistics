"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Sparkles } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/locale-context";
import type { ProductVariation } from "@/lib/types";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  promoVariationId?: string;
  forceBaseDiscount?: boolean;
}

export function ProductCard({ product, categoryName, promoVariationId, forceBaseDiscount = false }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();
  const { locale, t } = useLocale();
  const router = useRouter();

  const handleAddToCart = () => {
    const variations = product.variations ?? [];
    let variationToAdd: ProductVariation | undefined;
    if (promoVariationId) {
      variationToAdd = variations.find((v) => v.id === promoVariationId) as ProductVariation | undefined;
    } else if (variations.length === 1) {
      variationToAdd = variations[0] as ProductVariation;
    } else {
      // Add base product as pseudo-variation to match cart store expectations
      variationToAdd = {
        id: `base-${product.id}`,
        productId: product.id,
        name: locale === "sr" ? product.name : product.nameEn,
        nameEn: product.nameEn,
        price: product.price ?? 0,
        unit: product.unit ?? "",
        unitEn: product.unitEn ?? "",
        inStock: product.inStock ?? true,
        imageUrl: product.image,
        isActive: true,
      } as ProductVariation;
    }
    if (!variationToAdd) return;
    addItem(product, variationToAdd);
    toast({
      title: t("product.addedToCart"),
      description: `${locale === "sr" ? product.name : product.nameEn} ${t(
        "product.addedMessage"
      )}`,
    });
  };

  const basePrice = typeof product.price === "number" ? product.price : 0;
  const variationsArr = product.variations ?? [];
  const minVariationPrice =
    variationsArr.length > 0
      ? Math.min(...variationsArr.map((v) => v.price))
      : undefined;
  const displayBasePrice = minVariationPrice ?? basePrice;
  // Determine pricing to display
  let priceNow: number = displayBasePrice ?? 0;
  let priceOriginal: number | undefined = undefined;
  let promoVar: ProductVariation | undefined = undefined;
  if (forceBaseDiscount) {
    if (typeof product.discount === "number" && product.discount > 0 && basePrice > 0) {
      priceNow = basePrice * (1 - product.discount / 100);
      priceOriginal = basePrice;
    } else {
      priceNow = basePrice;
      priceOriginal = undefined;
    }
    promoVar = undefined;
  } else if (promoVariationId) {
    const v = variationsArr.find((vv) => vv.id === promoVariationId);
    const vd = (v as any)?.discount as number | undefined;
    if (v && typeof vd === "number" && vd > 0) {
      promoVar = v;
      priceNow = v.price * (1 - vd / 100);
      priceOriginal = v.price;
    } else {
      priceNow = displayBasePrice ?? 0;
      priceOriginal = undefined;
    }
  } else {
    // Compute best discounted candidate among base or any variation
    const candidates: Array<{ now: number; original: number; kind: "base" | "variation"; varRef?: ProductVariation }> = [];
    if (typeof product.discount === "number" && product.discount > 0 && basePrice > 0) {
      candidates.push({ now: basePrice * (1 - product.discount / 100), original: basePrice, kind: "base" });
    }
    for (const v of variationsArr) {
      const vd = (v as any)?.discount as number | undefined;
      if (typeof vd === "number" && vd > 0) {
        candidates.push({ now: v.price * (1 - vd / 100), original: v.price, kind: "variation", varRef: v });
      }
    }
    if (candidates.length > 0) {
      const best = candidates.reduce((min, c) => (c.now < min.now ? c : min), candidates[0]);
      priceNow = best.now;
      priceOriginal = best.original;
      if (best.kind === "variation" && best.varRef) promoVar = best.varRef;
    } else {
      priceNow = displayBasePrice ?? 0;
      priceOriginal = undefined;
    }
  }
  const promoPct =
    typeof priceOriginal === "number" && priceOriginal > 0
      ? Math.round((1 - priceNow / priceOriginal) * 100)
      : undefined;
  const productName = locale === "sr" ? product.name : product.nameEn;
  const productUnit = locale === "sr" ? product.unit : product.unitEn;
  const displayName =
    promoVar && !forceBaseDiscount ? (locale === "sr" ? promoVar.name : promoVar.nameEn) : productName;
  const displayUnit = promoVar && !forceBaseDiscount ? promoVar.unit : productUnit;

  // categoryName is provided by callers that know the category list

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
    <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col">
      {typeof promoPct === "number" && promoPct > 0 && (
        <Badge className="absolute top-3 right-3 z-10 bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground shadow-lg px-3 py-1 text-sm font-bold">
          <Sparkles className="h-3 w-3 mr-1 inline" />-{promoPct}%
        </Badge>
      )}

      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
          <Image
            src={((promoVar && !forceBaseDiscount ? promoVar.imageUrl : product.image) || "/placeholder.svg") as string}
            alt={displayName}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      <CardContent className="p-5 flex-1 flex flex-col">
        {categoryName && (
          <Badge variant="secondary" className="mb-3 text-xs font-medium">
            {categoryName}
          </Badge>
        )}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {displayName}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-3">{displayUnit}</p>
        <div className="flex items-baseline gap-2 flex-wrap">
          {typeof priceOriginal === "number" ? (
            <>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {priceNow.toFixed(2)} RSD
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {priceOriginal.toFixed(2)} RSD
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold">
              {priceNow.toFixed(2)} RSD
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 mt-auto">
        {(() => {
          const variations = product.variations ?? [];
          const canAdd =
            variations.length === 1
              ? !!variations[0].inStock
              : product.inStock ?? true;
          return (
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                onClick={handleAddToCart}
                disabled={!canAdd || (variations.length !== 1 && !(product.price ?? 0))}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {canAdd ? t("addToCart") : t("outOfStock")}
              </Button>
            </motion.div>
          );
        })()}
      </CardFooter>
    </Card>
    </motion.div>
  );
}
