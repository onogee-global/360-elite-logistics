"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, Package } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocale } from "@/lib/locale-context";
import { Separator } from "@/components/ui/separator";

export function CartDrawer() {
  const { items, updateQuantity, removeItem, getTotal, getItemCount } =
    useCartStore();
  const { locale, t } = useLocale();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const itemCount = getItemCount();
  const total = getTotal();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 relative hover:bg-primary/10"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="hidden md:inline font-medium">{t("cart")}</span>
          {mounted && itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg animate-in zoom-in">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b bg-gradient-to-r from-primary/5 to-accent/5">
          <SheetTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl">{t("cart.title")}</div>
              <div className="text-sm font-normal text-muted-foreground">
                {itemCount} {itemCount === 1 ? t("product") : t("products")}
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 mb-2">
                <Package className="h-12 w-12 text-primary" />
              </div>
              <div>
                <p className="text-xl font-semibold mb-2">{t("emptyCart")}</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {t("startShopping")}
                </p>
              </div>
              <Button asChild className="mt-4">
                <Link href="/products">{t("shop")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea
              className="flex-1 px-6"
              style={{ maxHeight: "calc(100vh - 280px)" }}
            >
              <div className="space-y-3 py-6">
                {items.map((item, index) => {
                  const isBaseItem = item.variation.id.startsWith("base-");
                  const basePrice = item.variation.price;
                  // Apply product-level discount only to base option lines
                  const finalPrice =
                    isBaseItem && item.product.discount
                      ? basePrice * (1 - item.product.discount / 100)
                      : basePrice;
                  const productName =
                    locale === "sr" ? item.product.name : item.product.nameEn;
                  const variationName =
                    locale === "sr" ? item.variation.name : item.variation.nameEn;
                  // Title is the option name:
                  // - base option → product name
                  // - variation option → variation name
                  const title = isBaseItem ? productName : variationName;
                  // Sublabel provides context:
                  // - base option → "Glavni proizvod"/"Base product"
                  // - variation option → product name
                  const subLabel = isBaseItem
                    ? locale === "sr"
                      ? "Glavni proizvod"
                      : "Base product"
                    : productName;
                  const productUnit =
                    locale === "sr"
                      ? item.variation.unit
                      : item.variation.unitEn;

                  return (
                    <div
                      key={item.variation.id}
                      className="flex gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-right"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted ring-1 ring-border">
                        <Image
                          src={
                            item.variation.imageUrl ||
                            item.product.image ||
                            "/placeholder.svg"
                          }
                            alt={title}
                          fill
                          className="object-contain p-2"
                        />
                        {isBaseItem && item.product.discount && (
                          <div className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded">
                            -{item.product.discount}%
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-sm line-clamp-2 mb-0.5">
                            {title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {subLabel} • {productUnit}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-lg shadow-sm bg-background">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-muted hover:text-primary transition-colors"
                              onClick={() =>
                                updateQuantity(
                                  item.variation.id,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center text-sm font-bold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-muted hover:text-primary transition-colors"
                              onClick={() =>
                                updateQuantity(
                                  item.variation.id,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => removeItem(item.variation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-between">
                        <div className="font-bold text-base text-primary">
                          {(finalPrice * item.quantity).toFixed(2)} RSD
                        </div>
                        {isBaseItem && item.product.discount && (
                          <div className="text-xs text-muted-foreground line-through">
                            {(basePrice * item.quantity).toFixed(2)} RSD
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="border-t bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm px-6 py-5 space-y-4 shadow-lg">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("cart.allProducts")}
                  </span>
                  <span className="font-semibold">{total.toFixed(2)} RSD</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">{t("total")}</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {total.toFixed(2)} RSD
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-accent hover:opacity-90"
                asChild
              >
                <Link href="/cart">{t("cart.viewCart")}</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
