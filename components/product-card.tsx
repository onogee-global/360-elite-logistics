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
import { categories } from "@/lib/mock-data";
import type { ProductVariation } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();
  const { locale, t } = useLocale();

  const handleAddToCart = () => {
    const variation: ProductVariation = {
      id: `${product.id}-default`,
      productId: product.id,
      name: product.unit ?? "Standard",
      nameEn: product.unitEn ?? "Standard",
      price: product.price ?? 0,
      unit: product.unit ?? "",
      unitEn: product.unitEn ?? "",
      inStock: product.inStock ?? false,
      imageUrl: product.image,
      isActive: true,
    };
    addItem(product, variation);
    toast({
      title: t("product.addedToCart"),
      description: `${locale === "sr" ? product.name : product.nameEn} ${t(
        "product.addedMessage"
      )}`,
    });
  };

  const basePrice = product.price ?? 0;
  const minVariationPrice =
    product.variations && product.variations.length > 0
      ? Math.min(...product.variations.map((v) => v.price))
      : undefined;
  const displayBasePrice = minVariationPrice ?? basePrice;
  const finalPrice =
    product.discount && displayBasePrice
      ? displayBasePrice * (1 - product.discount / 100)
      : displayBasePrice;
  const productName = locale === "sr" ? product.name : product.nameEn;
  const productUnit = locale === "sr" ? product.unit : product.unitEn;

  const category = categories.find((c) => c.id === product.categoryId);
  const subcategory = category?.subcategories?.find(
    (s) => s.id === product.subcategoryId
  );
  const categoryName = subcategory
    ? locale === "sr"
      ? subcategory.name
      : subcategory.nameEn
    : category
    ? locale === "sr"
      ? category.name
      : category.nameEn
    : "";

  return (
    <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      {product.discount && (
        <Badge className="absolute top-3 right-3 z-10 bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground shadow-lg px-3 py-1 text-sm font-bold">
          <Sparkles className="h-3 w-3 mr-1 inline" />-{product.discount}%
        </Badge>
      )}

      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={productName}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      <CardContent className="p-5">
        {categoryName && (
          <Badge variant="secondary" className="mb-3 text-xs font-medium">
            {categoryName}
          </Badge>
        )}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {productName}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-3">{productUnit}</p>
        <div className="flex items-baseline gap-2 flex-wrap">
          {product.discount ? (
            <>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {finalPrice.toFixed(2)} RSD
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {displayBasePrice.toFixed(2)} RSD
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold">
              {displayBasePrice.toFixed(2)} RSD
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all"
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {product.inStock ? t("addToCart") : t("outOfStock")}
        </Button>
      </CardFooter>
    </Card>
  );
}
