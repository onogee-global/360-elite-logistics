"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, ArrowLeft } from "lucide-react";
import type { Product, Category, ProductVariation } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface ProductDetailProps {
  product: Product;
  category?: Category;
}

export function ProductDetail({ product, category }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined); // 'product' | variation.id
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  const variations = product.variations ?? [];
  const effectiveVariations: ProductVariation[] = useMemo(
    () => variations,
    [variations]
  );
  const selectedIsProductBase = selectedKey === "product";
  const selectedVariation: ProductVariation | undefined = useMemo(
    () =>
      selectedKey && selectedKey !== "product"
        ? effectiveVariations.find((v) => v.id === selectedKey)
        : undefined,
    [effectiveVariations, selectedKey]
  );

  useEffect(() => {
    // Always default to base product on first load
    if (!selectedKey) setSelectedKey("product");
  }, [effectiveVariations, selectedKey]);

  // Selected option (base or variation) computed values
  const selectedPrice = selectedIsProductBase
    ? product.price ?? 0
    : selectedVariation?.price ?? 0;
  // Apply product-level discount only to the base option
  const effectivePrice =
    selectedIsProductBase && product.discount
      ? selectedPrice * (1 - product.discount / 100)
      : selectedPrice;
  const selectedImage = selectedIsProductBase
    ? product.image || "/placeholder.svg"
    : selectedVariation?.imageUrl || product.image || "/placeholder.svg";
  const selectedUnit = selectedIsProductBase
    ? product.unit
    : selectedVariation?.unit;
  const selectedInStock = selectedIsProductBase
    ? product.inStock ?? true
    : !!selectedVariation?.inStock;

  const handleAddToCart = () => {
    // Create a pseudo-variation for base option to stay compatible with current cart store
    const variationToAdd: ProductVariation | undefined = selectedIsProductBase
      ? ({
          id: `base-${product.id}`,
          productId: product.id,
          name: product.name,
          nameEn: product.nameEn,
          price: product.price ?? 0,
          unit: product.unit ?? "",
          unitEn: product.unitEn ?? "",
          inStock: product.inStock ?? true,
          imageUrl: product.image,
          isActive: true,
        } as ProductVariation)
      : selectedVariation;
    if (!variationToAdd || variationToAdd.price <= 0) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product, variationToAdd);
    }
    toast({
      title: "Dodato u korpu",
      description: `${quantity}x ${product.name}${
        selectedIsProductBase ? "" : ` (${variationToAdd.name})`
      } je dodato u vašu korpu`,
    });
    setQuantity(1);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 overflow-x-auto scrollbar-hide">
        <Link href="/" className="hover:text-foreground whitespace-nowrap">
          Početna
        </Link>
        <span>/</span>
        <Link
          href="/products"
          className="hover:text-foreground whitespace-nowrap"
        >
          Proizvodi
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${category.slug}`}
              className="hover:text-foreground whitespace-nowrap"
            >
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <Button variant="ghost" size="sm" className="mb-4 md:mb-6" asChild>
        <Link href="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Nazad na proizvode</span>
          <span className="sm:hidden">Nazad</span>
        </Link>
      </Button>

      {/* Product Image */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          {selectedIsProductBase && product.discount && (
            <Badge className="absolute top-3 right-3 md:top-4 md:right-4 z-10 bg-destructive text-destructive-foreground text-base md:text-lg px-2 py-1 md:px-3">
              -{product.discount}%
            </Badge>
          )}
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-4 md:space-y-6">
          <div>
            {category && (
              <p className="text-xs md:text-sm text-muted-foreground mb-2">
                {category.icon} {category.name}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {product.name}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {product.description}
            </p>
          </div>

          <Separator />

          {/* Main + Variation Selector */}
          <div>
            <p className="text-sm font-medium mb-3">
              Izaberite proizvod ili varijaciju
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Base product option */}
              <button
                type="button"
                onClick={() => setSelectedKey("product")}
                className={cn(
                  "w-full rounded-md border px-3 py-2 text-left transition-colors",
                  selectedIsProductBase
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium truncate">{product.name}</span>
                  </div>
                  <span className="text-sm whitespace-nowrap">
                    {(product.price ?? 0).toFixed(2)} RSD
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Glavni proizvod
                </div>
              </button>
              {effectiveVariations.map((v) => {
                const selected = v.id === selectedKey;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedKey(v.id)}
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              v.imageUrl || product.image || "/placeholder.svg"
                            }
                            alt={v.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium truncate">{v.name}</span>
                      </div>
                      <span className="text-sm whitespace-nowrap">
                        {v.price.toFixed(2)} RSD
                      </span>
                    </div>
                    {v.unit && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Pakovanje: {v.unit}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div>
            <p className="text-xs md:text-sm text-muted-foreground mb-2">
              Cena
            </p>
            <div className="flex items-baseline gap-2 md:gap-3">
              <>
                {product.discount ? (
                  <>
                    <span className="text-3xl md:text-4xl font-bold">
                      {effectivePrice.toFixed(2)} RSD
                    </span>
                    <span className="text-lg md:text-xl text-muted-foreground line-through">
                      {selectedPrice.toFixed(2)} RSD
                    </span>
                  </>
                ) : (
                  <span className="text-3xl md:text-4xl font-bold">
                    {selectedPrice.toFixed(2)} RSD
                  </span>
                )}
              </>
            </div>
            {selectedUnit && (
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Pakovanje: {selectedUnit}
              </p>
            )}
          </div>

          <Separator />

          {/* Quantity Selector */}
          <div>
            <p className="text-sm font-medium mb-3">Količina</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                Ukupno: {(effectivePrice * quantity).toFixed(2)} RSD
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={!selectedInStock || selectedPrice <= 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {selectedInStock ? "Dodaj u korpu" : "Nema na stanju"}
          </Button>

          {/* Product Details */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="font-semibold mb-4 text-sm md:text-base">
                Detalji proizvoda
              </h3>
              <dl className="space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Kategorija:</dt>
                  <dd className="font-medium">{category?.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pakovanje:</dt>
                  <dd className="font-medium">{selectedUnit ?? "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Dostupnost:</dt>
                  <dd className="font-medium">
                    {selectedInStock ? "Na stanju" : "Nema na stanju"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
