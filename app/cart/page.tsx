"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Package,
  Truck,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { supabase } from "@/lib/supabase";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    getTotal,
    clearCart,
    appliedPromo,
    setAppliedPromo,
  } = useCartStore();
  const { locale, t } = useLocale();
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});

  // Ukloni iz qtyInputs sve id-eve koji više nisu u korpi (npr. posle Remove ili ponovnog dodavanja)
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

  // Subtotal excludes VAT; PDV is added on the discounted amount
  const subtotal = getTotal();
  const promoDiscountAmount = appliedPromo
    ? subtotal * (appliedPromo.discount / 100)
    : 0;
  const taxableAmount = Math.max(0, subtotal - promoDiscountAmount);
  const pdv = taxableAmount * 0.2;
  const amountWithVat = taxableAmount + pdv;
  const deliveryFee = subtotal > 0 ? (amountWithVat >= 5000 ? 0 : 840) : 0;
  const total = amountWithVat + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-16 min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full border-2">
          <CardContent className="p-6 sm:p-12 text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-6 sm:p-8">
                <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">
              {t("emptyCart")}
            </h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg">
              {t("startShopping")}
            </p>
            <Button
              size="lg"
              className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-lg"
              asChild
            >
              <Link href="/products">{t("hero.cta")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-[100vw] overflow-x-hidden">
        <div className="mb-4 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 sm:mb-4 hover:bg-primary/10"
            asChild
          >
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">{t("cart.continueShopping")}</span>
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">
            {t("cart.title")}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg">
            {items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
            {t("cart.items")}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0">
            <Card className="border-2 overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-xl font-bold flex items-center gap-2 min-w-0">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    <span className="truncate">
                      {t("cart.items")} (
                      {items.reduce((sum, item) => sum + item.quantity, 0)})
                    </span>
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 text-sm"
                  >
                    <Trash2 className="mr-1 sm:mr-2 h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">
                      {t("cart.emptyCart")}
                    </span>
                  </Button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {items.map((item) => {
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
                    // Title is the option name; sublabel provides context
                    const title = isBaseItem ? productName : variationName;
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
                        className="min-w-0 overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 min-w-0">
                          {/* Top row on mobile: Image + Info + Price */}
                          <div className="flex gap-3 sm:gap-6 min-w-0">
                            {/* Product Image */}
                            <Link
                              href={`/products/${item.product.id}`}
                              className="relative h-20 w-20 sm:h-32 sm:w-32 flex-shrink-0 rounded-xl overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
                            >
                              <Image
                                src={
                                  item.variation.imageUrl ||
                                  item.product.image ||
                                  "/placeholder.svg"
                                }
                                alt={title}
                                fill
                                className="object-contain p-2 sm:p-3"
                              />
                            </Link>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/products/${item.product.id}`}
                                className="hover:text-primary transition-colors block min-w-0"
                              >
                                <h3 className="font-bold text-base sm:text-lg line-clamp-2 mb-0.5 sm:mb-1">
                                  {title}
                                </h3>
                              </Link>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-1">
                                {subLabel} • {productUnit}
                              </p>
                              {/* Price on mobile: below title to save horizontal space */}
                              <div className="sm:hidden text-left">
                                <div className="font-bold text-sm text-primary">
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

                            {/* Price: desktop only (right column) */}
                            <div className="hidden sm:block text-right flex-shrink-0 min-w-0">
                              <div
                                className="font-bold text-lg mb-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]"
                                title={`${(finalPrice * item.quantity).toFixed(
                                  2
                                )} RSD`}
                              >
                                {(finalPrice * item.quantity).toFixed(2)} RSD
                              </div>
                              {(isBaseItem && item.product.discount) ||
                              (!isBaseItem && variationDiscount > 0) ? (
                                <div className="text-sm text-muted-foreground line-through mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                  {(basePrice * item.quantity).toFixed(2)} RSD
                                </div>
                              ) : null}
                              <div className="text-xs text-muted-foreground">
                                {finalPrice.toFixed(2)} RSD / {t("quantity")}
                              </div>
                            </div>
                          </div>

                          {/* Bottom row: Quantity + Remove (full width on mobile) */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
                            {/* Quantity Controls */}
                            <div className="flex items-center border-2 rounded-lg shadow-sm flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-muted"
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
                                <Minus className="h-4 w-4" />
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
                                  const val = e.target.value.replace(
                                    /\D+/g,
                                    ""
                                  );
                                  const num = parseInt(val || "0", 10) || 0;
                                  const clamped =
                                    val === ""
                                      ? val
                                      : String(
                                          Math.min(99999, Math.max(1, num))
                                        );
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
                                className="min-w-[3.5rem] w-14 sm:min-w-[6rem] sm:w-24 h-8 sm:h-10 text-center text-sm sm:text-base font-bold border-0 focus-visible:ring-0 tabular-nums"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-muted"
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
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const id = item.variation.id;
                                removeItem(id);
                                setQtyInputs((prev) => {
                                  const next = { ...prev };
                                  delete next[id];
                                  return next;
                                });
                              }}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 text-sm shrink-0"
                            >
                              <Trash2 className="h-4 w-4 mr-1 sm:mr-2 shrink-0" />
                              <span className="truncate">{t("remove")}</span>
                            </Button>
                          </div>
                        </div>
                        <Separator className="mt-4 sm:mt-6" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 min-w-0">
            <Card className="lg:sticky lg:top-24 border-2 shadow-xl overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
                  {t("cart.orderDetails")}
                </h2>

                {/* Promo Code */}
                <div className="mb-4 sm:mb-6">
                  <label className="text-sm font-semibold mb-2 sm:mb-3 block">
                    {t("cart.promoCode")}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                    <Input
                      placeholder={t("cart.promoCodePlaceholder")}
                      value={appliedPromo ? appliedPromo.code : promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 min-w-0 h-10 sm:h-11"
                      disabled={promoLoading || !!appliedPromo}
                    />
                    {appliedPromo ? (
                      <Button
                        variant="outline"
                        className="h-10 sm:h-11 px-4 sm:px-6 bg-transparent shrink-0"
                        onClick={() => {
                          setAppliedPromo(null);
                          setPromoCode("");
                        }}
                      >
                        {t("action.remove") ?? "Ukloni"}
                      </Button>
                    ) : (
                      <Button
                        className="h-10 sm:h-11 px-4 sm:px-6 shrink-0"
                        disabled={promoLoading}
                        onClick={async () => {
                          const code = promoCode.trim();
                          if (!code) return;
                          try {
                            setPromoLoading(true);
                            const { data, error } = await supabase
                              .from("promo_codes")
                              .select("code, discount, active")
                              .eq("active", true)
                              .ilike("code", code)
                              .limit(10);
                            if (error) throw error;
                            const match =
                              (data ?? []).find(
                                (r) =>
                                  (r.code ?? "").toLowerCase() ===
                                  code.toLowerCase()
                              ) ?? null;
                            if (!match) {
                              return;
                            }
                            setAppliedPromo({
                              code: match.code,
                              discount: Number(match.discount),
                            });
                          } catch {
                            // ignore
                          } finally {
                            setPromoLoading(false);
                          }
                        }}
                      >
                        {t("cart.applyPromo")}
                      </Button>
                    )}
                  </div>
                </div>

                <Separator className="my-4 sm:my-6" />

                {/* Price Breakdown */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between text-sm sm:text-base min-w-0 gap-2">
                    <span className="text-muted-foreground shrink-0">
                      {t("subtotal")}
                    </span>
                    <span className="font-semibold shrink-0 truncate text-right">
                      {subtotal.toFixed(2)} RSD
                    </span>
                  </div>
                  {appliedPromo && (
                    <>
                      <div className="flex justify-between text-sm sm:text-base min-w-0 gap-2">
                        <span className="text-muted-foreground truncate">
                          {t("cart.promo")} ({appliedPromo.code})
                        </span>
                        <span className="font-semibold text-green-700 shrink-0">
                          -{promoDiscountAmount.toFixed(2)} RSD
                        </span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base min-w-0 gap-2">
                        <span className="text-muted-foreground">
                          {t("subtotalAfterPromo")}
                        </span>
                        <span className="font-semibold shrink-0">
                          {taxableAmount.toFixed(2)} RSD
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm sm:text-base min-w-0 gap-2">
                    <span className="text-muted-foreground">{t("vat20")}</span>
                    <span className="font-semibold shrink-0">
                      {pdv.toFixed(2)} RSD
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base min-w-0 gap-2">
                    <span className="text-muted-foreground">
                      {t("cart.deliveryFee")}
                    </span>
                    <span className="font-semibold shrink-0">
                      {deliveryFee === 0
                        ? t("cart.free")
                        : `${deliveryFee.toFixed(2)} RSD`}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {t("cart.freeShippingNote")}
                    </p>
                  )}
                </div>

                <Separator className="my-4 sm:my-6" />

                {/* Total */}
                <div className="flex justify-between items-center gap-2 mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/5 rounded-lg min-w-0">
                  <span className="text-lg sm:text-xl font-bold shrink-0">
                    {t("total")}
                  </span>
                  <span
                    className="text-xl sm:text-3xl font-bold text-primary truncate text-right"
                    title={`${total.toFixed(2)} RSD`}
                  >
                    {total.toFixed(2)} RSD
                  </span>
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/checkout">{t("cart.selectAddress")}</Link>
                </Button>

                {/* Delivery Info */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-br from-muted/50 to-muted rounded-lg border">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    {t("cart.deliveryDetails")}
                  </h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• {t("cart.delivery")}</p>
                    <p>• {t("cart.confirmTime")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
