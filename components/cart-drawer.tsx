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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export function CartDrawer() {
  const { items, updateQuantity, removeItem, getTotal, getItemCount } =
    useCartStore();
  const { locale, t } = useLocale();
  const { dismiss } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});
  useEffect(() => {
    setMounted(true);
  }, []);
  // Ukloni iz qtyInputs sve id-eve koji više nisu u korpi
  useEffect(() => {
    const ids = new Set(items.map((i) => i.variation.id));
    setQtyInputs((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (!ids.has(key)) {
          delete next[key];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [items]);
  const itemCount = getItemCount();
  const subtotal = getTotal();
  const pdv = subtotal * 0.2;
  const total = subtotal + pdv;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          // hide any active toast when cart is opened
          dismiss();
        }
      }}
    >
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 relative hover:bg-primary/10"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="hidden md:inline font-medium">{t("cart")}</span>
          {mounted && itemCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg animate-in zoom-in tabular-nums ${
                itemCount >= 100 ? "h-6 min-w-[2rem] px-2" : "h-5 w-5"
              }`}
            >
              {itemCount > 9999 ? "9999+" : itemCount}
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
                <Link
                  href="/products"
                  onClick={(e) => {
                    setOpen(false);
                    // On mobile (touch): close drawer first so it visibly closes, then navigate
                    if (
                      typeof window !== "undefined" &&
                      window.matchMedia("(pointer: coarse)").matches
                    ) {
                      e.preventDefault();
                      setTimeout(() => router.push("/products"), 150);
                    }
                  }}
                >
                  {t("shop")}
                </Link>
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
                  const variationDiscount =
                    !isBaseItem &&
                    typeof (item.variation as any)?.discount === "number"
                      ? ((item.variation as any).discount as number)
                      : 0;
                  // Apply discount: product-level for base option, variation-level for variations
                  const finalPrice =
                    isBaseItem && item.product.discount
                      ? basePrice * (1 - (item.product.discount ?? 0) / 100)
                      : variationDiscount > 0
                      ? basePrice * (1 - variationDiscount / 100)
                      : basePrice;
                  const productName =
                    locale === "sr" ? item.product.name : item.product.nameEn;
                  const variationName =
                    locale === "sr"
                      ? item.variation.name
                      : item.variation.nameEn;
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
                        {(isBaseItem && item.product.discount) ||
                        (!isBaseItem && variationDiscount > 0) ? (
                          <div className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded">
                            -
                            {isBaseItem
                              ? item.product.discount
                              : variationDiscount}
                            %
                          </div>
                        ) : null}
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
                              onClick={() => {
                                const raw =
                                  qtyInputs[item.variation.id] ??
                                  String(item.quantity);
                                const current = Math.min(
                                  99999,
                                  Math.max(1, parseInt(raw || "1", 10) || 1)
                                );
                                if (current <= 1) {
                                  removeItem(item.variation.id);
                                  setQtyInputs((prev) => {
                                    const next = { ...prev };
                                    delete next[item.variation.id];
                                    return next;
                                  });
                                } else {
                                  const next = current - 1;
                                  updateQuantity(item.variation.id, next);
                                  setQtyInputs((prev) => ({
                                    ...prev,
                                    [item.variation.id]: String(next),
                                  }));
                                }
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              min={1}
                              max={99999}
                              value={
                                qtyInputs[item.variation.id] ??
                                String(item.quantity)
                              }
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D+/g, "");
                                const num = parseInt(val || "0", 10) || 0;
                                const clamped =
                                  val === ""
                                    ? val
                                    : String(Math.min(99999, Math.max(1, num)));
                                setQtyInputs((prev) => ({
                                  ...prev,
                                  [item.variation.id]: clamped,
                                }));
                                if (num > 99999 && val !== "") {
                                  updateQuantity(item.variation.id, 99999);
                                }
                              }}
                              onBlur={() => {
                                const raw =
                                  qtyInputs[item.variation.id] ??
                                  String(item.quantity);
                                const next = Math.min(
                                  99999,
                                  Math.max(1, parseInt(raw || "1", 10) || 1)
                                );
                                updateQuantity(item.variation.id, next);
                                setQtyInputs((prev) => ({
                                  ...prev,
                                  [item.variation.id]: String(next),
                                }));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const raw =
                                    qtyInputs[item.variation.id] ??
                                    String(item.quantity);
                                  const next = Math.min(
                                    99999,
                                    Math.max(1, parseInt(raw || "1", 10) || 1)
                                  );
                                  updateQuantity(item.variation.id, next);
                                  setQtyInputs((prev) => ({
                                    ...prev,
                                    [item.variation.id]: String(next),
                                  }));
                                }
                              }}
                              className="min-w-[5.5rem] w-24 h-8 text-center text-sm font-bold border-0 focus-visible:ring-0 tabular-nums"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-muted hover:text-primary transition-colors"
                              onClick={() => {
                                const raw =
                                  qtyInputs[item.variation.id] ??
                                  String(item.quantity);
                                const current = Math.min(
                                  99999,
                                  Math.max(1, parseInt(raw || "1", 10) || 1)
                                );
                                const next = Math.min(99999, current + 1);
                                updateQuantity(item.variation.id, next);
                                setQtyInputs((prev) => ({
                                  ...prev,
                                  [item.variation.id]: String(next),
                                }));
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => {
                              const id = item.variation.id;
                              removeItem(id);
                              setQtyInputs((prev) => {
                                const next = { ...prev };
                                delete next[id];
                                return next;
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-between">
                        <div className="font-bold text-base text-primary">
                          {(finalPrice * item.quantity).toFixed(2)} RSD
                        </div>
                        {(isBaseItem && item.product.discount) ||
                        (!isBaseItem && variationDiscount > 0) ? (
                          <div className="text-xs text-muted-foreground line-through">
                            {(basePrice * item.quantity).toFixed(2)} RSD
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="border-t bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm px-6 py-5 space-y-4 shadow-lg">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <span className="font-semibold">
                    {subtotal.toFixed(2)} RSD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("vat20")}</span>
                  <span className="font-semibold">{pdv.toFixed(2)} RSD</span>
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
                onClick={() => {
                  setOpen(false);
                  router.push("/cart");
                }}
              >
                {t("cart.viewCart")}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
