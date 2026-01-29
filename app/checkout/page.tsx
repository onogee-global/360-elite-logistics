"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { Package, MapPin } from "lucide-react";
import Image from "next/image";
import { useLocale } from "@/lib/locale-context";
import { supabase, getUserProfile } from "@/lib/supabase";
import { createOrder } from "@/lib/supabase";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { toast } = useToast();
  const { locale, t } = useLocale();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Subtotal excludes VAT; PDV is added at 20%
  const subtotal = getTotal();
  const pdv = subtotal * 0.2;
  const deliveryFee = subtotal >= 5000 ? 0 : 800;
  const total = subtotal + pdv + deliveryFee;

  // Require authenticated user for checkout
  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (!cancelled) {
        if (!data.user) {
          router.replace(`/login?redirect=${encodeURIComponent("/checkout")}`);
          return;
        }
        // Prefill fields we know about the user
        const meta = (data.user.user_metadata as any) ?? {};
        setFormData((prev) => ({
          ...prev,
          email: data.user.email ?? prev.email,
          name:
            (meta.full_name as string) ?? (meta.name as string) ?? prev.name,
          phone: (meta.phone as string) ?? prev.phone,
          address:
            (meta.address as string) ?? (meta.street as string) ?? prev.address,
          city: (meta.city as string) ?? prev.city,
          zip:
            (meta.zip as string) ??
            (meta.postal_code as string) ??
            (meta.postalCode as string) ??
            prev.zip,
        }));
        // Try to load profile overrides (from user_profiles)
        try {
          const profile = await getUserProfile(data.user.id);
          if (profile) {
            setFormData((prev) => ({
              ...prev,
              name: profile.contactName || prev.name,
              phone: profile.phone || prev.phone,
              address: profile.address || prev.address,
              city: profile.city || prev.city,
            }));
          }
        } catch {
          // ignore profile read errors
        }
        setAuthChecked(true);
      }
    }
    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (items.length === 0 && !orderPlaced) {
    router.push("/cart");
    return null;
  }

  if (!authChecked) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic SR phone normalization/validation
      const rawPhone = (formData.phone || "").replace(/\s+/g, "");
      const normalizedPhone = rawPhone.startsWith("+")
        ? rawPhone
        : rawPhone.startsWith("0")
          ? `+381${rawPhone.slice(1)}`
          : rawPhone;
      const phoneValid = /^(\+3816\d{7,8}|06\d{7,8})$/.test(normalizedPhone);
      if (!phoneValid) {
        setPhoneError("invalid");
        setIsSubmitting(false);
        return;
      } else {
        setPhoneError(null);
      }

      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        router.replace(`/login?redirect=${encodeURIComponent("/checkout")}`);
        return;
      }

      // Build order payload
      const orderItems = items.map((item) => {
        const basePrice = item.variation.price;
        const isBaseOption = item.variation.id.startsWith("base-");
        const finalUnit =
          isBaseOption && item.product.discount && item.product.discount > 0
            ? basePrice * (1 - item.product.discount / 100)
            : basePrice;
        const variationName =
          locale === "en" ? item.variation.nameEn : item.variation.name;
        const productName =
          locale === "en" ? item.product.nameEn : item.product.name;
        return {
          productId: item.product.id,
          variationId: item.variation.id,
          quantity: item.quantity,
          unitPrice: Number(finalUnit.toFixed(2)),
          name: productName,
          variationName,
        };
      });

      const subtotalComputed = orderItems.reduce(
        (sum, it) => sum + it.unitPrice * it.quantity,
        0,
      );
      const pdvComputed = subtotalComputed * 0.2;
      const deliveryComputed = subtotalComputed >= 5000 ? 0 : 800;
      const totalWithVat = subtotalComputed + pdvComputed + deliveryComputed;

      const { orderId } = await createOrder({
        userId: user.id,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: normalizedPhone,
        note: undefined,
        // Store order total WITH VAT snapshot
        total: Number(totalWithVat.toFixed(2)),
        address: {
          street: formData.address,
          city: formData.city,
          zip: formData.zip,
          country: "Srbija",
        },
        items: orderItems,
      });

      // Mark as placed to prevent cart redirect guard
      setOrderPlaced(true);

      // Send order email to business (and optionally CC customer)
      let emailSent = false;
      try {
        const emailRes = await fetch("/api/orders/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            customerEmail: formData.email,
            customerPhone: normalizedPhone,
            total: totalWithVat,
            items: orderItems.map((it) => ({
              productName: it.name,
              variationName: it.variationName ?? null,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
            })),
          }),
        });
        const emailJson = await emailRes
          .json()
          .catch(() => ({}) as Record<string, unknown>);
        emailSent =
          emailRes.ok && (emailJson as { ok?: boolean })?.ok !== false;
        if (!emailSent) {
          console.warn(
            "Order email send failed:",
            (emailJson as { error?: string })?.error ?? emailRes.statusText,
          );
          toast({
            title:
              locale === "en"
                ? "Order placed, email may have failed"
                : "Porudžbina primljena, email možda nije poslat",
            description:
              locale === "en"
                ? "Order #" +
                  orderId +
                  " was saved. If you don't receive the confirmation email, contact us."
                : "Porudžbina #" +
                  orderId +
                  " je sačuvana. Ako ne primate email, kontaktirajte nas.",
            variant: "destructive",
          });
        }
      } catch (_e) {
        toast({
          title: locale === "en" ? "Order placed" : "Porudžbina primljena",
          description:
            locale === "en"
              ? "Confirmation email could not be sent. Order #" +
                orderId +
                " was saved."
              : "Email potvrde nije poslat. Porudžbina #" +
                orderId +
                " je sačuvana.",
          variant: "destructive",
        });
      }

      clearCart();
      toast({
        title: locale === "en" ? "Order successful!" : "Porudžbina uspešna!",
        description: emailSent
          ? locale === "en"
            ? `Order #${orderId} received. A copy was sent to ${formData.email}.`
            : `Porudžbina #${orderId} je primljena. Kopija je poslata na ${formData.email}.`
          : locale === "en"
            ? `Order #${orderId} received.`
            : `Vaša porudžbina #${orderId} je primljena.`,
      });
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (err: any) {
      toast({
        title: "Greška pri poručivanju",
        description: err?.message || "Pokušajte ponovo kasnije",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
        {t("checkoutTitle")}
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                  {t("cart.deliveryDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("contact.name")} *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder={
                        locale === "en" ? "John Doe" : "Petar Petrović"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("phoneNumber")} *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      pattern="^(\+3816\d{7,8}|06\d{7,8})$"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+381 60 123 4567"
                    />
                    {phoneError && (
                      <p className="text-xs text-destructive">
                        {t("phoneInvalid") ??
                          "Unesite ispravan broj telefona (npr. +381601234567)"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("contact.emailLabel")} *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="name@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("contact.address")} *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder={
                      locale === "en"
                        ? "King Alexander Blvd 10"
                        : "Kneza Miloša 10"
                    }
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("city") ?? "Grad"} *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder={locale === "en" ? "Belgrade" : "Beograd"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">
                      {t("zip") ?? "Poštanski broj"} *
                    </Label>
                    <Input
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      required
                      placeholder="11000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment method removed per requirements; default is cash on delivery */}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Package className="h-4 w-4 md:h-5 md:w-5" />
                  {t("cart.orderDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Products */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => {
                    const isBaseItem = item.variation.id.startsWith("base-");
                    const basePrice = item.variation.price;
                    const variationDiscount =
                      !isBaseItem &&
                      typeof (item.variation as any)?.discount === "number"
                        ? ((item.variation as any).discount as number)
                        : 0;
                    const finalPrice =
                      isBaseItem && item.product.discount
                        ? basePrice * (1 - (item.product.discount ?? 0) / 100)
                        : variationDiscount > 0
                          ? basePrice * (1 - variationDiscount / 100)
                          : basePrice;

                    const productName =
                      locale === "en" ? item.product.nameEn : item.product.name;
                    const variationName =
                      locale === "en"
                        ? item.variation.nameEn
                        : item.variation.name;

                    return (
                      <div
                        key={item.variation.id}
                        className="flex gap-2 md:gap-3"
                      >
                        <div className="relative h-12 w-12 md:h-16 md:w-16 flex-shrink-0">
                          <Image
                            src={
                              item.variation.imageUrl ||
                              item.product.image ||
                              "/placeholder.svg"
                            }
                            alt={`${productName} ${variationName}`}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium line-clamp-2">
                            {productName} — {variationName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}x {finalPrice.toFixed(2)} RSD
                          </p>
                        </div>
                        <div className="text-xs md:text-sm font-semibold">
                          {(finalPrice * item.quantity).toFixed(2)} RSD
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Promo kod se primenjuje u korpi */}

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("subtotal")}
                    </span>
                    <span className="font-medium">
                      {subtotal.toFixed(2)} RSD
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("vat20")}</span>
                    <span className="font-medium">{pdv.toFixed(2)} RSD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("cart.delivery")}
                    </span>
                    <span className="font-medium">
                      {deliveryFee === 0
                        ? t("cart.free")
                        : `${deliveryFee.toFixed(2)} RSD`}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-base md:text-lg font-semibold">
                    {t("total")}
                  </span>
                  <span className="text-xl md:text-2xl font-bold">
                    {total.toFixed(2)} RSD
                  </span>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? (t("processing") ?? "Processing...")
                    : t("placeOrder")}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {t("checkout.consent") ?? ""}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
