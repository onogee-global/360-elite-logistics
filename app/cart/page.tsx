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
      <div className="container mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full border-2">
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-8">
                <ShoppingBag className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-3">{t("emptyCart")}</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              {t("startShopping")}
            </p>
            <Button
              size="lg"
              className="h-12 px-8 text-base font-semibold shadow-lg"
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 hover:bg-primary/10"
            asChild
          >
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("cart.continueShopping")}
            </Link>
          </Button>
          <h1 className="text-4xl font-bold mb-2">{t("cart.title")}</h1>
          <p className="text-muted-foreground text-lg">
            {items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
            {t("cart.items")}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {t("cart.items")} (
                    {items.reduce((sum, item) => sum + item.quantity, 0)})
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("cart.emptyCart")}
                  </Button>
                </div>

                <div className="space-y-6">
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
                      <div key={item.variation.id}>
                        <div className="flex gap-6">
                          {/* Product Image */}
                          <Link
                            href={`/products/${item.product.id}`}
                            className="relative h-32 w-32 flex-shrink-0 rounded-xl overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
                          >
                            <Image
                              src={
                                item.variation.imageUrl ||
                                item.product.image ||
                                "/placeholder.svg"
                              }
                              alt={title}
                              fill
                              className="object-contain p-3"
                            />
                          </Link>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.product.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              <h3 className="font-bold text-lg line-clamp-2 mb-1">
                                {title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mb-4">
                              {subLabel} • {productUnit}
                            </p>

                            <div className="flex items-center gap-4">
                              {/* Quantity Controls: +/- koriste trenutni prikazani broj (input ili store) */}
                              <div className="flex items-center border-2 rounded-lg shadow-sm">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 hover:bg-muted"
                                  onClick={() => {
                                    const raw =
                                      qtyInputs[item.variation.id] ??
                                      String(item.quantity);
                                    const current = Math.min(
                                      99999,
                                      Math.max(
                                        1,
                                        parseInt(raw || "1", 10) || 1,
                                      ),
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
                                      "",
                                    );
                                    const num = parseInt(val || "0", 10) || 0;
                                    const clamped =
                                      val === ""
                                        ? val
                                        : String(
                                            Math.min(99999, Math.max(1, num)),
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
                                      Math.max(
                                        1,
                                        parseInt(raw || "1", 10) || 1,
                                      ),
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
                                        Math.max(
                                          1,
                                          parseInt(raw || "1", 10) || 1,
                                        ),
                                      );
                                      updateQuantity(item.variation.id, next);
                                      setQtyInputs((prev) => ({
                                        ...prev,
                                        [item.variation.id]: String(next),
                                      }));
                                    }
                                  }}
                                  className="min-w-[6rem] w-24 h-10 text-center text-base font-bold border-0 focus-visible:ring-0 tabular-nums"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 hover:bg-muted"
                                  onClick={() => {
                                    const raw =
                                      qtyInputs[item.variation.id] ??
                                      String(item.quantity);
                                    const current = Math.min(
                                      99999,
                                      Math.max(
                                        1,
                                        parseInt(raw || "1", 10) || 1,
                                      ),
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
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("remove")}
                              </Button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="font-bold text-xl mb-1">
                              {(finalPrice * item.quantity).toFixed(2)} RSD
                            </div>
                            {(isBaseItem && item.product.discount) ||
                            (!isBaseItem && variationDiscount > 0) ? (
                              <div className="text-sm text-muted-foreground line-through mb-2">
                                {(basePrice * item.quantity).toFixed(2)} RSD
                              </div>
                            ) : null}
                            <div className="text-xs text-muted-foreground">
                              {finalPrice.toFixed(2)} RSD / {t("quantity")}
                            </div>
                          </div>
                        </div>
                        <Separator className="mt-6" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">
                  {t("cart.orderDetails")}
                </h2>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="text-sm font-semibold mb-3 block">
                    {t("cart.promoCode")}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("cart.promoCodePlaceholder")}
                      value={appliedPromo ? appliedPromo.code : promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 h-11"
                      disabled={promoLoading || !!appliedPromo}
                    />
                    {appliedPromo ? (
                      <Button
                        variant="outline"
                        className="h-11 px-6 bg-transparent"
                        onClick={() => {
                          setAppliedPromo(null);
                          setPromoCode("");
                        }}
                      >
                        {t("action.remove") ?? "Ukloni"}
                      </Button>
                    ) : (
                      <Button
                        className="h-11 px-6"
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
                                  code.toLowerCase(),
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

                <Separator className="my-6" />

                {/* Price Breakdown */}
                <div className="space-y-4">
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">
                      {t("subtotal")}
                    </span>
                    <span className="font-semibold">
                      {subtotal.toFixed(2)} RSD
                    </span>
                  </div>
                  {appliedPromo && (
                    <>
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">
                          {t("cart.promo")} ({appliedPromo.code})
                        </span>
                        <span className="font-semibold text-green-700">
                          -{promoDiscountAmount.toFixed(2)} RSD
                        </span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">
                          {t("subtotalAfterPromo")}
                        </span>
                        <span className="font-semibold">
                          {taxableAmount.toFixed(2)} RSD
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">{t("vat20")}</span>
                    <span className="font-semibold">{pdv.toFixed(2)} RSD</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">
                      {t("cart.deliveryFee")}
                    </span>
                    <span className="font-semibold">
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

                <Separator className="my-6" />

                {/* Total */}
                <div className="flex justify-between items-center mb-6 p-4 bg-primary/5 rounded-lg">
                  <span className="text-xl font-bold">{t("total")}</span>
                  <span className="text-3xl font-bold text-primary">
                    {total.toFixed(2)} RSD
                  </span>
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/checkout">{t("cart.selectAddress")}</Link>
                </Button>

                {/* Delivery Info */}
                <div className="mt-6 p-4 bg-gradient-to-br from-muted/50 to-muted rounded-lg border">
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
